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

    const systemPrompt = `你是一位专业的育儿顾问，拥有丰富的儿科医学和儿童发展知识。你的职责是为家长提供专业、实用的育儿建议。

回答原则：
1. 回答要专业准确，基于医学共识
2. 语言要通俗易懂，家长容易理解
3. 提供实用的操作建议
4. 如涉及医疗问题，提醒家长及时就医
5. 回答要全面但有重点

重要提示：对于紧急医疗情况，务必建议家长立即就医或拨打急救电话。`;

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
    console.error('AI育儿问答失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务暂时不可用，请稍后重试' },
      { status: 500 }
    );
  }
}
