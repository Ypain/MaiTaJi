import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ 
      message: '退出成功' 
    });
    
    response.cookies.set('user_id', '', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('退出失败:', error);
    return NextResponse.json(
      { error: '退出失败' },
      { status: 500 }
    );
  }
}
