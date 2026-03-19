import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return NextResponse.json(
        { error: '账号和密码都是必填项' },
        { status: 400 }
      );
    }
    
    const user = await authenticateUser(username, password);
    
    if (!user) {
      return NextResponse.json(
        { error: '账号或密码错误' },
        { status: 401 }
      );
    }
    
    // 创建响应并设置 cookie
    const response = NextResponse.json({ 
      message: '登录成功',
      user 
    });
    
    // 检测是否是 HTTPS 环境
    const isSecure = request.headers.get('x-forwarded-proto') === 'https' || 
                     request.nextUrl.protocol === 'https:';
    
    console.log(`[登录] 协议: ${request.nextUrl.protocol}, X-Forwarded-Proto: ${request.headers.get('x-forwarded-proto')}, isSecure: ${isSecure}`);
    
    // 设置 cookie - 根据环境动态配置
    response.cookies.set('user_id', user.id, {
      httpOnly: true,
      secure: isSecure, // HTTPS 环境下必须为 true
      sameSite: isSecure ? 'none' : 'lax', // HTTPS 下需要 'none' 才能跨站携带
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    
    console.log(`[登录成功] 用户 ${user.username} (${user.id}) 已登录，cookie 已设置 (secure: ${isSecure}, sameSite: ${isSecure ? 'none' : 'lax'})`);
    
    return response;
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}
