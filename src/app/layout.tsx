import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: {
    default: '麦塔记 - AI智能起名与母婴育儿服务平台',
    template: '%s | 麦塔记',
  },
  description: '麦塔记提供AI智能起名、AI取小名、AI问答、AI育儿问答、AI辅食推荐等免费服务，帮助父母记录宝宝成长每个瞬间。',
  keywords: ['AI起名', '宝宝起名', '取名字', '小名', '育儿问答', '辅食推荐', '预产期计算', '疫苗接种', '母婴'],
  authors: [{ name: '麦塔记' }],
  creator: '麦塔记',
  publisher: '麦塔记',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.maitaji.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '麦塔记 - AI智能起名与母婴育儿服务平台',
    description: '免费AI智能起名、育儿问答、辅食推荐等服务，陪伴宝宝健康成长',
    url: 'https://www.maitaji.com',
    siteName: '麦塔记',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '麦塔记 - AI智能起名与母婴育儿服务平台',
    description: '免费AI智能起名、育儿问答、辅食推荐等服务，陪伴宝宝健康成长',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="font-sans min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <Navbar />
        <main className="min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
        {/* 结构化数据 - SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: '麦塔记',
              url: 'https://www.maitaji.com',
              description: 'AI智能起名与母婴育儿服务平台',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://www.maitaji.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
