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
import { ArrowLeft, Baby, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function BabyNamePage() {
  const [surname, setSurname] = useState('');
  const [gender, setGender] = useState('');
  const [style, setStyle] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    if (!surname.trim()) {
      toast.error('请输入姓氏');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/baby-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surname: surname.trim(),
          gender: gender || undefined,
          style: style || undefined,
          additionalInfo: additionalInfo.trim() || undefined,
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

      toast.success('起名完成！');
    } catch (error) {
      console.error('起名失败:', error);
      toast.error('起名服务暂时不可用，请稍后重试');
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
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI取名</h1>
              <p className="text-sm text-white/80">为宝宝起一个寓意美好的名字</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-4">
        {/* Form Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6 space-y-5">
            {/* 姓氏 */}
            <div className="space-y-2">
              <Label htmlFor="surname" className="text-gray-700 font-medium">
                姓氏 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="surname"
                placeholder="请输入姓氏，如：王、李、张"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                maxLength={2}
              />
            </div>

            {/* 性别和风格 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">性别</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="border-amber-200 focus:border-amber-400">
                    <SelectValue placeholder="选择性别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="男">男孩</SelectItem>
                    <SelectItem value="女">女孩</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">偏好风格</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="border-amber-200 focus:border-amber-400">
                    <SelectValue placeholder="选择风格" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="古风">古风典雅</SelectItem>
                    <SelectItem value="现代">现代简约</SelectItem>
                    <SelectItem value="诗意">诗情画意</SelectItem>
                    <SelectItem value="大气">大气磅礴</SelectItem>
                    <SelectItem value="温柔">温柔婉约</SelectItem>
                    <SelectItem value="独特">独特新颖</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 补充信息 */}
            <div className="space-y-2">
              <Label htmlFor="additionalInfo" className="text-gray-700 font-medium">
                补充说明
              </Label>
              <Textarea
                id="additionalInfo"
                placeholder="可以描述对名字的期望，如：希望孩子健康快乐、聪明伶俐等"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="border-amber-200 focus:border-amber-400 focus:ring-amber-400 min-h-[80px]"
                maxLength={200}
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading || !surname.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium py-6 text-base disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  AI正在起名中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  开始起名
                </span>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Result Card */}
        {(result || loading) && (
          <Card className="mt-4 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="flex items-center gap-2 text-gray-800 text-base">
                <Baby className="h-5 w-5 text-pink-500" />
                起名结果
              </CardTitle>
              {result && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="text-gray-500 hover:text-pink-500 h-8 px-2"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="ml-1 text-xs">复制</span>
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div
                ref={resultRef}
                className="whitespace-pre-wrap text-gray-700 leading-relaxed min-h-[100px] text-sm"
              >
                {result}
                {loading && <span className="animate-pulse">▋</span>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 关注引导 - 结果出现后显示 */}
        {result && !loading && (
          <Card className="mt-4 border-0 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="py-4 text-center">
              <p className="text-gray-700 text-sm mb-3">想要更详细的名字解析？</p>
              <p className="text-amber-600 font-medium">关注公众号「麦塔记」获取专业解读</p>
              <p className="text-gray-400 text-xs mt-2">回复"取名"即可获得详细分析</p>
            </CardContent>
          </Card>
        )}

        {/* 重新生成按钮 */}
        {result && !loading && (
          <Button
            onClick={() => {
              setResult('');
              setSurname('');
              setGender('');
              setStyle('');
              setAdditionalInfo('');
            }}
            variant="outline"
            className="w-full mt-4 border-amber-300 text-amber-600 hover:bg-amber-50"
          >
            重新起名
          </Button>
        )}

        {/* Tips */}
        <div className="mt-4 text-center text-xs text-gray-400">
          <p>提示：AI起名仅供参考，最终名字由您决定</p>
        </div>
      </div>
    </div>
  );
}
