'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Camera, Play, X, Settings } from 'lucide-react';
import { toast } from 'sonner';

// 分类配置 - 麦塔记
const CATEGORIES = {
  clothing: {
    name: '服装区',
    subcategories: {
      tops: '上衣',
      pants: '裤子',
      shoes: '鞋子',
      hats: '帽子',
    },
  },
  beauty: {
    name: '美妆区',
    subcategories: {},
  },
  jewelry: {
    name: '首饰区',
    subcategories: {
      bracelets: '手镯',
      necklaces: '项链',
      earrings: '耳环',
      rings: '戒指',
      chains: '手链',
    },
  },
};

interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  image_url: string;
  created_at: string;
}

interface Showcase {
  id: string;
  media_url: string;
  media_type: string;
  title: string | null;
  description: string | null;
  created_at: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [activeCategory, setActiveCategory] = useState('clothing');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取商品
        const productsResponse = await fetch('/api/products');
        const productsResult = await productsResponse.json();
        if (productsResult.success) {
          setProducts(productsResult.data);
        }

        // 获取买家展示
        const showcasesResponse = await fetch('/api/showcases');
        const showcasesResult = await showcasesResponse.json();
        if (showcasesResult.success) {
          setShowcases(showcasesResult.data);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 上传买家展示
  const handleShowcaseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'showcases');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadResult = await uploadResponse.json();
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || '上传失败');
      }

      const showcaseResponse = await fetch('/api/showcases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaUrl: uploadResult.data.url,
          mediaType: uploadResult.data.mediaType,
        }),
      });

      const showcaseResult = await showcaseResponse.json();
      if (!showcaseResult.success) {
        throw new Error(showcaseResult.error || '创建展示失败');
      }

      toast.success('上传成功');
      const showcasesResponse = await fetch('/api/showcases');
      const showcasesResult = await showcasesResponse.json();
      if (showcasesResult.success) {
        setShowcases(showcasesResult.data);
      }
    } catch (error) {
      console.error('上传失败:', error);
      toast.error(error instanceof Error ? error.message : '上传失败');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 获取分类下的所有二级分类商品（按二级分类分组）
  const getProductsBySubcategory = () => {
    const categoryProducts = products.filter((p) => p.category === activeCategory);
    const subcategories = CATEGORIES[activeCategory as keyof typeof CATEGORIES].subcategories;
    
    if (Object.keys(subcategories).length === 0) {
      return [{ key: 'main', name: '', products: categoryProducts }];
    }

    return Object.entries(subcategories).map(([key, name]) => ({
      key,
      name: name as string,
      products: categoryProducts.filter((p) => p.subcategory === key),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-amber-700">
            麦塔记
          </h1>
          <Button
            asChild
            variant="ghost"
            className="text-gray-600 hover:text-amber-600 hover:bg-amber-50"
          >
            <a href="/admin">
              <Settings className="h-5 w-5 mr-2" />
              后台管理
            </a>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeCategory} onValueChange={(v) => {
          setActiveCategory(v);
        }}>
          <TabsList className="grid w-full grid-cols-3 bg-white border border-amber-200 mb-6">
            {Object.entries(CATEGORIES).map(([key, val]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
              >
                {val.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.keys(CATEGORIES).map((cat) => (
            <TabsContent key={cat} value={cat}>
              {getProductsBySubcategory().map((group) => (
                <div key={group.key || 'main'} className="mb-8">
                  {group.name && (
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <span className="w-1 h-6 bg-amber-600 rounded mr-3"></span>
                      {group.name}
                    </h2>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {group.products.map((product) => (
                      <Card
                        key={product.id}
                        className="group cursor-pointer overflow-hidden border-amber-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        onClick={() => setPreviewImage(product.image_url)}
                      >
                        <div className="aspect-square relative overflow-hidden">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <CardContent className="p-3">
                          <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        {/* 用户展示区 */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-1 h-8 bg-amber-600 rounded mr-3"></span>
            用户展示区
          </h2>

          {/* 展示列表 - 一行最多6个 */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
            {showcases.map((showcase) => (
              <div
                key={showcase.id}
                className="aspect-square relative rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => setPreviewImage(showcase.media_url)}
              >
                {showcase.media_type === 'video' ? (
                  <video
                    src={showcase.media_url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={showcase.media_url}
                    alt={showcase.title || '用户展示'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                {showcase.media_type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 底部长驻上传入口 */}
          <div className="bg-white rounded-xl p-4 border border-amber-200">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleShowcaseUpload}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  上传中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  上传你的展示（支持图片和视频）
                </span>
              )}
            </Button>
          </div>
        </section>
      </main>

      {/* 图片预览弹窗 */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            <X className="h-5 w-5" />
          </button>
          {previewImage && (
            <img
              src={previewImage}
              alt="预览"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-sm border-t border-amber-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2024 麦塔记 - 记录美好时刻</p>
        </div>
      </footer>
    </div>
  );
}
