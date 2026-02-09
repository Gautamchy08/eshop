import axiosInstance from '@/utils/axiosInstance'
import React from 'react'
import { Metadata } from 'next'
import ProductDetails from '@/app/shared/modules/product/product-details';

async function fetchProductDetails (slug:string){
    
    const response = await axiosInstance.get(`/product/api/get-product/${slug}`)
    return response.data.product;
}


export async function generateMetadata({params}: {params: {slug: string}}): Promise<Metadata> {
    const product = await fetchProductDetails(params.slug);
    return {
        title: `${product?.title}`,
        description: `${product?.short_description}|best_product`,
        openGraph: {
            title: product?.title,
            description: product?.short_description,
            images: [product?.images?.[0]?.url],
            type : "website"
        },
        twitter:{
            card:"summary_large_image",
            title:product?.title,
            description:product?.short_description,
            images:[product?.images?.[0]?.url],
        }
    };
}

const Page = async ({params}: {params: {slug: string}}) => {
    const slug = await params.slug;

const productDetails = await fetchProductDetails(slug);
console.log('consoling product details',productDetails);
  return (
   
    <ProductDetails productDetails={productDetails} />
  )
}

export default Page