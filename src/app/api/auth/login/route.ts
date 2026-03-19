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
    
    // 检测是否是 HTTPS 访问
    // 1. 检查 X-Forwarded-Proto 头（代理设置）
    // 2. 检查请求域名是否是 .coze.site（生产域名）
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const host = request.headers.get('host') || '';
    const isCozeDomain = host.includes('.coze.site');
    const isSecure = forwardedProto === 'https' || isCozeDomain;
    
    console.log(`[登录] Host: ${host}, X-Forwarded-Proto: ${forwardedProto}, isCozeDomain: ${isCozeDomain}, isSecure: ${isSecure}`);
    
    // 设置 cookie
    response.cookies.set('user_id', user.id, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    
    console.log(`[登录成功] 用户 ${user.username} 已登录，cookie secure: ${isSecure}`);
    
    return response;
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}
