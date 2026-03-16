import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    const client = getSupabaseClient();
    
    const { data: animals, error } = await client
      .from('animals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('获取动物列表失败:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ animals });
  } catch (error) {
    console.error('获取动物列表失败:', error);
    return NextResponse.json(
      { error: '获取动物列表失败' },
      { status: 500 }
    );
  }
}
