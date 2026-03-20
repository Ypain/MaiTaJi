'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Trash2, Image, Video, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AGE_CATEGORIES, type AgeCategory, type MediaType } from '@/lib/constants';

interface MediaItem {
  id: string;
  category: string;
  media_url: string;
  media_type: string;
  description: string | null;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<AgeCategory>('出生');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 检查管理员权限
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.user?.role === 'admin') {
            setIsAdmin(true);
          } else {
            toast.error('无权限访问后台管理');
            router.push('/');
          }
        } else {
          toast.error('请先登录');
          router.push('/login');
        }
      } catch (error) {
        console.error('权限检查失败:', error);
        router.push('/login');
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  // 获取内容列表
  const fetchMediaItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/age-category-content');
      const result = await response.json();
      if (result.success) {
        setMediaItems(result.data);
      }
    } catch (error) {
      console.error('获取内容失败:', error);
      toast.error('获取内容失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchMediaItems();
    }
  }, [isAdmin]);

  // 选择文件
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 验证文件类型
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) {
        toast.error(`文件 ${file.name} 不是图片或视频格式`);
        return false;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast.error(`文件 ${file.name} 超过100MB限制`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // 生成预览
    const previews = validFiles.map(file => URL.createObjectURL(file));
    
    setPendingFiles(prev => [...prev, ...validFiles]);
    setPendingPreviews(prev => [...prev, ...previews]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 移除待上传文件
  const removePendingFile = (index: number) => {
    URL.revokeObjectURL(pendingPreviews[index]);
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
    setPendingPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // 提交上传
  const handleSubmit = async () => {
    if (pendingFiles.length === 0) {
      toast.error('请先选择要上传的文件');
      return;
    }

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (let i = 0; i < pendingFiles.length; i++) {
        const file = pendingFiles[i];
        const mediaType: MediaType = file.type.startsWith('image/') ? 'image' : 'video';

        try {
          // 上传文件到存储
          const formData = new FormData();
          formData.append('file', file);
          formData.append('folder', `age-category/${selectedCategory}`);

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          const uploadResult = await uploadResponse.json();
          if (!uploadResult.success) {
            throw new Error(uploadResult.error || '上传失败');
          }

          // 保存到数据库
          const saveResponse = await fetch('/api/age-category-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              category: selectedCategory,
              mediaUrl: uploadResult.data.url,
              mediaType: mediaType,
            }),
          });

          const saveResult = await saveResponse.json();
          if (!saveResult.success) {
            throw new Error(saveResult.error || '保存失败');
          }

          successCount++;
        } catch (error) {
          console.error(`文件 ${file.name} 上传失败:`, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`成功上传 ${successCount} 个文件`);
      }
      if (failCount > 0) {
        toast.error(`${failCount} 个文件上传失败`);
      }

      // 清空待上传列表
      pendingPreviews.forEach(url => URL.revokeObjectURL(url));
      setPendingFiles([]);
      setPendingPreviews([]);
      
      // 刷新列表
      fetchMediaItems();
    } catch (error) {
      console.error('上传失败:', error);
      toast.error('上传过程出错');
    } finally {
      setUploading(false);
    }
  };

  // 删除内容
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个内容吗？')) return;

    try {
      const response = await fetch(`/api/age-category-content?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '删除失败');
      }

      toast.success('删除成功');
      fetchMediaItems();
    } catch (error) {
      console.error('删除失败:', error);
      toast.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  // 权限检查中
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">验证权限中...</p>
        </div>
      </div>
    );
  }

  // 非管理员
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-amber-700">
            麦塔记 - 管理员后台
          </h1>
          <Button
            asChild
            className="bg-amber-600 hover:bg-amber-700"
          >
            <a href="/">返回首页</a>
          </Button>
        </div>

        {/* 上传区域 */}
        <Card className="mb-8 border-amber-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">内容上传</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 类目选择 */}
            <div className="mb-6">
              <Label className="text-base font-medium mb-2 block">选择年龄段类目</Label>
              <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as AgeCategory)}>
                <SelectTrigger className="w-full md:w-[280px]">
                  <SelectValue placeholder="选择类目" />
                </SelectTrigger>
                <SelectContent>
                  {AGE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 文件选择 */}
            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-dashed border-2 border-amber-300 hover:border-amber-500 h-32 w-full md:w-auto md:px-12"
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-amber-500" />
                  <span className="text-amber-600 font-medium">选择图片或视频</span>
                  <span className="text-xs text-gray-500">支持多选，单个文件最大100MB</span>
                </div>
              </Button>
            </div>

            {/* 待上传文件预览 */}
            {pendingFiles.length > 0 && (
              <div className="mb-6">
                <Label className="text-base font-medium mb-2 block">
                  待上传文件 ({pendingFiles.length} 个)
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {pendingFiles.map((file, index) => (
                    <div key={index} className="group relative aspect-square rounded-lg overflow-hidden border border-amber-200 bg-white">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={pendingPreviews[index]}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Video className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <button
                        onClick={() => removePendingFile(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 提交按钮 */}
            <Button
              onClick={handleSubmit}
              disabled={uploading || pendingFiles.length === 0}
              className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  上传中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  提交上传 ({pendingFiles.length} 个文件)
                </span>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 内容列表 */}
        <Card className="border-amber-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">
              已上传内容
              {loading && <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mediaItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Image className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>暂无上传内容</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {mediaItems.map((item) => (
                  <div key={item.id} className="group relative aspect-square rounded-lg overflow-hidden border border-amber-200 bg-white">
                    {item.media_type === 'image' ? (
                      <img
                        src={item.media_url}
                        alt={item.category}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Video className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1.5">
                      {item.category}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
