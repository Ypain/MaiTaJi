'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Leaf } from 'lucide-react';

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

interface AnimalCardProps {
  animal: Animal;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

const statusColors: Record<string, string> = {
  '无危': 'bg-green-100 text-green-800',
  '依赖物种': 'bg-blue-100 text-blue-800',
  '易危': 'bg-yellow-100 text-yellow-800',
  '濒危': 'bg-orange-100 text-orange-800',
  '极危': 'bg-red-100 text-red-800',
};

export default function AnimalCard({ animal, onFavorite, isFavorite }: AnimalCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {animal.image_url ? (
          <Image
            src={animal.image_url}
            alt={animal.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            暂无图片
          </div>
        )}
        {animal.conservation_status && (
          <Badge 
            className={`absolute top-2 right-2 ${statusColors[animal.conservation_status] || 'bg-gray-100 text-gray-800'}`}
          >
            {animal.conservation_status}
          </Badge>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">
              {animal.name}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {animal.species}
            </CardDescription>
          </div>
          {onFavorite && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFavorite(animal.id)}
              className={`hover:bg-red-50 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {animal.description && (
          <p className="text-sm text-gray-700 line-clamp-2">
            {animal.description}
          </p>
        )}
        
        <div className="flex flex-col gap-2 text-sm text-gray-600">
          {animal.habitat && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span className="line-clamp-1">{animal.habitat}</span>
            </div>
          )}
          {animal.diet && (
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span className="line-clamp-1">{animal.diet}</span>
            </div>
          )}
        </div>
        
        <Link href={`/animal/${animal.id}`}>
          <Button variant="outline" className="w-full mt-2 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300">
            查看详情
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
