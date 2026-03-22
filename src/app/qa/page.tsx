'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MessageCircle, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function QAPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!question.trim()) {
      toast.error('请输入您的问题');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
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

      toast.success('回答完成！');
    } catch (error) {
      console.error('问答失败:', error);
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

  const quickQuestions = [
    '今天天气怎么样？',
    '如何提高工作效率？',
    '推荐几本好书',
    '健康饮食的建议',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI问答</h1>
              <p className="text-sm text-white/80">智能回答您的各种问题</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6 space-y-5">
            <div className="space-y-2">
              <Textarea
                placeholder="请输入您的问题，AI将为您解答..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 min-h-[120px]"
                maxLength={1000}
              />
            </div>

            {/* 快捷问题 */}
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => setQuestion(q)}
                >
                  {q}
                </Button>
              ))}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || !question.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-6 text-base disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  AI思考中...
                </span>
              ) : (
                <span>提问</span>
              )}
            </Button>
          </CardContent>
        </Card>

        {(result || loading) && (
          <Card className="mt-4 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="flex items-center gap-2 text-gray-800 text-base">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                AI回答
              </CardTitle>
              {result && (
                <Button variant="ghost" size="sm" onClick={handleCopy} className="text-gray-500 hover:text-blue-500 h-8 px-2">
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
