import { MapPin, Star, Store, Users } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface ShopCardProps {
  shop: {
    id: string;
    name: string;
    bio?: string;
    category: string;
    coverBanner?: string;
    address?: string;
    rating?: number;
    image?: {
      url: string;
    };
    _count?: {
      products?: number;
    };
  };
}

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  return (
    <Link href={`/shop/${shop.id}`}>
      <div className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col">
        {/* Cover Banner */}
        <div className="relative h-[120px] overflow-hidden">
          {shop.coverBanner ? (
            <img
              src={shop.coverBanner}
              alt={`${shop.name} cover`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Category badge */}
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {shop.category}
          </span>
        </div>

        {/* Shop Avatar */}
        <div className="relative flex justify-center -mt-8 z-10">
          <div className="w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center">
            {shop.image?.url ? (
              <img
                src={shop.image.url}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Store size={28} className="text-gray-400" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-2 pb-4 flex flex-col flex-1 text-center">
          {/* Shop Name */}
          <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {shop.name}
          </h3>

          {/* Bio */}
          {shop.bio && (
            <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
              {shop.bio}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center justify-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className={
                  star <= Math.round(shop.rating || 0)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200 fill-gray-200'
                }
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">
              ({(shop.rating || 0).toFixed(1)})
            </span>
          </div>

          {/* Spacer to push bottom content down */}
          <div className="flex-1" />

          {/* Location */}
          {shop.address && (
            <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-3">
              <MapPin size={12} className="flex-shrink-0" />
              <span className="text-xs truncate max-w-[180px]">
                {shop.address}
              </span>
            </div>
          )}

          {/* Visit Shop Button */}
          <div className="w-full py-2 bg-gray-50 group-hover:bg-indigo-600 text-gray-600 group-hover:text-white text-sm font-medium rounded-lg transition-all duration-300 text-center">
            Visit Shop
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ShopCard;
