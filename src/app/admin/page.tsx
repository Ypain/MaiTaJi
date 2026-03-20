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
import { Upload, Trash2, Video, Loader2, FolderOpen, Download, X, ZoomIn } from 'lucide-react';
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
  const [filterCategory, setFilterCategory] = useState<string>('全部');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 检测设备类型
  const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // 检测是否支持 File System Access API
  const supportsFileSystemAccess = () => {
    if (typeof window === 'undefined') return false;
    return 'showSaveFilePicker' in window;
  };

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
        setMediaItems(result.data || []);
      } else {
        console.error('获取内容失败:', result.error);
        toast.error(result.error || '获取内容失败');
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

  const filteredItems = filterCategory === '全部' 
    ? mediaItems 
    : mediaItems.filter(item => item.category === filterCategory);

  const getCategoryCount = (category: string) => {
    return mediaItems.filter(item => item.category === category).length;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

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

    const previews = validFiles.map(file => URL.createObjectURL(file));
    
    setPendingFiles(prev => [...prev, ...validFiles]);
    setPendingPreviews(prev => [...prev, ...previews]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePendingFile = (index: number) => {
    URL.revokeObjectURL(pendingPreviews[index]);
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
    setPendingPreviews(prev => prev.filter((_, i) => i !== index));
  };

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
        toast.success(`成功上传 ${successCount} 个文件到「${selectedCategory}」类目`);
      }
      if (failCount > 0) {
        toast.error(`${failCount} 个文件上传失败`);
      }

      pendingPreviews.forEach(url => URL.revokeObjectURL(url));
      setPendingFiles([]);
      setPendingPreviews([]);
      
      fetchMediaItems();
    } catch (error) {
      console.error('上传失败:', error);
      toast.error('上传过程出错');
    } finally {
      setUploading(false);
    }
  };

  // 保存图片 - 手机端提示长按保存
  const handleDownload = async (item: MediaItem) => {
    setDownloadingId(item.id);
    
    try {
      const url = item.media_url;

      // 手机端：直接提示长按保存
      if (isMobile()) {
        toast.info('长按图片选择保存到手机');
        setDownloadingId(null);
        return;
      }

      // 电脑端：使用 File System Access API
      if (supportsFileSystemAccess()) {
        try {
          const ext = item.media_type === 'image' ? 'png' : 'mp4';
          const fileName = `${item.category}_${item.id.slice(0, 8)}.${ext}`;
          
          const response = await fetch(url);
          if (!response.ok) throw new Error('获取文件失败');
          const blob = await response.blob();
          
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: fileName,
            types: [{
              description: item.media_type === 'image' ? '图片' : '视频',
              accept: item.media_type === 'image' 
                ? { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }
                : { 'video/*': ['.mp4', '.webm'] }
            }]
          });
          
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          
          toast.success('文件已保存');
          setDownloadingId(null);
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') {
            setDownloadingId(null);
            return;
          }
        }
      }

      // 电脑端兜底：传统下载方式
      const ext = item.media_type === 'image' ? 'png' : 'mp4';
      const fileName = `${item.category}_${item.id.slice(0, 8)}.${ext}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('获取文件失败');
      const blob = await response.blob();
      
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      toast.success('下载已开始');
    } catch (error) {
      console.error('下载失败:', error);
      toast.error('下载失败，请重试');
    } finally {
      setDownloadingId(null);
    }
  };

  const openPreview = (item: MediaItem) => {
    setPreviewItem(item);
  };

  const closePreview = () => {
    setPreviewItem(null);
  };

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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
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
            <div className="mb-6">
              <Label className="text-base font-medium mb-2 block">选择上传的年龄段类目</Label>
              <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as AgeCategory)}>
                <SelectTrigger className="w-full md:w-[280px]">
                  <SelectValue placeholder="选择类目" />
                </SelectTrigger>
                <SelectContent>
                  {AGE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category} ({getCategoryCount(category)}个)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            {pendingFiles.length > 0 && (
              <div className="mb-6">
                <Label className="text-base font-medium mb-2 block">
                  待上传到「{selectedCategory}」类目的文件 ({pendingFiles.length} 个)
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
              已上传内容（共 {mediaItems.length} 个）
              {loading && <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label className="text-base font-medium mb-3 block">按类目筛选</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterCategory === '全部' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterCategory('全部')}
                  className={filterCategory === '全部' ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-200'}
                >
                  全部 ({mediaItems.length})
                </Button>
                {AGE_CATEGORIES.map((category) => {
                  const count = getCategoryCount(category);
                  return (
                    <Button
                      key={category}
                      variant={filterCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterCategory(category)}
                      className={filterCategory === category ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-200'}
                    >
                      {category} ({count})
                    </Button>
                  );
                })}
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FolderOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>{filterCategory === '全部' ? '暂无上传内容' : `「${filterCategory}」类目暂无内容`}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="group relative aspect-square rounded-lg overflow-hidden border border-amber-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => openPreview(item)}
                  >
                    {item.media_type === 'image' ? (
                      <img
                        src={item.media_url}
                        alt={item.category}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Video className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    <div className={`absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-all ${isMobile() ? 'bg-black/10' : ''}`}>
                      <div className={`bg-white/90 rounded-full p-2 shadow-lg ${isMobile() ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                        <ZoomIn className="h-5 w-5 text-gray-700" />
                      </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-2 pointer-events-none">
                      <div className="font-medium">{item.category}</div>
                      <div className="text-gray-300 text-[10px]">{item.media_type === 'image' ? '图片' : '视频'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 预览弹窗 */}
      {previewItem && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center">
            <button
              onClick={closePreview}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
            
            {previewItem.media_type === 'image' ? (
              <img
                src={previewItem.media_url}
                alt={previewItem.category}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <video
                src={previewItem.media_url}
                controls
                className="max-w-full max-h-[75vh] rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            
            <div className="mt-4 flex flex-col items-center gap-3 text-white">
              <div className="flex items-center gap-4">
                <span className="text-lg font-medium">{previewItem.category}</span>
                {previewItem.media_type === 'video' && (
                  <span className="text-sm text-gray-300">视频</span>
                )}
              </div>
              
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(previewItem);
                }}
                disabled={downloadingId === previewItem.id}
                className="bg-blue-500 hover:bg-blue-600 px-8"
              >
                {downloadingId === previewItem.id ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    处理中...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    保存图片
                  </span>
                )}
              </Button>
              
              {/* 手机端提示 */}
              {isMobile() && (
                <p className="text-gray-300 text-sm text-center">
                  点击按钮后，长按图片选择保存到手机
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
