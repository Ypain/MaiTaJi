import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI问答 - 免费智能问答助手',
  description: '麦塔记AI问答功能，智能回答您的各种问题，免费使用，快速获取答案。',
  keywords: ['AI问答', '智能问答', '免费问答', 'AI助手', '在线问答'],
  openGraph: {
    title: 'AI问答 - 免费智能问答助手 | 麦塔记',
    description: '智能回答您的各种问题，免费使用',
    url: 'https://www.maitaji.com/qa',
  },
};

export default function QALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
