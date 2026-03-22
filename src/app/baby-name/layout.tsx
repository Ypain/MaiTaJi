import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI取名 - 免费智能宝宝起名',
  description: '麦塔记AI取名功能，根据姓氏、性别、风格等智能生成寓意美好的宝宝名字，免费使用，每次生成不同结果。',
  keywords: ['AI取名', '宝宝起名', '智能起名', '免费起名', '名字生成', '男孩名字', '女孩名字'],
  openGraph: {
    title: 'AI取名 - 免费智能宝宝起名 | 麦塔记',
    description: '根据姓氏、性别、风格智能生成寓意美好的宝宝名字，免费使用',
    url: 'https://www.maitaji.com/baby-name',
  },
};

export default function BabyNameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
