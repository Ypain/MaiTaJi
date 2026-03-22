import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI辅食推荐 - 智能宝宝辅食搭配',
  description: '麦塔记AI辅食推荐功能，根据宝宝月龄智能推荐营养辅食，提供详细食谱和注意事项。',
  keywords: ['辅食推荐', '宝宝辅食', '婴儿辅食', '辅食食谱', '6个月辅食', '婴儿饮食'],
  openGraph: {
    title: 'AI辅食推荐 - 智能宝宝辅食搭配 | 麦塔记',
    description: '根据宝宝月龄智能推荐营养辅食，提供详细食谱',
    url: 'https://www.maitaji.com/food',
  },
};

export default function FoodLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
