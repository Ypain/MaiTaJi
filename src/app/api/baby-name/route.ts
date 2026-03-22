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

// 生成随机参考字
function getRandomChars(count: number): string {
  const chars = '明德志远承瀚宇轩浩然泽睿博雅俊逸晨曦景行思齐文博弘毅嘉禾瑞霖雨泽俊杰天翔乐安康宁寿福喜安泰和顺';
  let result = '';
  for (let i = 0; i < count; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { surname, gender, style, additionalInfo } = await request.json();
    
    if (!surname) {
      return NextResponse.json({ error: '请输入姓氏' }, { status: 400 });
    }

    const randomId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const randomChars = getRandomChars(4);

    const systemPrompt = `你是一位专业的起名大师，精通中国传统姓名学和现代命名艺术。

【重要规则】每次请求必须生成完全不同的名字组合！
- 禁止重复使用常见的"承远""明远""景行"等名字
- 必须根据本次随机参考字：${randomChars} 来创意组合
- 每次都要用全新的字词组合

命名原则：
1. 名字要有美好寓意
2. 音韵和谐，朗朗上口
3. 字形美观，易于书写
4. 避免不雅谐音和生僻字

回复格式：
- 每个名字单独一行
- 格式：名字 | 寓意解释
- 提供3-5个推荐名字`;

    const userPrompt = `请为宝宝起名：
- 姓氏：${surname}
- 性别：${gender || '未指定'}
- 偏好风格：${style || '没有特别偏好'}
${additionalInfo ? `- 其他期望：${additionalInfo}` : ''}

【随机参考字：${randomChars}】
【请求ID：${randomId}】

请根据随机参考字创意组合，提供3-5个完全不同的名字。`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const stream = await callDeepSeek(messages, {
      model: isSandbox ? 'deepseek-v3-2-251201' : 'deepseek-chat',
      temperature: 1.2,
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
