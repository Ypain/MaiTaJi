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
    
    response.cookies.set('user_id', user.id, {
      httpOnly: true,
      secure: false, // 开发环境设为 false
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}
