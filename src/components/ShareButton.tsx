'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Share2, Link2, Check, MessageCircle, Twitter } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
  title?: string;
  description?: string;
  url?: string;
}

export function ShareButton({ title = '麦塔记', description = 'AI智能起名与母婴育儿服务平台', url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = `${title} - 麦塔记`;
  const shareText = description;

  // 复制链接
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('链接已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('复制失败，请手动复制');
    }
  };

  // 分享到微信（生成二维码提示）
  const shareToWechat = () => {
    toast.info('请截图分享到微信');
  };

  // 分享到微博
  const shareToWeibo = () => {
    const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle + ' - ' + shareText)}`;
    window.open(weiboUrl, '_blank', 'width=600,height=400');
  };

  // 分享到QQ
  const shareToQQ = () => {
    const qqUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}&desc=${encodeURIComponent(shareText)}`;
    window.open(qqUrl, '_blank', 'width=600,height=400');
  };

  // 使用原生分享API（移动端）
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success('分享成功');
      } catch {
        // 用户取消分享
      }
    } else {
      setOpen(true);
    }
  };

  // 检测是否支持原生分享
  const canNativeShare = typeof navigator !== 'undefined' && navigator.share;

  if (canNativeShare) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNativeShare}
        className="text-gray-500 hover:text-amber-500"
      >
        <Share2 className="h-4 w-4" />
        <span className="ml-1 text-xs">分享</span>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-amber-500"
        >
          <Share2 className="h-4 w-4" />
          <span className="ml-1 text-xs">分享</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>分享到</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4 py-4">
          {/* 微信 */}
          <button
            onClick={shareToWechat}
            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs text-gray-600">微信</span>
          </button>

          {/* 微博 */}
          <button
            onClick={shareToWeibo}
            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <Twitter className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs text-gray-600">微博</span>
          </button>

          {/* QQ */}
          <button
            onClick={shareToQQ}
            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="text-xs text-gray-600">QQ</span>
          </button>

          {/* 复制链接 */}
          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center">
              {copied ? (
                <Check className="h-6 w-6 text-white" />
              ) : (
                <Link2 className="h-6 w-6 text-white" />
              )}
            </div>
            <span className="text-xs text-gray-600">{copied ? '已复制' : '复制链接'}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
