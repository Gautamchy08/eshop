import { useMutation } from '@tanstack/react-query';
import { shopCategories } from 'apps/seller-ui/src/utils/category';
import axios from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';

const CreateShop = ({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (step: number) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  const shopCreateMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('shop data for create-shop', data);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/create-shop`,
        data
      );
      console.log('consoling the response of create-shop', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      setActiveStep(3);
    },
  });

  const onSubmit = (data: any) => {
    const shopData = { ...data, sellerId };
    shopCreateMutation.mutate(shopData);
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-semibold text-center mb-4">
          Setup New Shop
        </h3>
        <label className="text-gray-700 mb-1 block">Name*</label>
        <input
          type="text"
          placeholder="Shop Name"
          className="w-full p-2 border  border-gray-300 outline-0 !rounded mb-1"
          {...register('name', {
            required: 'Name is required',
          })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.name.message)}
          </p>
        )}

        {/* Bio input */}

        <label className="text-gray-700 mb-1 block">
          Bio(maximum 100 words) *
        </label>
        <textarea
          cols={10}
          rows={4}
          placeholder="Shop Bio"
          className="w-full p-2 border border-gray-300 outline-0  mb-1 rounded-[4px]"
          {...register('bio', {
            required: 'Bio is required',
            validate: (value) =>
              countWords(value) <= 100 || 'Bio cannot exceed 100 words',
          })}
        />
        {errors.bio && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.bio.message)}
          </p>
        )}

        {/* category input */}
        <label className="text-gray-700 mb-1 block">Category</label>
        <select
          className="w-full p-2 border border-gray-300 outline-0  rounded-[4px] "
          {...register('category', {
            required: 'Category is required',
          })}
          name="category"
          id="category"
        >
          <option className="" value="">
            {' '}
            Select your category
          </option>
          {shopCategories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.category.message)}
          </p>
        )}

        {/* Address input */}

        <label className="text-gray-700 mb-1 block">Address*</label>
        <input
          type="text"
          placeholder="Shop Location"
          className="w-full p-2 border  border-gray-300 outline-0 !rounded mb-1"
          {...register('address', {
            required: 'Address is required',
          })}
        />
        {errors.address && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.address.message)}
          </p>
        )}

        {/* Opening Hours input */}
        <label className="text-gray-700 mb-1 block">Opening Hours*</label>
        <input
          type="text"
          placeholder="e.g., Mon-Fri 9am-5pm"
          className="w-full p-2 border  border-gray-300 outline-0 !rounded mb-1"
          {...register('opening_hours', {
            required: 'Opening Hours are required',
          })}
        />
        {errors.opening_hours && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.opening_hours.message)}
          </p>
        )}

        {/* website URL */}

        <label className="text-gray-700 mb-1 block">website url</label>
        <input
          type="url"
          placeholder="https://example.com"
          className="w-full p-2 border  border-gray-300 outline-0 !rounded mb-1"
          {...register('website', {
            pattern: {
              value: /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-]*)*\/?$/,
              message: 'Please enter a valid URL',
            },
          })}
        />
        {errors.website && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.website.message)}
          </p>
        )}

        <button
          type="submit"
          className="w-full p-2 bg-blue-500 mt-2 text-white text-lg cursor-pointer rounded-lg"
          disabled={shopCreateMutation.isPending}
        >
          {shopCreateMutation.isPending ? 'Creating Shop...' : 'Create  '}
        </button>
        {shopCreateMutation.isError && (
          <p className="text-red-500 text-sm mt-2">
            {String(shopCreateMutation.error)}
          </p>
        )}
      </form>
    </div>
  );
};

export default CreateShop;
