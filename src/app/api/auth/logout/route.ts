import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('user_id');
    
    return NextResponse.json({ 
      message: '退出成功' 
    });
  } catch (error) {
    console.error('退出失败:', error);
    return NextResponse.json(
      { error: '退出失败' },
      { status: 500 }
    );
  }
}
