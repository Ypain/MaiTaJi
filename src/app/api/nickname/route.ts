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
    const { surname, gender, style } = await request.json();
    
    if (!surname) {
      return NextResponse.json({ error: '请输入姓氏' }, { status: 400 });
    }

    const systemPrompt = `你是一位专业的起名大师，擅长为宝宝取可爱、有寓意的小名（乳名）。

小名取名原则：
1. 亲切可爱，朗朗上口
2. 可以叠字、带"小"字或带"儿"字
3. 可以与食物、自然景物、美好事物相关
4. 避免与长辈重名或有不雅谐音

回复格式要求：
- 每个小名单独一行
- 格式：小名 | 寓意解释
- 提供5-8个推荐小名`;

    const userPrompt = `请为宝宝取小名：
- 姓氏：${surname}
- 性别：${gender || '未指定'}
- 风格偏好：${style || '没有特别偏好'}

请提供5-8个可爱的小名，每个附上简短解释。`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const stream = await callDeepSeek(messages, {
      model: isSandbox ? 'deepseek-v3-2-251201' : 'deepseek-chat',
      temperature: 0.95,
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
    console.error('AI取小名失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务暂时不可用，请稍后重试' },
      { status: 500 }
    );
  }
}
