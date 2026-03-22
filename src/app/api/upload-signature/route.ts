import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { CATEGORY_PATH_MAP, type AgeCategory } from '@/lib/constants';

// 获取上传签名 URL（前端直传 Supabase Storage）
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileType, folder } = body;
    
    if (!fileName || !fileType || !folder) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要参数' 
      }, { status: 400 });
    }
    
    // 支持的文件类型
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm'
    ];
    
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json({ 
        success: false, 
        error: `不支持的文件类型: ${fileType}` 
      }, { status: 400 });
    }
    
    // 生成文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    
    // 从 folder 中提取中文类目名
    const categoryMatch = folder.match(/age-category\/(.+)$/);
    const categoryChinese = categoryMatch ? categoryMatch[1] as AgeCategory : null;
    
    // Storage 路径
    let storagePath: string;
    if (categoryChinese && CATEGORY_PATH_MAP[categoryChinese]) {
      storagePath = `age-category/${CATEGORY_PATH_MAP[categoryChinese]}/${timestamp}_${randomStr}.${ext}`;
    } else {
      storagePath = `${folder}/${timestamp}_${randomStr}.${ext}`;
    }
    
    // 生成上传签名 URL
    const supabase = getSupabaseClient();
    const bucketName = 'images';
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUploadUrl(storagePath);
    
    if (error) {
      console.error('[Upload Signature] 生成签名URL失败:', error);
      return NextResponse.json({ 
        success: false, 
        error: '生成上传签名失败' 
      }, { status: 500 });
    }
    
    // 判断媒体类型
    const mediaType = fileType.startsWith('video/') ? 'video' : 'image';
    
    return NextResponse.json({
      success: true,
      data: {
        signedUrl: data.signedUrl,
        path: data.path,
        token: data.token,
        mediaType,
        category: categoryChinese || folder,
        publicUrl: `https://cpiqsancvuyziaaogzwt.supabase.co/storage/v1/object/public/images/${storagePath}`,
      }
    });
  } catch (error) {
    console.error('[Upload Signature] 错误:', error);
    return NextResponse.json({ 
      success: false, 
      error: '获取上传签名失败' 
    }, { status: 500 });
  }
}
