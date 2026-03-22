import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '预产期计算器 - 准确计算预产期和孕周',
  description: '麦塔记预产期计算器，根据末次月经时间准确计算预产期、孕周和关键产检时间节点。',
  keywords: ['预产期计算', '预产期', '孕周计算', '孕期计算器', '怀孕计算', '产检时间'],
  openGraph: {
    title: '预产期计算器 - 准确计算预产期和孕周 | 麦塔记',
    description: '根据末次月经时间准确计算预产期、孕周和关键产检时间节点',
    url: 'https://www.maitaji.com/due-date',
  },
};

export default function DueDateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
