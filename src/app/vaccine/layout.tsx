import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '疫苗接种时间表 - 2026年儿童疫苗接种指南',
  description: '麦塔记疫苗接种功能，提供2026年最新儿童疫苗接种时间表，包含免费和自费疫苗，接种注意事项。',
  keywords: ['疫苗接种', '儿童疫苗', '疫苗时间表', '宝宝疫苗', '一类疫苗', '二类疫苗', '疫苗接种时间'],
  openGraph: {
    title: '疫苗接种时间表 - 2026年儿童疫苗接种指南 | 麦塔记',
    description: '2026年最新儿童疫苗接种时间表，包含免费和自费疫苗',
    url: 'https://www.maitaji.com/vaccine',
  },
};

export default function VaccineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
