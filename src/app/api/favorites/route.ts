import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { animalId } = body;
    
    if (!animalId) {
      return NextResponse.json(
        { error: '缺少动物ID' },
        { status: 400 }
      );
    }
    
    const client = getSupabaseClient();
    
    // 检查是否已收藏
    const { data: existingFavorite } = await client
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('animal_id', animalId)
      .single();
    
    if (existingFavorite) {
      // 取消收藏
      const { error } = await client
        .from('favorites')
        .delete()
        .eq('id', existingFavorite.id);
      
      if (error) {
        console.error('取消收藏失败:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ 
        message: '已取消收藏',
        action: 'removed'
      });
    } else {
      // 添加收藏
      const { error } = await client
        .from('favorites')
        .insert({
          user_id: user.id,
          animal_id: animalId,
        });
      
      if (error) {
        console.error('添加收藏失败:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ 
        message: '已添加到收藏',
        action: 'added'
      });
    }
  } catch (error) {
    console.error('收藏操作失败:', error);
    return NextResponse.json(
      { error: '收藏操作失败' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }
    
    const client = getSupabaseClient();
    
    // 获取用户收藏的动物ID
    const { data: favorites, error } = await client
      .from('favorites')
      .select(`
        id,
        animal_id,
        created_at,
        animals (
          id,
          name,
          species,
          description,
          image_url,
          habitat,
          diet,
          conservation_status
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('获取收藏列表失败:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    return NextResponse.json(
      { error: '获取收藏列表失败' },
      { status: 500 }
    );
  }
}
