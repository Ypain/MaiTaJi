import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth';
import { cookies } from 'next/headers';

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
    
    if (!username.trim()) {
      return NextResponse.json(
        { error: '账号不能为空' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少6位' },
        { status: 400 }
      );
    }
    
    const user = await createUser(username, password);
    
    if (!user) {
      return NextResponse.json(
        { error: '注册失败，账号可能已被使用' },
        { status: 400 }
      );
    }
    
    // 设置 cookie
    const cookieStore = await cookies();
    cookieStore.set('user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7天
    });
    
    return NextResponse.json({ 
      message: '注册成功',
      user 
    });
  } catch (error) {
    console.error('注册失败:', error);
    return NextResponse.json(
      { error: '注册失败' },
      { status: 500 }
    );
  }
}
