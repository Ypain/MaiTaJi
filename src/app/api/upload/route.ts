import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';

// 延迟初始化存储客户端
let storage: S3Storage | null = null;

function getStorage(): S3Storage {
  if (!storage) {
    const endpointUrl = process.env.COZE_BUCKET_ENDPOINT_URL;
    const bucketName = process.env.COZE_BUCKET_NAME;
    
    if (!endpointUrl || !bucketName) {
      throw new Error('对象存储未配置。请在服务器上设置环境变量：\n' +
        '- COZE_BUCKET_ENDPOINT_URL\n' +
        '- COZE_BUCKET_NAME\n\n' +
        '或使用 Supabase Storage 替代方案。');
    }
    
    storage = new S3Storage({
      endpointUrl: endpointUrl,
      accessKey: "",
      secretKey: "",
      bucketName: bucketName,
      region: "cn-beijing",
    });
  }
  return storage;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'products';
    
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
    
    // 上传到对象存储
    const storageClient = getStorage();
    const key = await storageClient.uploadFile({
      fileContent: buffer,
      fileName: fileName,
      contentType: file.type,
    });
    
    // 生成访问URL（有效期7天）
    const url = await storageClient.generatePresignedUrl({
      key: key,
      expireTime: 604800, // 7天
    });
    
    // 判断媒体类型
    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
    
    return NextResponse.json({
      success: true,
      data: {
        key: key,
        url: url,
        mediaType: mediaType,
        fileName: file.name,
        fileSize: file.size,
      }
    });
  } catch (error) {
    console.error('上传失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '上传失败', 
        details: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    );
  }
}
