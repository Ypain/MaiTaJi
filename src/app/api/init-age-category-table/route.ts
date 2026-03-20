import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 初始化 age_category_content 表
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    
    // 使用 Supabase RPC 执行原始 SQL
    const { error } = await client.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS age_category_content (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          category VARCHAR(50) NOT NULL,
          media_url TEXT NOT NULL,
          media_type VARCHAR(20) NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS age_category_content_idx ON age_category_content(category);
      `
    });

    if (error) {
      // 如果 RPC 不存在，尝试直接插入一条测试数据来创建表
      // 这需要表已经存在，所以我们需要另一种方法
      console.log('RPC 方式失败，尝试其他方式:', error);
      
      return NextResponse.json({
        success: false,
        error: '请手动在 Supabase 控制台创建表',
        supabaseUrl: process.env.COZE_SUPABASE_URL,
        sql: `
CREATE TABLE IF NOT EXISTS age_category_content (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  media_url TEXT NOT NULL,
  media_type VARCHAR(20) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS age_category_content_idx ON age_category_content(category);`
      });
    }

    return NextResponse.json({
      success: true,
      message: '表创建成功'
    });
  } catch (error) {
    console.error('初始化表失败:', error);
    return NextResponse.json({
      success: false,
      error: '初始化失败',
      details: error instanceof Error ? error.message : '未知错误',
      supabaseUrl: process.env.COZE_SUPABASE_URL,
      sql: `
CREATE TABLE IF NOT EXISTS age_category_content (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  media_url TEXT NOT NULL,
  media_type VARCHAR(20) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS age_category_content_idx ON age_category_content(category);`
    });
  }
}
