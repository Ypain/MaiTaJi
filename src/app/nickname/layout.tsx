import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI取小名 - 免费智能宝宝小名生成',
  description: '麦塔记AI取小名功能，根据姓氏、性别、风格智能生成可爱有寓意的宝宝小名，免费使用。',
  keywords: ['AI取小名', '宝宝小名', '乳名', '小名生成', '免费取小名', '可爱小名'],
  openGraph: {
    title: 'AI取小名 - 免费智能宝宝小名生成 | 麦塔记',
    description: '智能生成可爱有寓意的宝宝小名，免费使用',
    url: 'https://www.maitaji.com/nickname',
  },
};

export default function NicknameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
