'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
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
  Check
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [copied, setCopied] = useState(false);

  // 分享函数
  const handleShare = async () => {
    const shareData = {
      title: '麦塔记 - AI智能起名与母婴育儿服务平台',
      text: '免费AI智能起名、育儿问答、辅食推荐等服务，陪伴宝宝健康成长',
      url: window.location.href,
    };
    
    // 尝试使用原生分享
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // 用户取消分享，不做处理
      }
    }
    
    // 不支持原生分享或取消，复制链接
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('链接已复制，快去分享给朋友吧！');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('复制失败，请手动复制链接');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-lg text-white/90">记录美好时刻，陪伴宝宝成长</p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-6 bg-amber-500 rounded"></span>
            全部功能
          </h2>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span className="text-sm">已复制</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                <span className="text-sm">分享</span>
              </>
            )}
          </button>
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
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm">© 2026 麦塔记. 记录美好时刻</p>
        </div>
      </footer>
    </div>
  );
}
