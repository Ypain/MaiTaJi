import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取买家展示列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('showcases')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json({ error: '查询失败' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('获取买家展示失败:', error);
    return NextResponse.json(
      { error: '获取买家展示失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// 创建买家展示
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { mediaUrl, mediaType, title, description } = body;
    
    if (!mediaUrl || !mediaType) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }
    
    const { data, error } = await client
      .from('showcases')
      .insert([{
        media_url: mediaUrl,
        media_type: mediaType,
        title: title || null,
        description: description || null,
      }])
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: '创建失败', details: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('创建买家展示失败:', error);
    return NextResponse.json(
      { error: '创建买家展示失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// 删除买家展示
export async function DELETE(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: '缺少展示ID' }, { status: 400 });
    }
    
    const { error } = await client
      .from('showcases')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: '删除失败', details: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除买家展示失败:', error);
    return NextResponse.json(
      { error: '删除买家展示失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
