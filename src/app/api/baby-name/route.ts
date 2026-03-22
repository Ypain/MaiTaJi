import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { surname, gender, style, additionalInfo } = await request.json();
    
    if (!surname) {
      return NextResponse.json({ error: '请输入姓氏' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

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
${additionalInfo ? `- 其他信息：${additionalInfo}` : ''}

请提供3-5个好名字，每个名字附上简短的寓意解释。`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    const stream = client.stream(messages, {
      model: 'deepseek-v3-2-251201',
      temperature: 0.8,
    });

    // 创建 ReadableStream 用于 SSE
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
    console.error('AI起名失败:', error);
    return NextResponse.json(
      { error: '起名服务暂时不可用，请稍后重试' },
      { status: 500 }
    );
  }
}
