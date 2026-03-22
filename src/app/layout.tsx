import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: '麦塔记 - 记录美好时刻',
  description: '麦塔记是母婴育儿一站式服务平台，提供AI取名、育儿问答、辅食推荐等功能，记录美好时刻，陪伴宝宝成长。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <Navbar />
        <main className="min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </body>
    </html>
  );
}
