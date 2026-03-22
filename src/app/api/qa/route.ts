import { NextRequest, NextResponse } from 'next/server';

// 检测是否在沙箱环境
const isSandbox = !!process.env.COZE_PROJECT_DOMAIN_DEFAULT;

// 消息类型
type Message = { role: 'system' | 'user' | 'assistant'; content: string };

// 沙箱环境使用 SDK，独立部署使用原生 API
async function callDeepSeek(messages: Message[], options: { model: string; temperature: number }) {
  if (isSandbox) {
    const { LLMClient, Config } = await import('coze-coding-dev-sdk');
    const config = new Config();
    const client = new LLMClient(config, {});
    return client.stream(messages, options) as AsyncIterable<{ content: string }>;
  } else {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY 环境变量未设置');
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: options.model,
        messages,
        temperature: options.temperature,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API 错误: ${response.status} - ${error}`);
    }

    return response.body as ReadableStream<Uint8Array>;
  }
}

// 解析流式响应
async function* parseStream(stream: AsyncIterable<{ content: string }> | ReadableStream<Uint8Array>): AsyncGenerator<string> {
  if (stream instanceof ReadableStream) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
          try {
            const json = JSON.parse(line.slice(6));
            const content = json.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch { /* ignore */ }
        }
      }
    }
  } else {
    for await (const chunk of stream) {
      if (chunk.content) {
        yield chunk.content.toString();
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();
    
    if (!question) {
      return NextResponse.json({ error: '请输入问题' }, { status: 400 });
    }

    const systemPrompt = `你是一个智能助手，可以回答用户的各种问题。

回答原则：
1. 回答要准确、有帮助
2. 语言简洁明了，易于理解
3. 如果问题涉及专业知识，提供准确的信息
4. 如果不确定，诚实告知用户`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question },
    ];

    const stream = await callDeepSeek(messages, {
      model: isSandbox ? 'deepseek-v3-2-251201' : 'deepseek-chat',
      temperature: 0.9,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const content of parseStream(stream)) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI问答失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务暂时不可用，请稍后重试' },
      { status: 500 }
    );
  }
}
