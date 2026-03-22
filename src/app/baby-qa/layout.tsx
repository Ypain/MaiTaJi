import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI育儿问答 - 专业育儿问题解答',
  description: '麦塔记AI育儿问答功能，专业解答宝宝辅食、睡眠、发育、健康等育儿问题，免费使用。',
  keywords: ['育儿问答', '宝宝问题', '育儿咨询', '婴儿护理', '育儿知识', '新生儿护理'],
  openGraph: {
    title: 'AI育儿问答 - 专业育儿问题解答 | 麦塔记',
    description: '专业解答宝宝辅食、睡眠、发育、健康等育儿问题',
    url: 'https://www.maitaji.com/baby-qa',
  },
};

export default function BabyQALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
