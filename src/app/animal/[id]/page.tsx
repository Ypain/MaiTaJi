'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Leaf, Shield, ArrowLeft, Heart } from 'lucide-react';

interface Animal {
  id: string;
  name: string;
  species: string;
  description: string | null;
  image_url: string | null;
  habitat: string | null;
  diet: string | null;
  conservation_status: string | null;
}

const statusColors: Record<string, string> = {
  '无危': 'bg-green-100 text-green-800',
  '依赖物种': 'bg-blue-100 text-blue-800',
  '易危': 'bg-yellow-100 text-yellow-800',
  '濒危': 'bg-orange-100 text-orange-800',
  '极危': 'bg-red-100 text-red-800',
};

export default function AnimalDetailPage() {
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    fetchAnimal();
    checkFavorite();
  }, [params.id]);

  const fetchAnimal = async () => {
    try {
      const response = await fetch(`/api/animals/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setAnimal(data.animal);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('获取动物详情失败:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const data = await response.json();
        const isFav = data.favorites?.some(
          (fav: any) => fav.animal_id === params.id
        );
        setIsFavorite(isFav || false);
      }
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  };

  const handleFavorite = async () => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ animalId: params.id }),
      });

      if (response.status === 401) {
        alert('请先登录');
        router.push('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.action === 'added');
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!animal) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        返回
      </Button>

      <Card className="overflow-hidden">
        {/* Image */}
        <div className="relative h-64 md:h-96 w-full bg-gray-100">
          {animal.image_url ? (
            <Image
              src={animal.image_url}
              alt={animal.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1000px"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-xl">
              暂无图片
            </div>
          )}
          {animal.conservation_status && (
            <Badge 
              className={`absolute top-4 right-4 ${statusColors[animal.conservation_status] || 'bg-gray-100 text-gray-800'}`}
            >
              <Shield className="h-3 w-3 mr-1" />
              {animal.conservation_status}
            </Badge>
          )}
        </div>

        <CardContent className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {animal.name}
              </h1>
              <p className="text-xl text-gray-600">{animal.species}</p>
            </div>
            <Button
              onClick={handleFavorite}
              variant="outline"
              size="lg"
              className={`hover:bg-red-50 ${isFavorite ? 'text-red-500 border-red-300' : ''}`}
            >
              <Heart className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? '已收藏' : '收藏'}
            </Button>
          </div>

          {/* Description */}
          {animal.description && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">简介</h2>
              <p className="text-gray-700 leading-relaxed">
                {animal.description}
              </p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {animal.habitat && (
              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900">栖息地</h3>
                </div>
                <p className="text-gray-700">{animal.habitat}</p>
              </div>
            )}

            {animal.diet && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">饮食习惯</h3>
                </div>
                <p className="text-gray-700">{animal.diet}</p>
              </div>
            )}
          </div>

          {/* Conservation Status Info */}
          {animal.conservation_status && (
            <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-600" />
                保护状态
              </h3>
              <p className="text-gray-700">
                该物种目前被列为 <strong>{animal.conservation_status}</strong>。
                让我们共同关注和保护这些美丽的生命！
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
