'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Baby, Loader2, Copy, Check, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { ShareButton } from '@/components/ShareButton';

export default function NicknamePage() {
  const [surname, setSurname] = useState('');
  const [gender, setGender] = useState('');
  const [style, setStyle] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!surname.trim()) {
      toast.error('请输入姓氏');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surname: surname.trim(),
          gender: gender || undefined,
          style: style || undefined,
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

      toast.success('生成完成！');
    } catch (error) {
      console.error('生成失败:', error);
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
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Baby className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI取小名</h1>
              <p className="text-sm text-white/80">给宝宝起一个可爱的小名</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="surname" className="text-gray-700 font-medium">
                姓氏 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="surname"
                placeholder="请输入姓氏"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                maxLength={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">性别</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="border-purple-200 focus:border-purple-400">
                    <SelectValue placeholder="选择性别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="男">男孩</SelectItem>
                    <SelectItem value="女">女孩</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">风格</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="border-purple-200 focus:border-purple-400">
                    <SelectValue placeholder="选择风格" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="可爱">可爱萌趣</SelectItem>
                    <SelectItem value="叠字">叠字音</SelectItem>
                    <SelectItem value="食物">食物系</SelectItem>
                    <SelectItem value="自然">自然系</SelectItem>
                    <SelectItem value="传统">传统吉祥</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || !surname.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium py-6 text-base disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  AI生成中...
                </span>
              ) : (
                <span>生成小名</span>
              )}
            </Button>
          </CardContent>
        </Card>

        {(result || loading) && (
          <Card className="mt-4 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="flex items-center gap-2 text-gray-800 text-base">
                <Baby className="h-5 w-5 text-purple-500" />
                小名推荐
              </CardTitle>
              {result && (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={handleCopy} className="text-gray-500 hover:text-purple-500 h-8 px-2">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span className="ml-1 text-xs">复制</span>
                  </Button>
                  <ShareButton
                    title="AI取小名结果"
                    description={`我用麦塔记AI给宝宝起了个可爱的小名，快来看看吧！\n\n${result}`}
                  />
                </div>
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
