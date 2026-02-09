'use client';

import useDeviceTracking from '@/hooks/useDeviceTracking';
import useLocationTracking from '@/hooks/useLocationTracking';
import useUser from '@/hooks/useUser';
import { useStore } from '@/store';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, X } from 'lucide-react';
import React from 'react';

const WishlistPage = () => {
  const addToCart = useStore((state: any) => state.addToCart);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const handleMoveToCart = (item: any) => {
    addToCart(item, user, location, deviceInfo);
    removeFromWishlist(item, user, location, deviceInfo);
  };

  const handleRemove = (item: any) => {
    removeFromWishlist(item, user, location, deviceInfo);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10 lg:px-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Heart size={28} className="text-red-500" fill="red" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          My Wishlist
        </h1>
        <span className="text-gray-500 text-lg">
          ({wishlist?.length || 0} {wishlist?.length === 1 ? 'item' : 'items'})
        </span>
      </div>

      {/* Empty State */}
      {!wishlist || wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Heart size={80} className="text-gray-300 mb-6" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-gray-500 mb-6">
            Start adding products you love to your wishlist!
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          {/* Move all to cart button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() =>
                wishlist.forEach((item: any) => handleMoveToCart(item))
              }
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition cursor-pointer"
            >
              <ShoppingCart size={18} />
              Move All to Cart
            </button>
          </div>

          {/* Wishlist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item: any) => {
              const isInCart = cart?.some((c: any) => c.id === item.id);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden group relative"
                >
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(item)}
                    className="absolute top-3 right-3 z-10 p-1.5 bg-white/80 hover:bg-red-100 rounded-full transition cursor-pointer"
                    title="Remove from wishlist"
                  >
                    <Trash2
                      size={18}
                      className="text-gray-500 hover:text-red-500"
                    />
                  </button>

                  {/* Product Image */}
                  <div className="w-full h-[300px] relative bg-gray-100 overflow-hidden">
                    {item.images ? (
                      <Image
                        src={item.images?.[0].url || item.image}
                        alt={item.title || 'Product'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg font-bold text-gray-900">
                        ${item.sale_price?.toFixed(2)}
                      </span>
                    </div>

                    {/* Add to Cart / Already in Cart */}
                    {isInCart ? (
                      <button
                        disabled
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-200 text-gray-500 font-medium rounded-md cursor-not-allowed"
                      >
                        <ShoppingCart size={18} />
                        Already in Cart
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMoveToCart(item)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition cursor-pointer"
                      >
                        <ShoppingCart size={18} />
                        Move to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default WishlistPage;
