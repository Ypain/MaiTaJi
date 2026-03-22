'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Utensils, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const months = [
  '6个月', '7个月', '8个月', '9个月', '10个月', '11个月',
  '12个月', '13-18个月', '19-24个月', '2-3岁'
];

export default function FoodPage() {
  const [month, setMonth] = useState('');
  const [allergy, setAllergy] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!month) {
      toast.error('请选择宝宝月龄');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month,
          allergy: allergy || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('请求失败');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应');
      }

      const decoder = new TextDecoder();
      let accumulatedResult = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                accumulatedResult += data.content;
                setResult(accumulatedResult);
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }

      toast.success('推荐完成！');
    } catch (error) {
      console.error('推荐失败:', error);
      toast.error('服务暂时不可用，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      toast.success('已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI辅食推荐</h1>
              <p className="text-sm text-white/80">根据宝宝月龄推荐营养辅食</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-gray-700 font-medium text-sm">宝宝月龄</label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="border-green-200 focus:border-green-400">
                    <SelectValue placeholder="选择月龄" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-gray-700 font-medium text-sm">过敏情况</label>
                <Select value={allergy} onValueChange={setAllergy}>
                  <SelectTrigger className="border-green-200 focus:border-green-400">
                    <SelectValue placeholder="选择过敏情况" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="无">无过敏</SelectItem>
                    <SelectItem value="鸡蛋">鸡蛋过敏</SelectItem>
                    <SelectItem value="牛奶">牛奶过敏</SelectItem>
                    <SelectItem value="海鲜">海鲜过敏</SelectItem>
                    <SelectItem value="坚果">坚果过敏</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || !month}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-6 text-base disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  AI生成中...
                </span>
              ) : (
                <span>获取推荐</span>
              )}
            </Button>
          </CardContent>
        </Card>

        {(result || loading) && (
          <Card className="mt-4 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="flex items-center gap-2 text-gray-800 text-base">
                <Utensils className="h-5 w-5 text-green-500" />
                辅食推荐
              </CardTitle>
              {result && (
                <Button variant="ghost" size="sm" onClick={handleCopy} className="text-gray-500 hover:text-green-500 h-8 px-2">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="ml-1 text-xs">复制</span>
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed min-h-[100px] text-sm">
                {result}
                {loading && <span className="animate-pulse">▋</span>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
