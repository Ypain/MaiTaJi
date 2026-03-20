import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

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
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${folder}/${timestamp}_${safeName}`;
    
    // 使用 Supabase Storage 上传
    const supabase = getSupabaseClient();
    
    // 先确保 bucket 存在（使用默认的 bucket）
    const bucketName = 'images';
    
    // 上传文件到 Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });
    
    if (error) {
      console.error('Supabase Storage 上传错误:', error);
      
      // 如果 bucket 不存在，尝试创建
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        return NextResponse.json({
          success: false,
          error: '存储桶不存在',
          details: '请在 Supabase 控制台创建名为 "images" 的存储桶：\n' +
            '1. 进入 Supabase Dashboard → Storage\n' +
            '2. 点击 "Create a new bucket"\n' +
            '3. 名称输入 "images"\n' +
            '4. 勾选 "Public bucket"\n' +
            '5. 点击创建'
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
