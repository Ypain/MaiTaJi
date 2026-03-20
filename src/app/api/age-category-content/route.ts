import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET - 获取所有年龄段内容
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    let query = client
      .from('age_category_content')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: '查询失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('获取年龄段内容失败:', error);
    return NextResponse.json(
      { success: false, error: '获取内容失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// POST - 创建新的年龄段内容
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { category, mediaUrl, mediaType, description } = body;

    if (!category || !mediaUrl || !mediaType) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const { data, error } = await client
      .from('age_category_content')
      .insert([{
        category,
        media_url: mediaUrl,
        media_type: mediaType,
        description: description || null,
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: '创建失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('创建年龄段内容失败:', error);
    return NextResponse.json(
      { success: false, error: '创建内容失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// DELETE - 删除年龄段内容
export async function DELETE(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少内容ID' },
        { status: 400 }
      );
    }

    const { error } = await client
      .from('age_category_content')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { success: false, error: '删除失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    console.error('删除年龄段内容失败:', error);
    return NextResponse.json(
      { success: false, error: '删除内容失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
