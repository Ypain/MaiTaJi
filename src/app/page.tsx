'use client';

import { useState, useEffect } from 'react';
import AnimalCard from '@/components/AnimalCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, PawPrint } from 'lucide-react';

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

export default function Home() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initAnimals();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredAnimals(animals);
    } else {
      const filtered = animals.filter(
        animal =>
          animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          animal.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
          animal.habitat?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAnimals(filtered);
    }
  }, [searchTerm, animals]);

  const initAnimals = async () => {
    try {
      // 先尝试初始化动物数据
      const initResponse = await fetch('/api/init-animals', {
        method: 'POST',
      });
      
      if (initResponse.ok) {
        console.log('动物数据初始化成功');
        setInitialized(true);
      }
      
      // 获取动物列表
      await fetchAnimals();
    } catch (error) {
      console.error('初始化失败:', error);
      await fetchAnimals();
    }
  };

  const fetchAnimals = async () => {
    try {
      const response = await fetch('/api/animals');
      if (response.ok) {
        const data = await response.json();
        setAnimals(data.animals || []);
        setFilteredAnimals(data.animals || []);
      }
    } catch (error) {
      console.error('获取动物列表失败:', error);
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

      if (response.status === 401) {
        alert('请先登录');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.action === 'added') {
          alert('已添加到收藏');
        } else {
          alert('已取消收藏');
        }
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center items-center gap-3 mb-4">
          <PawPrint className="h-12 w-12 text-emerald-600" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            欢迎来到动物世界
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          探索神奇的动物王国，了解各种动物的生活习性、栖息地和保育状态
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="搜索动物名称、物种或栖息地..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
      </div>

      {/* Animals Grid */}
      {filteredAnimals.length === 0 ? (
        <div className="text-center py-12">
          <PawPrint className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            {searchTerm ? '没有找到匹配的动物' : '暂无动物数据'}
          </p>
          {searchTerm && (
            <Button
              onClick={() => setSearchTerm('')}
              variant="outline"
              className="mt-4"
            >
              清除搜索
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnimals.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              onFavorite={handleFavorite}
            />
          ))}
        </div>
      )}

      {/* Stats Section */}
      {initialized && (
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-around items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">{animals.length}</div>
              <div className="text-gray-600">动物种类</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">10+</div>
              <div className="text-gray-600">栖息地类型</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">∞</div>
              <div className="text-gray-600">探索乐趣</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
