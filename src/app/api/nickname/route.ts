import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { surname, gender, style } = await request.json();
    
    if (!surname) {
      return NextResponse.json({ error: '请输入姓氏' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const systemPrompt = `你是一位专业的起名大师，擅长给宝宝起可爱、好听的小名（乳名）。

命名原则：
1. 小名要朗朗上口，好记好叫
2. 要有亲和力，充满爱意
3. 可以用叠字（如：小明明、豆豆）
4. 可以用食物、植物、动物等可爱的意象
5. 符合宝宝的性别特点

回复格式要求：
- 每个小名单独一行
- 格式：小名 | 寓意解释
- 提供5-8个推荐
- 简短总结`;

    const userPrompt = `请给宝宝起小名：
- 姓氏：${surname}
- 性别：${gender || '未指定'}
- 风格偏好：${style || '没有特别偏好'}

请提供5-8个可爱的小名，每个附上简短的寓意解释。`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    const stream = client.stream(messages, {
      model: 'deepseek-v3-2-251201',
      temperature: 0.9,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
            }
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
      { error: '服务暂时不可用，请稍后重试' },
      { status: 500 }
    );
  }
}
