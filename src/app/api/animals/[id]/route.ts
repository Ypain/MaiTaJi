import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();
    
    const { data: animal, error } = await client
      .from('animals')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('获取动物详情失败:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!animal) {
      return NextResponse.json({ error: '动物不存在' }, { status: 404 });
    }
    
    return NextResponse.json({ animal });
  } catch (error) {
    console.error('获取动物详情失败:', error);
    return NextResponse.json(
      { error: '获取动物详情失败' },
      { status: 500 }
    );
  }
}
