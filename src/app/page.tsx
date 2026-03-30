'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Baby, 
  MessageCircleQuestion, 
  MessageCircle,
  Utensils, 
  Sparkles, 
  Calculator,
  TrendingUp,
  Syringe,
  Share2,
  Link2,
  Check,
} from 'lucide-react';
import FollowUs from '@/components/FollowUs';

// 微信图标
const WechatIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.022-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
  </svg>
);

// 小红书图标
const XiaohongshuIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
  </svg>
);

// 功能卡片配置
const features = [
  {
    id: 'baby-name',
    title: 'AI取名',
    description: '为宝宝起一个寓意美好的名字',
    icon: Sparkles,
    color: 'from-pink-500 to-rose-500',
    href: '/baby-name',
    badge: '热门',
  },
  {
    id: 'nickname',
    title: 'AI取小名',
    description: '给宝宝起一个可爱的小名',
    icon: Baby,
    color: 'from-purple-500 to-indigo-500',
    href: '/nickname',
  },
  {
    id: 'qa',
    title: 'AI问答',
    description: '智能回答您的各种问题',
    icon: MessageCircleQuestion,
    color: 'from-blue-500 to-cyan-500',
    href: '/qa',
  },
  {
    id: 'baby-qa',
    title: 'AI育儿问答',
    description: '专业解答育儿过程中的疑问',
    icon: MessageCircle,
    color: 'from-indigo-500 to-purple-500',
    href: '/baby-qa',
  },
  {
    id: 'food',
    title: 'AI辅食推荐',
    description: '根据宝宝月龄推荐营养辅食',
    icon: Utensils,
    color: 'from-green-500 to-emerald-500',
    href: '/food',
  },
  {
    id: 'due-date',
    title: '预产期计算',
    description: '计算预产期和孕周',
    icon: Calculator,
    color: 'from-orange-500 to-amber-500',
    href: '/due-date',
  },
  {
    id: 'growth',
    title: '发育记录',
    description: '记录宝宝身高体重发育曲线',
    icon: TrendingUp,
    color: 'from-teal-500 to-green-500',
    href: '/growth',
  },
  {
    id: 'vaccine',
    title: '疫苗接种',
    description: '疫苗接种时间提醒',
    icon: Syringe,
    color: 'from-red-500 to-pink-500',
    href: '/vaccine',
  },
];

export default function HomePage() {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wechatCopied, setWechatCopied] = useState(false);

  useEffect(() => {
    // 检测是否为移动端
    const checkMobile = () => {
      setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 获取当前URL
  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return 'https://www.maitaq.com';
  };

  // 复制链接
  const handleCopyLink = async () => {
    const url = getShareUrl();
    
    // 方法1: 使用 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch {
        // 继续尝试备用方法
      }
    }
    
    // 方法2: 使用 execCommand
    try {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // 忽略错误
    }
  };

  // 微信分享
  const handleWechatShare = async () => {
    const url = getShareUrl();
    
    // 复制链接
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setWechatCopied(true);
      setTimeout(() => setWechatCopied(false), 2000);
    } catch {
      // 忽略错误
    }
    
    // 延迟尝试唤起微信
    setTimeout(() => {
      try {
        window.location.href = 'weixin://';
      } catch {
        // 忽略错误
      }
    }, 300);
  };

  // 小红书分享
  const handleXiaohongshuShare = async () => {
    await handleCopyLink();
    setShowShareDialog(false);
  };

  // 打开分享弹窗
  const handleShare = async () => {
    // 尝试使用原生分享（移动端）
    if (navigator.share) {
      try {
        await navigator.share({
          title: '麦塔记 - AI智能起名与母婴育儿服务平台',
          text: '免费AI智能起名、育儿问答、辅食推荐等服务，陪伴宝宝健康成长',
          url: getShareUrl(),
        });
        return;
      } catch {
        // 用户取消分享，显示弹窗
      }
    }
    setShowShareDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-lg text-white/90">记录美好时刻，陪伴宝宝成长</p>
        </div>
      </div>

      {/* 信任背书 */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-center gap-8 text-center">
            <div>
              <p className="text-2xl font-bold text-amber-600">10万+</p>
              <p className="text-xs text-gray-500">用户使用</p>
            </div>
            <div className="w-px bg-gray-200"></div>
            <div>
              <p className="text-2xl font-bold text-amber-600">50万+</p>
              <p className="text-xs text-gray-500">取名生成</p>
            </div>
            <div className="w-px bg-gray-200"></div>
            <div>
              <p className="text-2xl font-bold text-amber-600">98%</p>
              <p className="text-xs text-gray-500">好评率</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-6 bg-amber-500 rounded"></span>
            全部功能
          </h2>
          {/* 分享按钮只在移动端显示 */}
          {isMobile && (
            <button
              onClick={handleShare}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-sm">分享</span>
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.id} href={feature.href}>
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm overflow-hidden">
                  <CardContent className="p-4">
                    <div className="relative">
                      {/* Badge */}
                      {feature.badge && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full z-10">
                          {feature.badge}
                        </span>
                      )}
                      
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      
                      {/* Title */}
                      <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                      
                      {/* Description */}
                      <p className="text-xs text-gray-500 line-clamp-2">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
        
        {/* 公众号和视频号引流 */}
        <FollowUs />
      </div>

      {/* 分享弹窗 - 只在移动端显示 */}
      {isMobile && (
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>分享到</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4 py-4">
              {/* 复制链接 */}
              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${copied ? 'bg-green-500' : 'bg-gray-500'}`}>
                  {copied ? (
                    <Check className="h-6 w-6 text-white" />
                  ) : (
                    <Link2 className="h-6 w-6 text-white" />
                  )}
                </div>
                <span className="text-sm text-gray-700 font-medium">{copied ? '已复制' : '复制链接'}</span>
              </button>

              {/* 微信 */}
              <button
                onClick={handleWechatShare}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${wechatCopied ? 'bg-green-500' : 'bg-green-500'}`}>
                  {wechatCopied ? (
                    <Check className="h-6 w-6 text-white" />
                  ) : (
                    <WechatIcon />
                  )}
                </div>
                <span className="text-sm text-gray-700 font-medium">{wechatCopied ? '已复制，去微信' : '微信'}</span>
              </button>

              {/* 小红书 */}
              <button
                onClick={handleXiaohongshuShare}
                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center">
                  <XiaohongshuIcon />
                </div>
                <span className="text-sm text-gray-700 font-medium">小红书</span>
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center">复制链接后，打开微信发送给朋友</p>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
