'use client';
import axiosInstance from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import ProductCard from '@/app/shared/components/cards/product-card';
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Search,
  PackageOpen,
} from 'lucide-react';
import ShopCard from '@/app/shared/components/cards/shop-card';
import { categories } from '@/configs/categories';
import { countries } from '@/configs/countries';


const Page = () => {
  const router = useRouter();

  const [isShopLoading, setIsShopLoading] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const updateURL = () => {
    const params = new URLSearchParams();
    if (selectedCountries.length > 0)
      params.set('countries', selectedCountries.join(','));
    if (selectedCategories.length > 0)
      params.set('categories', selectedCategories.join(','));
  
    params.set('page', page.toString());
    params.set('limit', '12');
    router.replace(`/shops?${decodeURIComponent(params.toString())}`);
  };

  const fetchFilteredShops = async () => {
    setIsShopLoading(true);
    try {
      const query = new URLSearchParams();

      if (selectedCategories.length > 0) {
        query.set('categories', selectedCategories.join(','));
      }
      if (selectedCountries.length > 0) {
        query.set('countries', selectedCountries.join(','));
      }
      query.set('page', page.toString());
      query.set('limit', '12');

      const res = await axiosInstance.get(
        `product/api/get-filtered-shops?${query.toString()}`
      );

      console.log('data from product get filtered products page', res.data);
      setShops(res.data.shops);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.log(error);
    } finally {
      setIsShopLoading(false);
    }
  };

  useEffect(() => {
    updateURL();

    fetchFilteredShops();
  }, [ selectedCategories ,selectedCountries, page]);

  // query to fetch categories
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axiosInstance.get('product/api/get-categories');
      console.log('data from categories', res.data);
      return res.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  const activeFilterCount =
    selectedCategories.length +
    selectedCountries.length;

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
    setPage(1);
  };

  const handleCountryToggle = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]
    );
    setPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedCountries([]);
    setPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Filter sidebar content (shared between desktop and mobile)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories Filter */}
      <div>
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wider mb-3">
          Categories
        </h3>
        {isCategoriesLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-5 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2  overflow-y-auto pr-1 custom-scrollbar">
            {categories?.map((cat: any) => (
              <label
                key={cat.label}
                className="flex items-center gap-3 cursor-pointer group py-1"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.value)}
                  onChange={() => handleCategoryToggle(cat.value)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-indigo-600 transition-colors capitalize">
                  {cat.value}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <hr className="border-gray-200" />


       <div className="space-y-2  overflow-y-auto pr-1 custom-scrollbar">
         <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wider mb-3">Countries</h3>
            {countries?.map((country: any) => (
              <label
                key={country}
                className="flex items-center gap-3 cursor-pointer group py-1"
              >
                <input
                  type="checkbox"
                  checked={selectedCountries.includes(country)}
                  onChange={() => handleCountryToggle(country)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-indigo-600 transition-colors capitalize">
                  {country}
                </span>
              </label>
            ))}
          </div>

      {/* Clear All Filters */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="w-full py-2.5 border-2 border-red-200 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="w-[90%] md:w-[85%] mx-auto py-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <a href="/" className="hover:text-indigo-600 transition-colors">
              Home
            </a>
            <ChevronRight size={14} />
            <span className="text-gray-800 font-medium">Shops</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-[var(--font-poppins)]">
              All Shops
            </h1>
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-[90%] md:w-[85%] mx-auto py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar Filter */}
          <aside className="hidden md:block w-[280px] flex-shrink-0">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 sticky top-4">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal size={18} />
                  Filters
                </h2>
                {activeFilterCount > 0 && (
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Mobile Sidebar Overlay */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setMobileFiltersOpen(false)}
              />
              {/* Drawer */}
              <div className="absolute left-0 top-0 h-full w-[300px] bg-white shadow-2xl overflow-y-auto animate-slide-in">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <SlidersHorizontal size={18} />
                    Filters
                  </h2>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-5">
                  <FilterContent />
                </div>
              </div>
            </div>
          )}

          {/* Product Grid Section */}
          <div className="flex-1 min-w-0">
            {/* Results Info Bar */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                {isShopLoading ? (
                  <span className="inline-block h-4 w-32 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <>
                    Showing{' '}
                    <span className="font-semibold text-gray-800">
                      {shops?.length || 0}
                    </span>{' '}
                    shops (Page {page} of {totalPages})
                  </>
                )}
              </p>
            </div>

            {/* Active Filters Chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {selectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full"
                  >
                    {cat}
                    <X
                      size={12}
                      className="cursor-pointer hover:text-indigo-900"
                      onClick={() => handleCategoryToggle(cat)}
                    />
                  </span>
                ))}
              </div>
            )}

            {/* Product Grid */}
            {isShopLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                  >
                    <div className="h-[200px] bg-gray-200 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                      <div className="flex justify-between">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-1/4" />
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : shops?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
                {shops.map((shop: any) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100">
                <PackageOpen
                  size={64}
                  className="text-gray-300 mb-4"
                  strokeWidth={1.5}
                />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No products found
                </h3>
                <p className="text-sm text-gray-400 mb-6 text-center max-w-md">
                  We couldn't find any products matching your filters. Try
                  adjusting your filters or clearing them to see more results.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !isShopLoading && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                                        ${
                                          page === 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 shadow-sm'
                                        }`}
                >
                  <ChevronLeft size={16} />
                  Prev
                </button>

                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all cursor-pointer
                                            ${
                                              pageNum === page
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                                : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200'
                                            }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={page === totalPages}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                                        ${
                                          page === totalPages
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 shadow-sm'
                                        }`}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom styles for the mobile drawer animation and custom scrollbar */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default Page;
