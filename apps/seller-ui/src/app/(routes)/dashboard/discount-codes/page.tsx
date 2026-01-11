'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DeleteDiscountcodeModel from 'apps/seller-ui/src/shared/components/modals/delete.disount-codes';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import {  AxiosError } from 'axios';
import { ChevronRight, Plus, PlusIcon, Trash, X } from 'lucide-react';
import Link from 'next/link';
import Input from 'packages/components/input';
import React, { useState } from 'react';
import {  Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const Page = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState<any>();
  
  const { data: discount_codes = [], isLoading } = useQuery({
    queryKey: ['shop-discounts'],
    queryFn: async () => {
      const res = await axiosInstance.get('/product/api/get-discount-codes');
      return res?.data?.discount_codes || [];
    },
  });
  
 
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      public_name: '',
      discountType: 'percentage',
      discountValue: '',
      discountCode: '',
    },
  });

  const createDiscountCodeMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await axiosInstance.post(
        '/product/api/create-discount-code',
        data
      );
      return res?.data?.discount_codes || [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-discounts'] });
      reset();
      setShowModal(false);
    },
  });
  const deleteDiscountCodeMutation = useMutation({
    mutationFn: async (discountId) => {
       await axiosInstance.delete(
        `/product/api/delete-discount-codes/${discountId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-discounts'] });
      setShowDeleteModal(false);
    },
  });

  const handleDeleteClick = async (discount: any) => {
    setSelectedDiscount(discount);
    setShowDeleteModal(true);

  };
  const onSubmit = async (data: any) => {
    if (discount_codes.length >= 8) {
      toast.error('You have reached the maximum limit of 8 discount codes.');
    }
    createDiscountCodeMutation.mutate(data);
  };
  return (
    <div className="w-full min-h-screen p-8">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">Discount codes</h2>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg gap-2 flex items-center "
        >
          <Plus size={18} /> Create Discount{' '}
        </button>
      </div>
      {/* Breadcrumb */}
      <div className="flex items-center text-white">
        <Link href={'/dashboard'} className="text-[#80Deea] cursor-pointer">
          Dashboard
        </Link>
        <ChevronRight size={20} className="opacity-[.8]" />
        <span>Discount Code</span>
      </div>

      {/* list of all existing discount codes */}

      <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg ">
        <h3 className="text-lg font-semibold text-white mb-4">
          Existing Discount Codes{' '}
        </h3>
        {isLoading ? (
          <p className="text-gray-300 text-center">Loading Discounts...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Value</th>
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discount_codes.map((discount: any) => (
                <tr
                  key={discount?.id}
                  className="border-b border-gray-800 hover:bg-gray-800 transition"
                >
                  <td className="p-3">{discount?.public_name}</td>
                  <td className="p-3 capitalize">
                    {discount.discountType === 'percentage'
                      ? 'Percentage(%)'
                      : 'Flat($)'}
                  </td>
                  <td className="p-3">
                    {discount.discountType === 'percentage'
                      ? `${discount.discountValue}%`
                      : `$${discount.discountValue}`}
                  </td>
                  <td className="p-3">{discount?.discountCode}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDeleteClick(discount)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      {<Trash size={18} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && discount_codes.length === 0 && (
          <p className="text-gray-300 text-center pt-4 block w-full">
             NO Discount Codes Available
          </p>
        )}
      </div>

      {/* create Discount Codes Modal */}

      {showModal && (
        <div className="fixed top-0  left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 w-[450px] shadow-lg">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-xl  text-white ">Create Discount Code</h3>
              <button type="button" onClick={() => setShowModal(false)}>
                {<X size={22} />}
              </button>
            </div>
            <form className='mt-4'
            onSubmit={handleSubmit(onSubmit)}>
              {/* title */}

              <Input
              label="Title (Public Name)"
              {...register('public_name', { required: 'title is Required' })}

              />
              {errors.public_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.public_name.message as string}
                </p>
              )}

              {/* Discount Type */}
              <div className='mt-2'>
                
                <label className="text-gray-300 font-semibold mb-1 block">Discount Type</label>
                <Controller
                name='discountType'
                control={control}
                render = {({field})=>(
                  <select
                  {...field}
                  className="w-full bg-transparent outline-none border border-gray-700 text-white p-2 rounded-md"  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat amount ($)</option>

                  </select>
                )}
                />
              </div>
              {/* Discount Value */}
              <div className='mt-2'>

              <Input 
              label='Discount Value'
              type='number'
              min={1}
              {...register('discountValue', { required: 'Discount Value is Required' })}
              />
              </div>

              {/* discount code */}

               <div className='mt-2'>

              <Input 
              label='Discount code'
              type='text'
              min={1}
              {...register('discountCode', { required: 'Discount Code is Required' })}
              />
              </div>

              <button type="submit" disabled = {createDiscountCodeMutation.isPending} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center ">
               <PlusIcon size={20} /> {createDiscountCodeMutation.isPending ? 'Creating...' : 'Create Discount Code'}
              </button>
              {createDiscountCodeMutation.isError && (
                <p className="text-red-500 text-sm mt-2">
                 {(createDiscountCodeMutation.error as AxiosError<{message:string}>)?.response?.data?.message || 'An error occurred while creating the discount code.'}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Delete Discount Code Modal */}

      {showDeleteModal && selectedDiscount && (
        <DeleteDiscountcodeModel
        discount={selectedDiscount}
        onClose={()=>setShowDeleteModal(false)}
        onConfirm={()=> deleteDiscountCodeMutation.mutate(selectedDiscount?.id)}
        
        />
      )}

    </div>
  );
};

export default Page;
