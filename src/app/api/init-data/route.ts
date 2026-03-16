import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 商品图片URL配置（使用生成的图片）
const productImages = {
  // 服装区
  clothing: {
    tops: [
      { name: '时尚针织毛衣', url: '/clothing-tops-1.jpg' },
      { name: '简约白色T恤', url: '/clothing-tops-2.jpg' },
      { name: '优雅蕾丝衬衫', url: '/clothing-tops-3.jpg' },
      { name: '休闲条纹卫衣', url: '/clothing-tops-4.jpg' },
    ],
    pants: [
      { name: '高腰阔腿裤', url: '/clothing-pants-1.jpg' },
      { name: '修身牛仔裤', url: '/clothing-pants-2.jpg' },
      { name: '休闲运动裤', url: '/clothing-pants-3.jpg' },
      { name: '优雅西装裤', url: '/clothing-pants-4.jpg' },
    ],
    shoes: [
      { name: '优雅高跟鞋', url: '/clothing-shoes-1.jpg' },
      { name: '休闲运动鞋', url: '/clothing-shoes-2.jpg' },
      { name: '时尚短靴', url: '/clothing-shoes-3.jpg' },
      { name: '舒适平底鞋', url: '/clothing-shoes-4.jpg' },
    ],
    hats: [
      { name: '时尚贝雷帽', url: '/clothing-hats-1.jpg' },
      { name: '休闲鸭舌帽', url: '/clothing-hats-2.jpg' },
      { name: '优雅礼帽', url: '/clothing-hats-3.jpg' },
      { name: '冬日毛线帽', url: '/clothing-hats-4.jpg' },
    ],
  },
  // 美妆区（一级类目）
  beauty: [
    { name: '精致口红套装', url: '/beauty-1.jpg' },
    { name: '奢华香水', url: '/beauty-2.jpg' },
    { name: '护肤精华液', url: '/beauty-3.jpg' },
    { name: '眼影盘', url: '/beauty-4.jpg' },
  ],
  // 首饰区
  jewelry: {
    bracelets: [
      { name: '珍珠手镯', url: '/jewelry-bracelets-1.jpg' },
      { name: '黄金手镯', url: '/jewelry-bracelets-2.jpg' },
      { name: '银饰手镯', url: '/jewelry-bracelets-3.jpg' },
      { name: '水晶手镯', url: '/jewelry-bracelets-4.jpg' },
    ],
    necklaces: [
      { name: '钻石项链', url: '/jewelry-necklaces-1.jpg' },
      { name: '珍珠项链', url: '/jewelry-necklaces-2.jpg' },
      { name: '黄金项链', url: '/jewelry-necklaces-3.jpg' },
      { name: '银饰项链', url: '/jewelry-necklaces-4.jpg' },
    ],
    earrings: [
      { name: '钻石耳环', url: '/jewelry-earrings-1.jpg' },
      { name: '珍珠耳环', url: '/jewelry-earrings-2.jpg' },
      { name: '流苏耳环', url: '/jewelry-earrings-3.jpg' },
      { name: '简约耳钉', url: '/jewelry-earrings-4.jpg' },
    ],
    rings: [
      { name: '钻石戒指', url: '/jewelry-rings-1.jpg' },
      { name: '黄金戒指', url: '/jewelry-rings-2.jpg' },
      { name: '银饰戒指', url: '/jewelry-rings-3.jpg' },
      { name: '宝石戒指', url: '/jewelry-rings-4.jpg' },
    ],
    chains: [
      { name: '黄金手链', url: '/jewelry-chains-1.jpg' },
      { name: '银饰手链', url: '/jewelry-chains-2.jpg' },
      { name: '水晶手链', url: '/jewelry-chains-3.jpg' },
      { name: '珍珠手链', url: '/jewelry-chains-4.jpg' },
    ],
  },
};

// 买家展示图片
const showcaseImages = [
  { url: '/showcase-1.jpg', type: 'image' as const },
  { url: '/showcase-2.jpg', type: 'image' as const },
  { url: '/showcase-3.jpg', type: 'image' as const },
  { url: '/showcase-4.jpg', type: 'image' as const },
];

export async function POST() {
  try {
    const client = getSupabaseClient();
    
    // 检查是否已有数据
    const { data: existingProducts } = await client
      .from('products')
      .select('id')
      .limit(1);
    
    if (existingProducts && existingProducts.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: '数据已存在，跳过初始化' 
      });
    }
    
    const productsToInsert: any[] = [];
    
    // 添加服装区商品
    Object.entries(productImages.clothing).forEach(([subcategory, items]) => {
      items.forEach((item: any) => {
        productsToInsert.push({
          name: item.name,
          category: 'clothing',
          subcategory: subcategory,
          image_url: item.url,
        });
      });
    });
    
    // 添加美妆区商品（一级类目）
    productImages.beauty.forEach((item) => {
      productsToInsert.push({
        name: item.name,
        category: 'beauty',
        subcategory: null,
        image_url: item.url,
      });
    });
    
    // 添加首饰区商品
    Object.entries(productImages.jewelry).forEach(([subcategory, items]) => {
      items.forEach((item: any) => {
        productsToInsert.push({
          name: item.name,
          category: 'jewelry',
          subcategory: subcategory,
          image_url: item.url,
        });
      });
    });
    
    // 插入商品数据
    const { error: productError } = await client
      .from('products')
      .insert(productsToInsert);
    
    if (productError) {
      console.error('插入商品失败:', productError);
      return NextResponse.json({ 
        error: '插入商品失败', 
        details: productError.message 
      }, { status: 500 });
    }
    
    // 插入买家展示数据
    const showcasesToInsert = showcaseImages.map(item => ({
      media_url: item.url,
      media_type: item.type,
    }));
    
    const { error: showcaseError } = await client
      .from('showcases')
      .insert(showcasesToInsert);
    
    if (showcaseError) {
      console.error('插入买家展示失败:', showcaseError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '数据初始化成功',
      productsCount: productsToInsert.length,
      showcasesCount: showcasesToInsert.length,
    });
  } catch (error) {
    console.error('初始化数据失败:', error);
    return NextResponse.json(
      { error: '初始化数据失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
