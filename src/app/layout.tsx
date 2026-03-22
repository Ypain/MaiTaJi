import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: '宝宝起名 - AI智能起名，寓意美好',
  description: '为宝宝起一个美好的名字，AI智能起名，寓意美好，音韵和谐。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </body>
    </html>
  );
}
