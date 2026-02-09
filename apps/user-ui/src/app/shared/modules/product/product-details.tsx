'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RefreshCw,
  Star,
  MapPin,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
  Package,
  Clock,
  CreditCard,
} from 'lucide-react';
import { useStore } from '@/store';
import useUser from '@/hooks/useUser';
import useLocationTracking from '@/hooks/useLocationTracking';
import useDeviceTracking from '@/hooks/useDeviceTracking';
import { sendKafkaEvent } from '@/actions/track-user';
import axiosInstance from '@/utils/axiosInstance';

interface ProductDetailsProps {
  productDetails: any;
}

const ProductDetails = ({ productDetails }: ProductDetailsProps) => {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    productDetails?.colors?.[0] || ''
  );
  const [selectedSize, setSelectedSize] = useState(
    productDetails?.sizes?.[0] || ''
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [priceRange, setPriceRange] = useState<number[]>([
    Math.max(0, (productDetails?.sale_price || 0) - 20),
    (productDetails?.sale_price || 100) + 50,
  ]);

  // Zoom functionality states
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [imageRect, setImageRect] = useState<DOMRect | null>(null);

  // Store hooks
  const addToCart = useStore((state: any) => state.addToCart);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart?.some((item: any) => item.id === productDetails?.id);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist?.some(
    (item: any) => item.id === productDetails?.id
  );

  // Tracking hooks
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  // Calculate discount percentage
  const discountPercent =
    productDetails?.regular_price && productDetails?.sale_price
      ? Math.round(
          ((productDetails.regular_price - productDetails.sale_price) /
            productDetails.regular_price) *
            100
        )
      : 0;

  // Estimated delivery date
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  // Track product view
  useEffect(() => {
    if (user?.id && productDetails?.id) {
      sendKafkaEvent({
        userId: user.id,
        productId: productDetails.id,
        shopId: productDetails?.shops?.id || productDetails?.shopId,
        action: 'product_view',
        country: location?.country || 'unknown',
        city: location?.city || 'unknown',
        device: deviceInfo,
      });
    }
  }, [user?.id, productDetails?.id]);

  //   fetch filterProducts

  const fetchFilteredProducts = async () => {
    try {
      const query = new URLSearchParams();

      query.set('priceRange', priceRange.join(','));
      query.set('page', '1');
      query.set('limit', '5');

      const res = await axiosInstance.get(
        `/product/api/get-filtered-products?${query.toString()}`
      );
      console.log(res.data);

      setRecommendedProducts(res.data.products);
    } catch (error) {
      console.log('failed to fetch filter products', error);
    }
  };

  useEffect(() => {
    fetchFilteredProducts();
  }, [priceRange]);

  const handleAddToCart = () => {
    addToCart(
      {
        ...productDetails,
        quantity,
        selectedOptions: {
          color: selectedColor,
          size: selectedSize,
        },
      },
      user,
      location,
      deviceInfo
    );
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(productDetails, user, location, deviceInfo);
    } else {
      addToWishlist(
        {
          ...productDetails,
          quantity: 1,
          selectedOptions: {
            color: selectedColor,
            size: selectedSize,
          },
        },
        user,
        location,
        deviceInfo
      );
    }
  };

  const nextImage = () => {
    if (productDetails?.images?.length > 0) {
      setActiveImage((prev) =>
        prev === productDetails.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (productDetails?.images?.length > 0) {
      setActiveImage((prev) =>
        prev === 0 ? productDetails.images.length - 1 : prev - 1
      );
    }
  };

  // Zoom handlers
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setImageRect(rect);
    setIsZooming(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRect) return;

    const x = ((e.clientX - imageRect.left) / imageRect.width) * 100;
    const y = ((e.clientY - imageRect.top) / imageRect.height) * 100;

    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  if (!productDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">
            Product not found
          </h2>
          <Link
            href="/"
            className="mt-4 inline-block text-blue-500 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-500 transition">
              Home
            </Link>
            <span>/</span>
            <Link
              href={`/category/${productDetails?.category?.toLowerCase()}`}
              className="hover:text-blue-500 transition"
            >
              {productDetails?.category}
            </Link>
            {productDetails?.subCategory && (
              <>
                <span>/</span>
                <span className="text-gray-700">
                  {productDetails?.subCategory}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image Gallery */}
            <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
              {/* Main Image with Zoom */}
              <div className="relative group">
                <div
                  className="aspect-square bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center cursor-crosshair relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  {productDetails?.images?.[activeImage]?.url ? (
                    <>
                      <Image
                        src={productDetails.images[activeImage].url}
                        alt={productDetails?.title || 'Product'}
                        width={600}
                        height={600}
                        className="w-full h-full object-contain"
                      />
                      {/* Zoom Lens Indicator */}
                      {isZooming && (
                        <div
                          className="absolute w-32 h-32 border-2 border-blue-500 bg-blue-500/10 pointer-events-none rounded-lg"
                          style={{
                            left: `calc(${zoomPosition.x}% - 64px)`,
                            top: `calc(${zoomPosition.y}% - 64px)`,
                          }}
                        />
                      )}
                    </>
                  ) : (
                    <div className="text-gray-400 text-center">
                      <Package size={80} className="mx-auto mb-2" />
                      <span>No image available</span>
                    </div>
                  )}
                </div>

                {/* Zoomed Image Panel */}
                {isZooming && productDetails?.images?.[activeImage]?.url && (
                  <div className="absolute left-[calc(100%+16px)] top-0 w-[400px] h-[400px] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50 hidden lg:block">
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${productDetails.images[activeImage].url})`,
                        backgroundSize: '300%',
                        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                  </div>
                )}

                {/* Navigation Arrows */}
                {productDetails?.images?.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Discount Badge */}
                {discountPercent > 0 && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg z-10">
                    -{discountPercent}% OFF
                  </div>
                )}

                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistToggle}
                  className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-10"
                >
                  <Heart
                    size={22}
                    fill={isWishlisted ? '#ef4444' : 'transparent'}
                    color={isWishlisted ? '#ef4444' : '#6b7280'}
                  />
                </button>
              </div>

              {/* Thumbnails */}
              {productDetails?.images?.length > 1 && (
                <div className="flex gap-3 mt-4 justify-center flex-wrap">
                  {productDetails.images.map((img: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === index
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={`Thumbnail ${index + 1}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6 lg:p-8">
              {/* Shop Info */}
              {productDetails?.shops && (
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  {productDetails.shops.avatar && (
                    <Image
                      src={productDetails.shops.avatar}
                      alt={productDetails.shops.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover w-12 h-12 border-2 border-gray-100"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-0.5">Sold by</p>
                    <Link
                      href={`/shop/${productDetails.shops.id}`}
                      className="text-gray-900 hover:text-blue-600 font-semibold text-lg transition"
                    >
                      {productDetails.shops.name}
                    </Link>
                    {productDetails.shops.address && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} />
                        {productDetails.shops.address}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/shop/${productDetails.shops.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-lg text-sm font-medium transition"
                    >
                      Visit Store
                    </Link>
                    <Link
                      href={`/inbox?shopId=${productDetails.shops.id}&shopName=${productDetails.shops.name}`}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition"
                    >
                      <MessageCircle size={16} />
                      Chat
                    </Link>
                  </div>
                </div>
              )}

              {/* Title & Rating */}
              <div className="mt-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                  {productDetails?.title}
                </h1>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={18}
                        fill={
                          star <= (productDetails?.rating || 0)
                            ? '#fbbf24'
                            : 'transparent'
                        }
                        color={
                          star <= (productDetails?.rating || 0)
                            ? '#fbbf24'
                            : '#d1d5db'
                        }
                      />
                    ))}
                    <span className="text-gray-600 text-sm ml-1">
                      ({productDetails?.rating || 0} rating)
                    </span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 transition">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Price Section */}
              <div className="mt-5 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-red-600">
                    ${productDetails?.sale_price?.toFixed(2)}
                  </span>
                  {productDetails?.regular_price &&
                    productDetails.regular_price >
                      productDetails.sale_price && (
                      <span className="text-xl text-gray-400 line-through">
                        ${productDetails.regular_price.toFixed(2)}
                      </span>
                    )}
                  {discountPercent > 0 && (
                    <span className="text-sm bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                      Save $
                      {(
                        productDetails.regular_price - productDetails.sale_price
                      ).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Short Description */}
              {productDetails?.short_description && (
                <p className="text-gray-600 mt-4 leading-relaxed">
                  {productDetails.short_description}
                </p>
              )}

              {/* Brand */}
              {productDetails?.brand && (
                <div className="mt-4 text-sm">
                  <span className="text-gray-500">Brand:</span>{' '}
                  <span className="font-medium text-gray-900">
                    {productDetails.brand}
                  </span>
                </div>
              )}

              {/* Colors */}
              {productDetails?.colors?.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Color
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {productDetails.colors.map(
                      (color: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setSelectedColor(color)}
                          className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                            selectedColor === color
                              ? 'border-gray-800 ring-2 ring-gray-300 scale-110'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        >
                          {selectedColor === color && (
                            <Check
                              size={18}
                              className={
                                color === '#ffffff' || color === 'white'
                                  ? 'text-black'
                                  : 'text-white'
                              }
                            />
                          )}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {productDetails?.sizes?.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm font-medium text-gray-700 mb-2">Size</p>
                  <div className="flex gap-2 flex-wrap">
                    {productDetails.sizes.map((size: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[44px] h-10 px-4 rounded-lg border transition-all font-medium ${
                          selectedSize === size
                            ? 'bg-gray-900 border-gray-900 text-white'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-500'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition text-xl font-medium"
                  >
                    -
                  </button>
                  <span className="w-16 h-12 flex items-center justify-center border-x border-gray-300 font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((prev) =>
                        Math.min(prev + 1, productDetails?.stock || 99)
                      )
                    }
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition text-xl font-medium"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isInCart || productDetails?.stock === 0}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold text-lg transition-all ${
                    isInCart
                      ? 'bg-green-500 text-white cursor-not-allowed'
                      : productDetails?.stock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  <ShoppingCart size={22} />
                  {isInCart ? 'Added to Cart' : 'Add to Cart'}
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistToggle}
                  className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 transition-all 
                    ${
                      isWishlisted
                        ? 'border-red-500 bg-red-50 text-red-500'
                        : 'border-gray-300 hover:border-gray-400 text-gray-500'
                    }`}
                >
                  <Heart
                    size={22}
                    fill={isWishlisted ? 'red' : 'transparent'}
                  />
                </button>
              </div>

              {/* Stock Status */}
              <div className="mt-4">
                {productDetails?.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-green-600 font-medium">
                    <Check
                      size={16}
                      className="bg-green-500 text-white rounded-full p-0.5"
                    />
                    In Stock ({productDetails.stock} available)
                  </span>
                ) : (
                  <span className="text-red-500 font-medium">Out of Stock</span>
                )}
              </div>

              {/* Delivery & Features */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Truck size={20} className="text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Free Delivery
                    </p>
                    <p className="text-xs text-gray-500">
                      Est. {estimatedDelivery.toDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <RefreshCw size={20} className="text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Easy Returns
                    </p>
                    <p className="text-xs text-gray-500">
                      7 days return policy
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Shield size={20} className="text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {productDetails?.warranty || 'Quality Guaranteed'}
                    </p>
                    <p className="text-xs text-gray-500">Genuine product</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CreditCard size={20} className="text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Secure Payment
                    </p>
                    <p className="text-xs text-gray-500">
                      {productDetails?.cash_on_delivery === 'yes'
                        ? 'COD Available'
                        : 'Online only'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-xl shadow-sm mt-8 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 lg:p-8">
            {activeTab === 'description' && (
              <div
                className="prose prose-gray max-w-none break-words whitespace-pre-wrap leading-relaxed text-gray-700"
                style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                dangerouslySetInnerHTML={{
                  __html:
                    productDetails?.detailed_description ||
                    productDetails?.short_description ||
                    'No description available.',
                }}
              />
            )}
            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Category', value: productDetails?.category },
                  { label: 'Sub Category', value: productDetails?.subCategory },
                  { label: 'Brand', value: productDetails?.brand },
                  { label: 'Warranty', value: productDetails?.warranty },
                  {
                    label: 'Cash on Delivery',
                    value: productDetails?.cash_on_delivery,
                  },
                  {
                    label: 'Tags',
                    value: productDetails?.tags?.join(', '),
                  },
                ]
                  .filter((spec) => spec.value)
                  .map((spec, index) => (
                    <div
                      key={index}
                      className="flex justify-between py-3 border-b border-gray-100"
                    >
                      <span className="text-gray-500">{spec.label}</span>
                      <span className="font-medium text-gray-900">
                        {spec.value}
                      </span>
                    </div>
                  ))}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="text-center py-12 text-gray-500">
                <Star size={48} className="mx-auto text-gray-300 mb-4" />
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Products Section */}
        {recommendedProducts && recommendedProducts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm mt-8 overflow-hidden">
            <div className="p-6 lg:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {recommendedProducts.map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="group bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    {/* Product Image */}
                    <div className="aspect-square relative overflow-hidden bg-white">
                      {product?.images?.[0]?.url ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.title}
                          width={200}
                          height={200}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Package size={40} className="text-gray-300" />
                        </div>
                      )}
                      {/* Discount Badge */}
                      {product.regular_price > product.sale_price && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          -
                          {Math.round(
                            ((product.regular_price - product.sale_price) /
                              product.regular_price) *
                              100
                          )}
                          %
                        </div>
                      )}
                    </div>
                    {/* Product Info */}
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {product.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-lg font-bold text-red-600">
                          ${product.sale_price}
                        </span>
                        {product.regular_price > product.sale_price && (
                          <span className="text-sm text-gray-400 line-through">
                            ${product.regular_price}
                          </span>
                        )}
                      </div>
                      {/* Rating */}
                      <div className="flex items-center gap-1 mt-1">
                        <Star
                          size={12}
                          fill={product.rating > 0 ? '#fbbf24' : 'transparent'}
                          color={product.rating > 0 ? '#fbbf24' : '#d1d5db'}
                        />
                        <span className="text-xs text-gray-500">
                          {product.rating || 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
