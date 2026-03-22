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
    const { surname, gender, style, additionalInfo } = await request.json();
    
    if (!surname) {
      return NextResponse.json({ error: '请输入姓氏' }, { status: 400 });
    }

    const systemPrompt = `你是一位专业的起名大师，精通中国传统姓名学和现代命名艺术。你的任务是为宝宝起一个寓意美好、音韵和谐的好名字。

命名原则：
1. 名字要有美好寓意，体现父母对孩子的期望
2. 音韵要和谐，读起来朗朗上口
3. 字形要美观，易于书写
4. 考虑五行平衡（如果用户提供了相关信息）
5. 避免不雅谐音和生僻字

回复格式要求：
- 每个名字单独一行
- 格式：名字 | 寓意解释
- 提供3-5个推荐名字
- 最后简单总结命名思路`;

    const userPrompt = `请为宝宝起名：
- 姓氏：${surname}
- 性别：${gender || '未指定'}
- 偏好风格：${style || '没有特别偏好'}
${additionalInfo ? `- 其他期望：${additionalInfo}` : ''}

[本次请求唯一标识：${Date.now()}-${Math.random().toString(36).slice(2)}]

请提供3-5个好名字，每个名字附上简短的寓意解释。注意：每次生成必须完全不同的名字组合，不要重复之前的推荐。`;

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
    console.error('AI起名失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '起名服务暂时不可用，请稍后重试' },
      { status: 500 }
    );
  }
}
