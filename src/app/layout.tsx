import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: '麦塔记 - 记录美好时刻',
  description: '麦塔记是一个购物展示平台，您可以在这里浏览和收藏各种精选商品，记录您的美好时刻。',
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
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
        <footer className="bg-gray-900 text-gray-400 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📷</span>
                <span className="text-lg font-semibold text-white">麦塔记</span>
              </div>
              <p className="text-sm">
                © 2026 麦塔记. 记录美好时刻
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
