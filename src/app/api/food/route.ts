import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { month, allergy } = await request.json();
    
    if (!month) {
      return NextResponse.json({ error: '请选择宝宝月龄' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const systemPrompt = `你是一位专业的儿童营养师，擅长为不同月龄的宝宝制定辅食计划。

辅食添加原则：
1. 由少到多，由稀到稠，由细到粗
2. 每次只添加一种新食物，观察3-5天
3. 避免添加盐、糖等调味品
4. 注意食物过敏风险
5. 保证营养均衡

回复格式要求：
- 推荐适合该月龄的辅食食材
- 提供具体的辅食制作方法（2-3个食谱）
- 注意事项和禁忌食物
- 简洁明了，易于操作`;

    const userPrompt = `请为宝宝推荐辅食：
- 月龄：${month}
- 过敏情况：${allergy || '无'}

请提供适合该月龄的辅食推荐，包括食材建议、食谱和注意事项。`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    const stream = client.stream(messages, {
      model: 'deepseek-v3-2-251201',
      temperature: 0.7,
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
    console.error('AI辅食推荐失败:', error);
    return NextResponse.json(
      { error: '服务暂时不可用，请稍后重试' },
      { status: 500 }
    );
  }
}
