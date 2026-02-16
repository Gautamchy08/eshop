'use client';

import useDeviceTracking from '@/hooks/useDeviceTracking';
import useLocationTracking from '@/hooks/useLocationTracking';
import useUser from '@/hooks/useUser';
import { useStore } from '@/store';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, Trash2, Tag, Loader2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosInstance';

const CartPage = () => {
  const cart = useStore((state: any) => state.cart);
  const addToCart = useStore((state: any) => state.addToCart);
  const removeFromCart = useStore((state: any) => state.removeFromCart);
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const handleIncrement = (item: any) => {
    addToCart(item, user, location, deviceInfo);
  };

  const handleDecrement = (item: any) => {
    if ((item.quantity ?? 1) <= 1) {
      console.log('removing from cart',item)
      removeFromCart(item, user, location, deviceInfo);
    } else {
      // Manually update quantity by setting it to current - 1
      useStore.setState((state: any) => ({
        cart: state.cart.map((c: any) =>
          c.id === item.id ? { ...c, quantity: (c.quantity ?? 1) - 1 } : c
        ),
      }));
    }
  };

  const handleRemove = (item: any) => {
    console.log('removing from cart',item)
    removeFromCart(item, user, location, deviceInfo);
  };

  const { data: addresses, isLoading: addressesLoading } = useQuery({
      queryKey: ['shipping-addresses'],
      queryFn: async () => {
        const res = await axiosInstance.get('/api/shipping-addresses');
        return res.data.addresses;
      },
    });
  

  const handleClearCart = () => {
    useStore.setState({ cart: [] });
  };

  // Calculate totals
  const { subtotal, totalDiscount, totalAmount, totalItems } = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalItems = 0;

    cart?.forEach((item: any) => {
      const qty = item.quantity ?? 1;
      const salePrice = item.sale_price ?? item.price ?? 0;
      const regularPrice = item.regular_price ?? salePrice;

      subtotal += regularPrice * qty;
      totalDiscount += (regularPrice - salePrice) * qty;
      totalItems += qty;
    });

    const totalAmount = subtotal - totalDiscount;

    return { subtotal, totalDiscount, totalAmount, totalItems };
  }, [cart]);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10 lg:px-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ShoppingCart size={28} className="text-blue-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Shopping Cart
          </h1>
          <span className="text-gray-500 text-lg">
            ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </span>
        </div>
        {cart?.length > 0 && (
          <button
            onClick={handleClearCart}
            className="bg-red-500 hover:bg-red-700 text-sm font-medium 
            text-white px-2 py-1 rounded-md cursor-pointer transition"
          >
            Clear Cart
          </button>
        )}
      </div>

      {/* Empty State */}
      {!cart || cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <ShoppingCart size={80} className="text-gray-300 mb-6" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-6">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Table */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Table Header - hidden on mobile */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 bg-gray-100 border-b text-sm font-semibold text-gray-600 uppercase tracking-wide">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Total</div>
                <div className="col-span-1 text-center">Action</div>
              </div>

              {/* Cart Items */}
              {cart.map((item: any) => {
                const qty = item.quantity ?? 1;
                const salePrice = item.sale_price ?? item.price ?? 0;
                const regularPrice = item.regular_price ?? salePrice;
                const itemTotal = salePrice * qty;
                const hasDiscount = regularPrice > salePrice;

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 border-b border-gray-100 items-center hover:bg-gray-50 transition"
                  >
                    {/* Product - Image + Name */}
                    <div className="md:col-span-5 flex items-center gap-4">
                      <div className="w-20 h-20 relative rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.images?.[0]?.url || item.image ? (
                          <Image
                            src={item.images?.[0]?.url || item.image}
                            alt={item.title || 'Product'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                          {item.title}
                        </h3>
                        {item.selectedOptions?.color && (
                          <p className="text-xs text-gray-500 mt-1">
                            Color:{' '}
                            <span
                              className="inline-block w-3 h-3 rounded-full border align-middle ml-1"
                              style={{
                                backgroundColor: item.selectedOptions.color,
                              }}
                            />
                          </p>
                        )}
                        {item.selectedOptions?.size && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Size: {item.selectedOptions.size}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="md:col-span-2 flex md:justify-center items-center gap-2">
                      <span className="md:hidden text-sm text-gray-500 font-medium">
                        Price:
                      </span>
                      <div className="flex flex-col items-start md:items-center">
                        <span className="text-sm font-semibold text-gray-900">
                          ${salePrice.toFixed(2)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-red-400 line-through">
                            ${regularPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2 flex md:justify-center items-center gap-2">
                      <span className="md:hidden text-sm text-gray-500 font-medium">
                        Qty:
                      </span>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          onClick={() => handleDecrement(item)}
                          className="px-2.5 py-1.5 hover:bg-gray-100 transition cursor-pointer rounded-l-md"
                        >
                          <Minus size={14} /> {''}
                        </button>
                        <span className="px-4 py-1.5 text-sm font-medium bg-gray-50 min-w-[40px] text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => handleIncrement(item)}
                          className="px-2.5 py-1.5 hover:bg-gray-100 transition cursor-pointer rounded-r-md"
                        >
                          <Plus size={14} />
                          {''}
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="md:col-span-2 flex md:justify-center items-center gap-2">
                      <span className="md:hidden text-sm text-gray-500 font-medium">
                        Total:
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        ${itemTotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Remove */}
                    <div className="md:col-span-1 flex md:justify-center">
                      <button
                        onClick={() => handleRemove(item)}
                        className="p-2 hover:bg-red-50 rounded-full transition cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2
                          size={18}
                          className="text-gray-400 hover:text-red-500"
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continue Shopping */}
            <div className="mt-4">
              <Link
                href="/"
                className="text-blue-500 hover:text-blue-600 text-sm font-medium transition"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-[380px]">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-200">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag size={14} />
                      Discount
                    </span>
                    <span>- ${totalDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between text-gray-900 font-bold text-base">
                    <span>Total Amount</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      You save ${totalDiscount.toFixed(2)} on this order!
                    </p>
                  )}
                </div>
              </div>

              {/* Coupon Code */}
              <div className="mt-5 border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600 mb-2">🏷️ Have a coupon?</p>
                <div className="flex gap-2">
                  {/* input for coupon code */}
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  {/* submit button for coupon code */}
                  <button
                    disabled={!couponCode.trim()}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                      couponCode.trim()
                        ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    // onClick={handleApplyCoupon} // Implement coupon logic as needed
                  >
                    Apply
                  </button>
                  {/* {error && (
                    <p className="text-xs text-red-500 mt-1">{error}</p>
                    )} */}
                </div>
              </div>

              {/* Select Address */}
              <div className="mt-5 border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600 mb-2">
                  📍 Select an Address
                </p>
                <select
                  title="Select an address"
                  value={selectedAddressId}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                >
                  {addresses.map((address:any)=>{
                    return(
                      <option value={address.id}>
                        {address.label} -
                        {address.name}, {address.city}, {address.country}                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Select Payment Method */}
              <div className="mt-5 border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600 mb-2">
                  💳 Select Payment Method
                </p>
                <select
                  title="Select a payment method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                >
                  <option value="">-- Choose a payment method --</option>
                  <option value="online">Online Payment</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
              </div>

              <button className="w-full mt-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md transition cursor-pointer">
                {loading && <Loader2 className="animate-spin " size={5} />}
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              {/* Secure Checkout Info */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Secure Checkout
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
