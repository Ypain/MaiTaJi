import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 同步 Storage 图片到数据库
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const projectUrl = process.env.COZE_SUPABASE_URL;
    const bucket = 'images';
    
    console.log('[同步图片] 开始同步');
    
    // 1. 列出 Storage 中 age-category 文件夹下的所有文件夹
    const { data: folders, error: listError } = await supabase.storage
      .from(bucket)
      .list('age-category', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
    if (listError) {
      console.error('[同步图片] 列出文件夹失败:', listError);
      return NextResponse.json({ 
        success: false, 
        error: `列出文件失败: ${listError.message}` 
      }, { status: 500 });
    }
    
    if (!folders || folders.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Storage 中 age-category 文件夹为空',
        synced: 0 
      });
    }
    
    // 2. 获取已存在的记录
    const { data: existingRecords, error: fetchError } = await supabase
      .from('age_category_content')
      .select('media_url');
    
    const existingUrls = new Set(
      (existingRecords || []).map((r: { media_url: string }) => r.media_url)
    );
    
    // 3. 遍历文件夹，同步图片
    const newRecords: Array<{
      category: string;
      media_url: string;
      media_type: string;
      description: string;
    }> = [];
    
    for (const folder of folders || []) {
      if (folder.name.startsWith('.')) continue;
      
      const folderName = folder.name;
      
      // 列出该文件夹下的所有文件
      const { data: files, error: filesError } = await supabase.storage
        .from(bucket)
        .list(`age-category/${folderName}`, {
          limit: 1000
        });
      
      if (filesError || !files) continue;
      
      // 过滤图片文件
      const imageFiles = files.filter(file => {
        const name = file.name.toLowerCase();
        return name.endsWith('.jpg') || name.endsWith('.jpeg') || 
               name.endsWith('.png') || name.endsWith('.gif') || 
               name.endsWith('.webp');
      });
      
      for (const file of imageFiles) {
        const mediaUrl = `${projectUrl}/storage/v1/object/public/${bucket}/age-category/${folderName}/${file.name}`;
        
        if (!existingUrls.has(mediaUrl)) {
          newRecords.push({
            category: folderName,
            media_url: mediaUrl,
            media_type: 'image',
            description: `同步自 Storage: age-category/${folderName}/${file.name}`
          });
        }
      }
    }
    
    if (newRecords.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: '所有图片已同步，无需更新',
        synced: 0 
      });
    }
    
    // 4. 批量插入新记录
    const { data: insertedData, error: insertError } = await supabase
      .from('age_category_content')
      .insert(newRecords)
      .select();
    
    if (insertError) {
      throw insertError;
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `成功同步 ${insertedData?.length || 0} 张图片到数据库`,
      synced: insertedData?.length || 0
    });
    
  } catch (error) {
    console.error('[同步图片] 同步失败:', error);
    return NextResponse.json(
      { success: false, error: `同步失败: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// 返回建表 SQL
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: '请执行 POST 请求同步 Storage 图片到数据库',
    sql: `CREATE TABLE IF NOT EXISTS age_category_content (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  media_url TEXT NOT NULL,
  media_type VARCHAR(20) NOT NULL DEFAULT 'image',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS age_category_content_idx ON age_category_content(category);`
  });
}
