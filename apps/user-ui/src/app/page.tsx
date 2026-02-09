'use client';
import React from 'react';
import Hero from '../shared/modules/hero';
import SectionTitle from './shared/components/sections/section-title';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import ProductCard from './shared/components/cards/product-card';

const page = () => {
  const {data : products,isLoading,isError} = useQuery({
    queryKey: ['products'],
    queryFn : async () =>{
      const res = await axiosInstance.get('/product/api/get-all-products?page=1&limit=10');
      return res.data.products; 
    },
    staleTime : 2 * 60 * 1000 // 2 minutes
  });

  // console.log('data fetching for all products', products);
   


  const {data : latestProducts} = useQuery({
    queryKey: ['latest-products'],
    queryFn : async () =>{
      const res = await axiosInstance.get('/product/api/get-all-products?page=1&limit=10&type=latest');
      return res.data.products; 
    },
    staleTime : 2 * 60 * 1000 // 2 minutes
  });

  // console.log('data fetching for the latest products',latestProducts);
  


  return (
    <div className="bg-[#f5f5f5]">
      <Hero />

      <div className="w-[90%] md:w-[80%] my-10 m-auto">
        <div className="mb-8">
          <SectionTitle title="Selected Products" />
        </div>
        {  isLoading ? (

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-[250px] bg-gray-300  animate-pulse rounded-xl "
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {products?.map((product:any) => (
              <div key={product.id} className="h-[250px] bg-gray-300 rounded-xl">
                  <ProductCard key ={product.id} product={product} /> 
              </div>
            ))}
          </div>
        )
        }
      </div>
    </div>
  );
};

export default page;
