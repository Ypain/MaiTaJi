'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Upload, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

// 分类配置
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

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('clothing');
  const [subcategory, setSubcategory] = useState('');
  const [productName, setProductName] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取商品列表
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('获取商品失败:', error);
      toast.error('获取商品失败');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 上传图片
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!productName) {
      toast.error('请输入商品名称');
      return;
    }

    if (!category) {
      toast.error('请选择分类');
      return;
    }

    // 美妆区不需要二级分类，其他需要
    if (category !== 'beauty' && !subcategory) {
      toast.error('请选择二级分类');
      return;
    }

    setUploading(true);
    try {
      // 上传图片
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadResult = await uploadResponse.json();
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || '上传失败');
      }

      // 创建商品
      const productResponse = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productName,
          category: category,
          subcategory: category === 'beauty' ? null : subcategory,
          imageUrl: uploadResult.data.url,
        }),
      });

      const productResult = await productResponse.json();
      if (!productResult.success) {
        throw new Error(productResult.error || '创建商品失败');
      }

      toast.success('商品添加成功');
      setProductName('');
      setSubcategory('');
      fetchProducts();
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

  // 删除商品
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个商品吗？')) return;

    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '删除失败');
      }

      toast.success('删除成功');
      fetchProducts();
    } catch (error) {
      console.error('删除失败:', error);
      toast.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  // 初始化数据
  const handleInitData = async () => {
    try {
      const response = await fetch('/api/init-data', {
        method: 'POST',
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`数据初始化成功！添加了 ${result.productsCount} 个商品和 ${result.showcasesCount} 个买家展示`);
        fetchProducts();
      } else {
        toast.info(result.message || '数据已存在');
      }
    } catch (error) {
      console.error('初始化数据失败:', error);
      toast.error('初始化数据失败');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            买她趣 - 后台管理
          </h1>
          <div className="flex gap-3">
            <Button
              onClick={handleInitData}
              variant="outline"
              className="border-pink-200 hover:bg-pink-50"
            >
              初始化示例数据
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              <a href="/">返回首页</a>
            </Button>
          </div>
        </div>

        {/* 上传区域 */}
        <Card className="mb-8 border-pink-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">添加商品</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="category">一级分类</Label>
                <Select value={category} onValueChange={(v) => {
                  setCategory(v);
                  setSubcategory('');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORIES).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{val.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {category !== 'beauty' && (
                <div>
                  <Label htmlFor="subcategory">二级分类</Label>
                  <Select value={subcategory} onValueChange={setSubcategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择二级分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORIES[category as keyof typeof CATEGORIES].subcategories).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className={category === 'beauty' ? 'md:col-span-2' : ''}>
                <Label htmlFor="name">商品名称</Label>
                <Input
                  id="name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="输入商品名称"
                />
              </div>

              <div className="flex items-end">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleUpload}
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
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
                      <Upload className="h-4 w-4" />
                      上传图片
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 商品列表 */}
        <Tabs defaultValue="clothing" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-pink-100">
            <TabsTrigger value="clothing" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
              服装区
            </TabsTrigger>
            <TabsTrigger value="beauty" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
              美妆区
            </TabsTrigger>
            <TabsTrigger value="jewelry" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
              首饰区
            </TabsTrigger>
          </TabsList>

          {Object.keys(CATEGORIES).map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {products
                  .filter((p) => p.category === cat)
                  .map((product) => (
                    <Card key={product.id} className="group relative overflow-hidden border-pink-100">
                      <div className="aspect-square relative">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <CardContent className="p-3">
                        <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                        {product.subcategory && (
                          <p className="text-xs text-gray-500">
                            {(() => {
                              const subs = CATEGORIES[cat as keyof typeof CATEGORIES].subcategories;
                              if (typeof subs === 'object' && subs !== null && product.subcategory in subs) {
                                return (subs as Record<string, string>)[product.subcategory];
                              }
                              return product.subcategory;
                            })()}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
