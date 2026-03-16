import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: '动物世界 - 探索神奇的动物王国',
  description: '动物世界是一个关于动物的知识网站，您可以在这里了解各种动物的信息，还可以收藏您喜欢的动物。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
        <footer className="bg-gray-900 text-gray-400 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐾</span>
                <span className="text-lg font-semibold text-white">动物世界</span>
              </div>
              <p className="text-sm">
                © 2024 动物世界. 探索自然，保护动物
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
