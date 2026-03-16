import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';

const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: "",
  secretKey: "",
  bucketName: process.env.COZE_BUCKET_NAME,
  region: "cn-beijing",
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'products';
    
    if (!file) {
      return NextResponse.json({ error: '未找到文件' }, { status: 400 });
    }
    
    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: '不支持的文件类型' }, { status: 400 });
    }
    
    // 检查文件大小 (最大 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: '文件大小不能超过50MB' }, { status: 400 });
    }
    
    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 生成文件名
    const ext = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const fileName = `${folder}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    
    // 上传到对象存储
    const key = await storage.uploadFile({
      fileContent: buffer,
      fileName: fileName,
      contentType: file.type,
    });
    
    // 生成访问URL（有效期7天）
    const url = await storage.generatePresignedUrl({
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
      { error: '上传失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
