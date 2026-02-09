'use client';
import Link from 'next/dist/client/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Router from 'next/router';
import {useStore} from '@/store';
import { Heart, MapPin, ShoppingCart, X } from 'lucide-react';
import useLocationTracking from '@/hooks/useLocationTracking';
import useDeviceTracking from '@/hooks/useDeviceTracking';
import useUser from '@/hooks/useUser';
import { sendKafkaEvent } from '@/actions/track-user';
const ProductDetailsCard = ({
  data,
  setOpen,
}: {
  data: any;
  setOpen: (open: boolean) => void;
}) => {

  const addToCart = useStore((state: any) => state.addToCart);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart.some((item: any) => item.id === data.id);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist.some((item: any) => item.id === data.id);
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const router = Router;
  const [activeImage, setActiveImage] = useState(0);
  const [isSelected, setIsSelected] = useState(data?.colors?.[0] || '');
  const [isSizeSelected, setIsSizeSelected] = useState(data?.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  console.log('consoling data from product details', data);
  console.log('consoling image from product details', data?.images);
  console.log('consoling shop name ', data?.shops?.name);

  useEffect(() => {
    console.log('sending event to kafka : "product_view" ')
    sendKafkaEvent({
      userId : user.id,
      productId : data.id,
      shopId : data.shops.id,
      action : 'product_view',
      country : location?.country||'unknown',
      city : location?.city||'unknown',
      device : deviceInfo,
    })
  },[user,data])
  return (
    <div
      onClick={() => setOpen(false)}
      className="fixed flex items-center justify-center top-0 left-0 h-screen    w-full bg-black/30  z-50 "
    >
      <div
        className="w-[90%]  md:w-[70%]  md:mt-14 2xl:mt-0 h-max overflow-scroll min-h-[70vh] p-4 md:p-6 bg-white shadow-md rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex  flex-col md:flex-row ">
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <div className="w-full h-[250px] md:h-[400px] flex items-center justify-center">
              <Image
                src={data?.images?.[activeImage]?.url}
                alt={data?.images?.[activeImage]?.url}
                width={400}
                height={400}
                className="w-auto h-full max-h-[250px] md:max-h-[400px] object-contain rounded-lg mx-auto"
                style={{ maxWidth: '100%' }}
              />
            </div>
            {/* thumbnails */}
            <div className="flex gap-2 mt-4 flex-wrap justify-center">
              {data?.images?.map((img: any, index: number) => (
                <div
                  key={index}
                  className={`cursor-pointer border rounded-md ${
                    activeImage === index
                      ? 'border-gray-500 pt-1'
                      : 'border-transparent'
                  }`}
                  onClick={() => setActiveImage(index)}
                >
                  <Image
                    src={img.url}
                    alt={`thumbnail-${index}`}
                    width={64}
                    height={64}
                    className="object-contain rounded-md w-16 h-16"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="w-full md:w-1/2 md:pl-8 mt-6 md:mt-0">
            {/* seller Info */}

            <div className="border-b relative pb-3 border-gray-200 flex items-center justify-between ">
              <div className="flex  items-start gap-3">
                {/* shop logo */}
                <Image
                  src={data?.shops?.avatar}
                  alt={data?.shops?.name}
                  width={60}
                  height={60}
                  className="rounded-full w-[60px] h-[60px] object-cover"
                />

                <Link
                  href={`shop/${data?.shops?.id}`}
                  className=" text-blue-500  text-2xl font-medium"
                >
                  {data?.shops?.name}
                </Link>

                {/* shop ratings */}

                <span className="block mt-1">
                  {/* <Ratings ={data?.shops?.ratings} /> */}
                  {data?.shops?.rating} Rating
                </span>
                {/* shop location */}

                <p className="text-gray-600 mt-1  flex items-center  ">
                  <MapPin size={20} />
                  {data?.shops?.address || 'location not available'}
                </p>
              </div>

              <button
                className=" cursor-pointer  gap-2 px-4 py-2 bg-blue-500 text-white rounded-md mt-4"
                onClick={() =>
                  router.push(
                    `/inbox?shopId=${data?.shops?.id}&shopName=${data?.shops?.name}`
                  )
                }
              >
                Chat with Seller
              </button>
              <button
                className="w-full absolute cursor-pointer right-[-1px]  top-[5px] flex justify-end my-3 mt-[-10px]"
                onClick={() => setOpen(false)}
              >
                <X size={24} /> {''}
              </button>
            </div>
            <h3 className="text-xl font-semibold mt-3 ">{data?.title}</h3>
            <p className="text-gray-700 mt-2">{data?.short_description}</p>
            {/* brand */}
            {data?.brand && <p className="mt-2">Brand : {data.brand}</p>}
            <div className="flex flex-col md:flex-row items-start gap-5 mt-4">
              {/* colors options */}

              {data?.colors && data?.colors?.length > 0 && (
                <div>
                  <strong>Colors:</strong>
                  <div className="flex gap-2 mt-1">
                    {data?.colors?.map((color: any, index: number) => (
                      <button
                        key={index}
                        className={`w-8 h-8 rounded-full border-2  ${
                          isSelected === color
                            ? 'border-gray-800 scale:110 shadow-md'
                            : 'border-transparent'
                        }`}
                        onClick={() => setIsSelected(color)}
                        style={{ backgroundColor: color }}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* size options */}
              {data?.sizes?.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {data.sizes?.map((size: any, index: number) => (
                    <button
                      key={index}
                      className={`w-8 h-8 rounded-full border-2  ${
                        isSelected === size
                          ? 'border-gray-800 scale:110 text-white'
                          : 'bg-gray-300 text-black'
                      }`}
                      onClick={() => setIsSizeSelected(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* price section */}
            <div className="flex items-center mt-5 gap-4">
              <h3 className="text-2xl font-semibold text-gray-900">
                {' '}
                ${data?.sale_price}
              </h3>
              {data?.regular_price && (
                <h3 className="text-lg text-red-500 line-through">
                  ${data?.regular_price}
                </h3>
              )}
            </div>

            <div className="mt-5 flex items-center gap-5 ">
              <div className="flex items-center rounded-md">
                <button
                  className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 tex-black font-semibold rounded-l-md"
                  onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                >
                  -
                </button>
                <span className="px-4 bg-gray-100  py-1">{quantity}</span>
                <button
                  className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 tex-black font-semibold rounded-r-md"
                  onClick={() => setQuantity((prev) => prev + 1)}
                >
                  +
                </button>
              </div>
              <button
                disabled={isInCart}
                onClick={()=>{addToCart({
                  ...data,
                  quantity,
                  selectedOptions : {
                    color : isSelected,
                    size : isSizeSelected
                  }
                })}}
                className={`px-4 py-2 flex gap-2 text-center bg-red-500 hover:bg-red-700 font-medium transition text-white rounded-md ${isInCart ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                <ShoppingCart size={20} /> <span> Add to Cart</span>
              </button>
              <button className="opacity-[.7] cursor-pointer">
                <Heart size={30} 
                fill={isWishlisted ? "red" : "transparent"}
                    color = {isWishlisted ? "red" : "black"} 
                    
                 onClick={()=> isWishlisted?removeFromWishlist(data.id,user,location,deviceInfo):
                  addToWishlist({
                    ...data,
                     quantity,
                  selectedOptions : {
                    color : isSelected,
                    size : isSizeSelected
                  }
                    
                  })
                 } 
                  />
                {''}
              </button>
            </div>

            <div className="mt-3">
              {data?.stock > 0 ? (
                <span className="text-green-600 font-semibold">In Stock</span>
              ) : (
                <span className="text-red-500 font-semibold">Out of Stock</span>
              )}
            </div>
            <div className="mt-3 text-gray-600 text-sm">
              Estimated Delivery :{' '}
              <strong>{estimatedDelivery.toDateString()}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsCard;
