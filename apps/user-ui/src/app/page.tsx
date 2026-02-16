'use client';
import React from 'react';
import Hero from '../shared/modules/hero';
import SectionTitle from './shared/components/sections/section-title';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import ProductCard from './shared/components/cards/product-card';
import ShopCard from './shared/components/cards/shop-card';

const page = () => {
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axiosInstance.get(
        '/product/api/get-all-products?page=1&limit=10'
      );
      return res.data.products;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // console.log('data fetching for all products', products);

  const { data: latestProducts } = useQuery({
    queryKey: ['latest-products'],
    queryFn: async () => {
      const res = await axiosInstance.get(
        '/product/api/get-all-products?page=1&limit=10&type=latest'
      );
      return res.data.products;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: shops,isLoading:shopLoading } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const res = await axiosInstance.get(
        '/product/api/top-shops'
      );
      return res.data.shops;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // console.log('data fetching for the latest products',latestProducts);

  return (
    <div className="bg-[#f5f5f5]">
      <Hero />

      <div className="w-[90%] md:w-[80%] mx-auto py-10">
        {/* Selected Products Section */}
        <SectionTitle title="Selected Products" />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5 mt-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-[300px] bg-gray-200 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : products?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5 mt-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">
            No products found
          </div>
        )}

        {/* Latest Products Section */}
        <div className="mt-14">
          <SectionTitle title="Latest Products" />
        </div>

        {!isLoading && !isError && latestProducts?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5 mt-6">
            {latestProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : !isLoading && latestProducts?.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No products found
          </div>
        ) : null}

        {/* Top Shops Section */}
        <div className="mt-14">
          <SectionTitle title="Top Shops" />
        </div>

        {!shopLoading && shops?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5 mt-6">
            {shops.map((shop: any) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        ) : !shopLoading && shops?.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No shops found
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default page;
