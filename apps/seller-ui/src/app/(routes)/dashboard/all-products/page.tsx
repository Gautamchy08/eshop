'use client';
import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Search,
  Pencil,
  Trash,
  Eye,
  Plus,
  BarChart,
  Star,
  ChevronRight,
} from 'lucide-react';

import Link from 'next/link';

import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import DeleteConfirmationModal from 'apps/seller-ui/src/shared/components/modals/delete.confirmation.modal';

const fetchProducts = async () => {
  const res = await axiosInstance.get('/product/api/get-shop-products');
  return res?.data?.products;
};

const deleteProduct = async (productId: string) => {
  console.log('consoling the productId', productId);
  await axiosInstance.delete(`product/api/delete-product/${productId}`);
};
const restoreProduct = async (productId: string) => {
  await axiosInstance.put(`product/api/restore-product/${productId}`);
};

const ProductList = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeleteModel, setShowDeleteModel] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>();

  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['shop-products'],
    queryFn: fetchProducts,
    staleTime: 100 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
      setShowDeleteModel(false);
    },
  });
  const restoreMutation = useMutation({
    mutationFn: restoreProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-products'] }); // use to tell useQuery to refech the data
      setShowDeleteModel(false);
    },
  });

  const columns = useMemo(
    () => [
        // product image
      {
        accessorKey: 'image',
        header: 'Image',
        cell: ({ row }: any) => {
          return (
            <Image
              src={row.original.images[0]?.url||""}
              alt={row.original.images[0]?.url||""}
              width={200}
              height={200}
              className="w-12 h-12 rounded-md object-cover"
            />
          );
        },
      },    
    // product name  

      {
        accessorKey: 'name',
        header: 'Product Name',
        cell: ({ row }: any) => {
          const truncatedTitle =
            row.original.title.length > 25
              ? `${row.original.title.substring(0, 25)}...`
              : row.original.title;

          return (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/products/${row.original.slug}`}
              className="text-blue-400 hover:underline"
              title={row.original.title}
            >
              {truncatedTitle}
            </Link>
          );
        },
      },
        //   price
      {
        accessorKey: 'price',
        header: 'price',
        cell: ({ row }: any) => <span>${row.original.sale_price}</span>,
      },
        //   stock
      {
        accessorKey: 'stock',
        header: 'stock',
        cell: ({ row }: any) => <span>{row.original.stock} left</span>,
      },
        //   category
      {
        accessorKey: 'category',
        header: 'Category',
      },
    //   rating
      {
        accessorKey: 'rating',
        header: 'Rating',
        cell: ({ row }: any) => {
          return (
            <div className="flex items-center gap-1 text-yellow-400">
              <Star size={18} fill="#fde047" />
              <span className="text-white"> {row.original.rating || '5'}</span>
            </div>
          );
        },
      },
    //   actions
      {
        accessorKey: 'actions',
        header: 'actions',
        cell: ({ row }: any) => {
          return (
            <div className="flex gap-3">
              <Link
                href={`product/${row.original.id}`}
                className=" text-blue-400 hover:text-blue-300 transition"
              >
                <Eye size={18} />{' '}
              </Link>
              <Link
                href={`product/edit/${row.original.id}`}
                className=" text-yellow-400 hover:text-yellow-300 transition"
              >
                {' '}
                <Pencil size={18} />{' '}
              </Link>

              <button className="text-green-400 hover:text-green-300 transition">
                {' '}
                <BarChart size={18} /> {}{' '}
              </button>
              <button
                className="text-red-400 hover:text-red-300 transition"
                onClick={() => openDeleteModal(row.original)}
              >
                {' '}
                <Trash size={18} /> {}{' '}
              </button>
            </div>
          );
        },
      },
    ],
    []
  );
  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const openDeleteModal = (product: any) => {
    console.log('Product being set:', product);
    console.log('Product ID:', product?.id);
    setSelectedProduct(product);
    setShowDeleteModel(true);
  };
  return (
    <div className="w-full min-h-screen p-8">
      {/* headers */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold ">All Products</h2>
        <Link
          href={'/dashboard/create-product'}
          className="bg-blue-600 hover:bg-blue-700  text-center text-white px-4 py-2 rounded-lg flex items-center "
        >
          {' '}
          <Plus size={18} /> <span className="ml-2">Add Product</span>{' '}
        </Link>
      </div>
      {/* breadCrumbs */}

      <div className="flex items-center mb-4">
        <Link href={'/dashboard'} className="text-blue-400 cursor-pointer">
          Dashboard
        </Link>
        <ChevronRight size={20} className="text-gray-300 " />
        <span className="text-white">All Products</span>
      </div>

      {/* Search Bar */}

      <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 text-center mr-2" />
        <input
          type="text"
          placeholder="Search Products..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}

      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading Products...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-green-800">
                  {headerGroup.headers.map((header) => (
                    <th className="p-3 text-left" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-800 hover:border-gray-900 transition "
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {showDeleteModel && (
          <DeleteConfirmationModal
            product={selectedProduct}
            onClose={() => setShowDeleteModel(false)}
            onConfirm={() => {
              console.log('Confirming delete for:', selectedProduct);
              console.log('Product ID to delete:', selectedProduct?.id);
              deleteMutation.mutate(selectedProduct?.id);
            }}
            onRestore={() => {
              restoreMutation.mutate(selectedProduct?.id);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProductList;
