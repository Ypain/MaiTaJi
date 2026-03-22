import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 删除所有图片记录和云端文件
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const bucket = 'images';
    
    console.log('[清空图片] 开始');
    
    // 1. 列出 age-category 文件夹下所有文件
    const { data: folders, error: listError } = await supabase.storage
      .from(bucket)
      .list('age-category', { limit: 1000 });
    
    if (listError) {
      console.error('[清空图片] 列出文件夹失败:', listError);
    }
    
    let deletedFiles = 0;
    
    // 2. 删除每个文件夹下的所有文件
    if (folders && folders.length > 0) {
      for (const folder of folders) {
        if (folder.name.startsWith('.')) continue;
        
        const { data: files } = await supabase.storage
          .from(bucket)
          .list(`age-category/${folder.name}`, { limit: 1000 });
        
        if (files && files.length > 0) {
          const filePaths = files.map(f => `age-category/${folder.name}/${f.name}`);
          
          const { error: deleteError } = await supabase.storage
            .from(bucket)
            .remove(filePaths);
          
          if (deleteError) {
            console.error(`[清空图片] 删除文件夹 ${folder.name} 失败:`, deleteError);
          } else {
            deletedFiles += files.length;
            console.log(`[清空图片] 删除文件夹 ${folder.name}: ${files.length} 个文件`);
          }
        }
      }
    }
    
    // 3. 清空数据库记录
    const { error: dbError } = await supabase
      .from('age_category_content')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 删除所有记录
    
    if (dbError) {
      console.error('[清空图片] 清空数据库失败:', dbError);
    }
    
    // 4. 确认清空
    const { count } = await supabase
      .from('age_category_content')
      .select('*', { count: 'exact', head: true });
    
    return NextResponse.json({
      success: true,
      message: `已删除云端 ${deletedFiles} 个文件，数据库记录已清空`,
      deletedFiles,
      remainingRecords: count || 0
    });
    
  } catch (error) {
    console.error('[清空图片] 失败:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// 查看当前统计或修正分类
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
      await supabase
        .from('age_category_content')
        .update({ category: correction.new })
        .eq('category', correction.old);
    }
    
    // 同步新图片
    const { data: folders } = await supabase.storage
      .from(bucket)
      .list('age-category', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });
    
    if (!folders || folders.length === 0) {
      return NextResponse.json({ success: true, message: 'Storage 文件夹为空', synced: 0 });
    }
    
    const { data: existingRecords } = await supabase
      .from('age_category_content')
      .select('media_url');
    
    const existingUrls = new Set(
      (existingRecords || []).map((r: { media_url: string }) => r.media_url)
    );
    
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
      const { data: insertedData } = await supabase
        .from('age_category_content')
        .insert(newRecords)
        .select();
      
      synced = insertedData?.length || 0;
    }
    
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
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
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
    stats
  });
}
