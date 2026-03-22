'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calculator, Baby } from 'lucide-react';

export default function DueDatePage() {
  const [lastPeriod, setLastPeriod] = useState('');
  const [result, setResult] = useState<{
    dueDate: string;
    currentWeek: number;
    remainingDays: number;
    pregnancyDays: number;
  } | null>(null);

  const calculate = () => {
    if (!lastPeriod) return;

    const lmp = new Date(lastPeriod);
    const today = new Date();
    
    // 预产期 = 末次月经日期 + 280天
    const dueDate = new Date(lmp);
    dueDate.setDate(dueDate.getDate() + 280);
    
    // 计算孕周
    const pregnancyDays = Math.floor((today.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24));
    const currentWeek = Math.floor(pregnancyDays / 7);
    const remainingDays = Math.max(0, Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    setResult({
      dueDate: dueDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
      currentWeek: Math.max(0, currentWeek),
      remainingDays,
      pregnancyDays: Math.max(0, pregnancyDays),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">预产期计算</h1>
              <p className="text-sm text-white/80">计算预产期和孕周</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="lastPeriod" className="text-gray-700 font-medium">
                末次月经第一天
              </Label>
              <Input
                id="lastPeriod"
                type="date"
                value={lastPeriod}
                onChange={(e) => setLastPeriod(e.target.value)}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
              />
            </div>

            <Button
              onClick={calculate}
              disabled={!lastPeriod}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium py-6 text-base disabled:opacity-50"
            >
              计算
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="mt-4 border-0 shadow-lg">
            <CardHeader className="py-4">
              <CardTitle className="flex items-center gap-2 text-gray-800 text-base">
                <Baby className="h-5 w-5 text-orange-500" />
                计算结果
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">预产期</p>
                  <p className="text-lg font-bold text-orange-600">{result.dueDate}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">当前孕周</p>
                  <p className="text-lg font-bold text-amber-600">{result.currentWeek}周+</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">已怀孕天数</p>
                  <p className="text-lg font-bold text-yellow-600">{result.pregnancyDays}天</p>
                </div>
                <div className="bg-rose-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">距预产期</p>
                  <p className="text-lg font-bold text-rose-600">{result.remainingDays}天</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-4 border-0 shadow-sm bg-gray-50">
          <CardContent className="pt-4 pb-4">
            <h3 className="font-medium text-gray-700 mb-2 text-sm">计算说明</h3>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• 预产期 = 末次月经第一天 + 280天</li>
              <li>• 实际分娩日期可能提前或延后1-2周</li>
              <li>• 如月经周期不规律，建议以B超为准</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
