import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 调试：检查请求头中的 cookie
    const cookieHeader = request.headers.get('cookie');
    console.log('[/api/auth/me] 请求 cookie:', cookieHeader || '无');
    
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('[/api/auth/me] 未找到用户，返回 401');
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }
    
    console.log(`[/api/auth/me] 找到用户: ${user.username}`);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    );
  }
}
