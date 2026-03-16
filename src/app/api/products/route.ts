import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取商品列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const productId = searchParams.get('id');
    
    // 查询单个商品
    if (productId) {
      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (error) {
        return NextResponse.json({ error: '商品不存在' }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, data });
    }
    
    // 构建查询
    let query = client
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    // 按分类筛选
    if (category) {
      query = query.eq('category', category);
    }
    
    // 按二级分类筛选
    if (subcategory) {
      query = query.eq('subcategory', subcategory);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: '查询失败' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('获取商品失败:', error);
    return NextResponse.json(
      { error: '获取商品失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// 创建商品
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { name, category, subcategory, imageUrl, price, description } = body;
    
    if (!name || !category || !imageUrl) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }
    
    const { data, error } = await client
      .from('products')
      .insert([{
        name,
        category,
        subcategory: subcategory || null,
        image_url: imageUrl,
        price: price || null,
        description: description || null,
      }])
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: '创建失败', details: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('创建商品失败:', error);
    return NextResponse.json(
      { error: '创建商品失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// 删除商品
export async function DELETE(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: '缺少商品ID' }, { status: 400 });
    }
    
    const { error } = await client
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: '删除失败', details: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除商品失败:', error);
    return NextResponse.json(
      { error: '删除商品失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
