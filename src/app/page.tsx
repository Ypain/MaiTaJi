'use client';

import { useState, useRef } from 'react';
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
import { Baby, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function HomePage() {
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
              <Baby className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">宝宝起名</h1>
              <p className="text-xs text-gray-500">AI智能起名，寓意美好</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            为宝宝起一个美好的名字
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            输入姓氏和偏好，AI将为您生成寓意美好、音韵和谐的名字推荐
          </p>
        </div>

        {/* Form Card */}
        <Card className="mb-8 border-pink-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Sparkles className="h-5 w-5 text-pink-500" />
              起名信息
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
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
                className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                maxLength={2}
              />
            </div>

            {/* 性别和风格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">性别</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="border-pink-200 focus:border-pink-400">
                    <SelectValue placeholder="选择性别（可选）" />
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
                  <SelectTrigger className="border-pink-200 focus:border-pink-400">
                    <SelectValue placeholder="选择风格（可选）" />
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
                placeholder="可以描述对名字的期望，如：希望孩子健康快乐、聪明伶俐等（可选）"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 min-h-[80px]"
                maxLength={200}
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading || !surname.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium py-6 text-lg disabled:opacity-50"
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
          <Card className="border-pink-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-t-lg flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Baby className="h-5 w-5 text-pink-500" />
                起名结果
              </CardTitle>
              {result && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="text-gray-500 hover:text-pink-500"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              <div
                ref={resultRef}
                className="whitespace-pre-wrap text-gray-700 leading-relaxed min-h-[100px]"
              >
                {result}
                {loading && <span className="animate-pulse">▋</span>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>提示：AI起名仅供参考，最终名字由您决定</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm">© 2026 宝宝起名. 为宝宝起一个美好的名字</p>
        </div>
      </footer>
    </div>
  );
}
