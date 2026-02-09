import { Divide, Eye, Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Rating from '../ratings';
import ProductDetailsCard from './product-details.card';
import { useStore } from '@/store';
import useLocationTracking from '@/hooks/useLocationTracking';
import useDeviceTracking from '@/hooks/useDeviceTracking';
import useUser from '@/hooks/useUser';
const ProductCard = ({
  product,
  isEvent,
}: {
  product: any;
  isEvent?: boolean;
}) => {
  
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const {user} = useUser();

  const addToCart = useStore((state:any)=> state.addToCart);
  const addToWishlist = useStore((state:any)=> state.addToWishlist);
  const removeFromWishlist = useStore((state:any)=> state.removeFromWishlist);
  const wishlist = useStore((state:any)=> state.wishlist);
  const isWishlisted = wishlist.some((item:any)=> item.id === product.id);
  const cart = useStore((state:any)=> state.cart);
  const isInCart = cart.some((item:any)=> item.id === product.id);

   console.log('consoling isWishlisted',isWishlisted);
   

  const [timeLeft, setTimeLeft] = useState('');
  const [open, setOpen] = useState(false);
  

  useEffect(() => {
    if (isEvent && product?.ending_date) {
      const interval = setInterval(() => {
        const endTime = new Date(product.ending_date).getTime();
        const now = Date.now();
        const diff = endTime - now;

        if (diff <= 0) {
          setTimeLeft('expired');
          clearInterval(interval);
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) % 24);
        const minutes = Math.floor((diff % (1000 * 60 * 60)) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m  left with this price`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isEvent, product?.ending_date]);
  return (
    <div className="w-full min-h-[350px] h-max relative rounded-lg bg-white">
      {isEvent && (
        <div className=" absolute top-2 left-2 bg-red-600  text-white text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md">
          OFFER
        </div>
      )}

      {product?.stock <= 5 && (
        <div className=" absolute top-2 right-2 bg-yellow-400 text-slate-600 font-semibold px-2 py-1 rounded-sm shadow-md ">
          {' '}
          Limited Stock
        </div>
      )}
      <Link href={`/product/${product?.slug}`}>
        <img
          src={product?.images?.[0]?.url}
          alt={product?.title}
          width={300}
          height={300}
          className="w-full h-[200px]  object-cover mx-auto  rounded-t-md "
        />
      </Link>
      <Link
        href={`/product/${product?.shop?.id}`}
        className="text-blue-500 block text-sm font-medium my-2 px-2"
      >
        {product?.shop?.name}
      </Link>
      <Link href={`/product/${product?.slug}`}>
        <h3 className="block font-semibold text-base text-gray-800  px-2">
          {product?.title}
        </h3>
      </Link>

      <div className="mt-2 px-2">
        {product?.ratings} Star
        {/* <Rating rating={product?.ratings} /> */}
      </div>
     {/* price goes here */}
      <div className="mt-3 flex justify-between items-center px-2">
        <div className=" flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            ${product?.sale_price}
          </span>
          <span className="text-sm line-through text-gray-400 ">
            ${product?.regular_price}
          </span>
        </div>
        <span className="text-green-500  text-sm font-medium">
          {' '}
          {product.totalSales} sold{' '}
        </span>
      </div>

      {isEvent && timeLeft && (
        <div className="mt-2">
          <span className="inline-block text-xs bg-orange-100 text-orange-600">
            {timeLeft}{' '}
          </span>
        </div>
      )}

      <div className='absolute z-10 flex flex-col right-2 gap-3 top-2'>
        <div className='bg-white rounded-full p-[6px]  shadow-md'>
          <Heart className='cursor-pointer hover:scale-110 transition'
          size={22}
          fill={isWishlisted?'red':'transparent'}
          stroke= {isWishlisted?'red':'#4b5563'}
          onClick={()=>{
            // setIsWishlisted(!isWishlisted);
            isWishlisted?removeFromWishlist(product,user,location,deviceInfo):addToWishlist(
              {...product,quantity:1},
            user,
            location,
            deviceInfo)
          }}
           />
        </div>
                <div className='bg-white rounded-full p-[6px]  shadow-md'>
                   <Eye 
                   onClick={()=>setOpen(!open)}
                   className='cursor-pointer text-[#4b5563] hover:scale-110 transition'
          size={22}
         
           />
  </div>
                <div className='bg-white rounded-full p-[6px]  shadow-md'>
                   <ShoppingBag className='cursor-pointer text-[#4b5563] hover:scale-110 transition'
          size={22}
         onClick={()=>{
          !isInCart && addToCart({...product,quantity:1},user,location,deviceInfo)
         }}
           />
  </div>
      </div>

      {open && (
        <ProductDetailsCard  data={product} setOpen={setOpen} />
      )}
    </div>
  );
};

export default ProductCard;
