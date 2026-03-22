'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Syringe, Construction } from 'lucide-react';

export default function VaccinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-violet-500 text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Syringe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">疫苗接种</h1>
              <p className="text-sm text-white/80">记录宝宝疫苗接种情况</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-8 pb-8 text-center">
            <Construction className="h-16 w-16 text-purple-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-800 mb-2">功能开发中</h2>
            <p className="text-gray-500 text-sm">该功能正在紧张开发中，敬请期待</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
