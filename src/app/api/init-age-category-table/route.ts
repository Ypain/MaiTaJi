import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 修正分类名称并同步
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const projectUrl = process.env.COZE_SUPABASE_URL;
    const bucket = 'images';
    
    console.log('[同步图片] 开始');
    
    // 先修正已存在的分类名称
    const corrections = [
      { old: '___', new: '四个月' },
      { old: '__', new: '出生' },
      { old: 'born', new: '四个月' }
    ];
    
    for (const correction of corrections) {
      const { error } = await supabase
        .from('age_category_content')
        .update({ category: correction.new })
        .eq('category', correction.old);
      
      if (error) {
        console.log(`[修正分类] ${correction.old} -> ${correction.new} 失败:`, error.message);
      } else {
        console.log(`[修正分类] ${correction.old} -> ${correction.new} 完成`);
      }
    }
    
    // 同步新图片
    const { data: folders, error: listError } = await supabase.storage
      .from(bucket)
      .list('age-category', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
    if (listError) {
      return NextResponse.json({ success: false, error: listError.message }, { status: 500 });
    }
    
    if (!folders || folders.length === 0) {
      return NextResponse.json({ success: true, message: 'Storage 文件夹为空', synced: 0 });
    }
    
    // 获取已存在的记录
    const { data: existingRecords } = await supabase
      .from('age_category_content')
      .select('media_url');
    
    const existingUrls = new Set(
      (existingRecords || []).map((r: { media_url: string }) => r.media_url)
    );
    
    // 分类映射
    const categoryMap: Record<string, string> = {
      '___': '四个月',
      '__': '出生',
      'born': '四个月'
    };
    
    const newRecords: Array<{
      category: string;
      media_url: string;
      media_type: string;
      description: string;
    }> = [];
    
    for (const folder of folders || []) {
      if (folder.name.startsWith('.')) continue;
      
      const folderName = folder.name;
      const categoryName = categoryMap[folderName] || folderName;
      
      const { data: files } = await supabase.storage
        .from(bucket)
        .list(`age-category/${folderName}`, { limit: 1000 });
      
      if (!files) continue;
      
      const mediaFiles = files.filter(file => {
        const name = file.name.toLowerCase();
        return name.endsWith('.jpg') || name.endsWith('.jpeg') || 
               name.endsWith('.png') || name.endsWith('.gif') || 
               name.endsWith('.webp') || name.endsWith('.mp4') || 
               name.endsWith('.webm');
      });
      
      for (const file of mediaFiles) {
        const mediaUrl = `${projectUrl}/storage/v1/object/public/${bucket}/age-category/${folderName}/${file.name}`;
        
        if (!existingUrls.has(mediaUrl)) {
          const isVideo = file.name.toLowerCase().endsWith('.mp4') || file.name.toLowerCase().endsWith('.webm');
          newRecords.push({
            category: categoryName,
            media_url: mediaUrl,
            media_type: isVideo ? 'video' : 'image',
            description: `同步自 Storage: age-category/${folderName}/${file.name}`
          });
        }
      }
    }
    
    let synced = 0;
    if (newRecords.length > 0) {
      const { data: insertedData, error: insertError } = await supabase
        .from('age_category_content')
        .insert(newRecords)
        .select();
      
      if (insertError) {
        console.error('[同步图片] 插入失败:', insertError);
      } else {
        synced = insertedData?.length || 0;
      }
    }
    
    // 返回统计
    const { data: allRecords } = await supabase
      .from('age_category_content')
      .select('category, media_type');
    
    const stats: Record<string, { images: number; videos: number }> = {};
    for (const r of allRecords || []) {
      if (!stats[r.category]) stats[r.category] = { images: 0, videos: 0 };
      if (r.media_type === 'video') stats[r.category].videos++;
      else stats[r.category].images++;
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `分类已修正，新同步 ${synced} 条`,
      synced,
      stats
    });
    
  } catch (error) {
    console.error('[同步图片] 失败:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// 查看当前统计
export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();
  
  const { data: allRecords } = await supabase
    .from('age_category_content')
    .select('category, media_type');
  
  const stats: Record<string, { images: number; videos: number }> = {};
  for (const r of allRecords || []) {
    if (!stats[r.category]) stats[r.category] = { images: 0, videos: 0 };
    if (r.media_type === 'video') stats[r.category].videos++;
    else stats[r.category].images++;
  }
  
  return NextResponse.json({
    success: true,
    total: allRecords?.length || 0,
    stats,
    sql: `CREATE TABLE IF NOT EXISTS age_category_content (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  media_url TEXT NOT NULL,
  media_type VARCHAR(20) NOT NULL DEFAULT 'image',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`
  });
}
