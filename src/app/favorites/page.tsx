'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnimalCard from '@/components/AnimalCard';
import { Button } from '@/components/ui/button';
import { PawPrint, Heart } from 'lucide-react';
import Link from 'next/link';

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

interface Favorite {
  id: string;
  animal_id: string;
  created_at: string;
  animals: Animal;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites');
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      } else {
        setError('获取收藏列表失败');
      }
    } catch (error) {
      console.error('获取收藏列表失败:', error);
      setError('获取收藏列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async (animalId: string) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ animalId }),
      });

      if (response.ok) {
        // 从列表中移除
        setFavorites(favorites.filter(f => f.animal_id !== animalId));
      }
    } catch (error) {
      console.error('取消收藏失败:', error);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-red-500 fill-current" />
          <h1 className="text-3xl font-bold text-gray-900">我的收藏</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">还没有收藏任何动物</p>
          <p className="text-gray-500 text-sm mb-6">
            浏览动物列表，点击爱心图标即可收藏
          </p>
          <Link href="/">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              去探索动物
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <AnimalCard
              key={favorite.id}
              animal={favorite.animals}
              onFavorite={handleFavorite}
              isFavorite={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
