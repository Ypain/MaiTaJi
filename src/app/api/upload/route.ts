import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { CATEGORY_PATH_MAP, type AgeCategory } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';
    
    if (!file) {
      return NextResponse.json({ success: false, error: '未找到文件' }, { status: 400 });
    }
    
    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: '不支持的文件类型，仅支持 jpg/png/gif/webp/mp4/webm' }, { status: 400 });
    }
    
    // 检查文件大小 (最大 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: '文件大小不能超过50MB' }, { status: 400 });
    }
    
    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 生成文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    
    // 从 folder 中提取中文类目名（如 "age-category/出生" -> "出生"）
    const categoryMatch = folder.match(/age-category\/(.+)$/);
    const categoryChinese = categoryMatch ? categoryMatch[1] as AgeCategory : null;
    
    // Storage 路径使用英文，避免中文路径问题
    let storagePath: string;
    if (categoryChinese && CATEGORY_PATH_MAP[categoryChinese]) {
      storagePath = `age-category/${CATEGORY_PATH_MAP[categoryChinese]}/${timestamp}_${randomStr}.${ext}`;
    } else {
      storagePath = `${folder}/${timestamp}_${randomStr}.${ext}`;
    }
    
    // 使用 Supabase Storage 上传
    const supabase = getSupabaseClient();
    const bucketName = 'images';
    
    // 上传文件到 Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });
    
    if (error) {
      console.error('Supabase Storage 上传错误:', error);
      
      if (error.message.includes('not found') || error.message.includes('does not exist') || error.message.includes('Bucket not found')) {
        return NextResponse.json({
          success: false,
          error: '存储桶不存在',
          details: '请在 Supabase 控制台创建名为 "images" 的存储桶'
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: false,
        error: '上传失败',
        details: error.message
      }, { status: 500 });
    }
    
    // 获取公开访问 URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);
    
    // 判断媒体类型
    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
    
    return NextResponse.json({
      success: true,
      data: {
        key: data.path,
        url: urlData.publicUrl,
        mediaType: mediaType,
        fileName: file.name,
        fileSize: file.size,
        category: categoryChinese || folder, // 返回中文类目名，用于数据库记录
      }
    });
  } catch (error) {
    console.error('上传失败:', error);
    return NextResponse.json(
      { success: false, error: '上传失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
