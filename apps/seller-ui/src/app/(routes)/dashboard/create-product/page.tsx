'use client';

import Input from 'packages/components/input/index';
import ImagePlaceHolder from 'apps/seller-ui/src/shared/components/image-placeholder';
import { ChevronRight, Wand, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Controller, set, useForm } from 'react-hook-form';
import ColorSelector from 'packages/components/color-selector';
import CustomSpecifications from 'packages/components/custom-specification';
import CustomProperties from 'packages/components/custom-properties';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import RichTextEditor from 'packages/components/richTextEditor/rich-text-editor';
import SizeSelector from 'packages/components/size-selector';
import Image from 'next/image';
import { enhancements } from 'apps/seller-ui/src/utils/AI.enhancement';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
interface uploadedImage {
  fileId: string;
  file_url: string;
}

const page = () => {
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({});

  const [openImageModal, setOpenImageModal] = useState(false);
  const [pictureUploadingLoader, setPictureUploadingLoader] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [isChanged, setIsChanged] = useState(true);
  const [images, setimages] = useState<(uploadedImage | null)[]>([null]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // query to fetch categories and subcategories
  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/product/api/get-categories');
        return response.data;
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // query to fetch coupon codes
  const { data: discount_codes = [], isLoading: discountLoading } = useQuery({
    queryKey: ['shop-discounts'],
    queryFn: async () => {
      const res = await axiosInstance.get('/product/api/get-discount-codes');
      return res?.data?.discount_codes || [];
    },
  });

  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || {};

  const selectedCategory = watch('category');
  const regularPrice = watch('regular_price');

  const subCategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subCategoriesData]);

  console.log(
    'logging categories and subcategories',
    categories,
    subCategoriesData
  );

  const onSubmit = async (data: any) => {
    try {
      console.log('data to be send', data);
      console.log('reached at onsubmit');

      // Add images to the form data
      const productData = {
        ...data,
        images: images.filter((img) => img !== null),
      };

      console.log('Final product data:', productData);
      setLoading(true);
      const response = await axiosInstance.post(
        '/product/api/create-product',
        productData
      );

      if (response.data.success == true) {
        toast.success('Product created successfully');
      }

      console.log('product creation response', response);
      router.push('/dashboard/all-products');
    } catch (error) {
      console.log(error);
      toast.error('error?.data?.message');
    } finally {
      setLoading(false);
    }
  };
  // convert file to base64
  const convertFileToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  // uploading ikage
  const handleImageChange = async (file: File | null, index?: number) => {
    if (!file) return;

    try {
      const imageBase64 = await convertFileToBase64(file);
      setPictureUploadingLoader(true);

      const response = await axiosInstance.post(
        '/product/api/upload-product-image',
        { imageBase64 }
      );

      const updatedImages = [...images];

      const uploadedImage: uploadedImage = {
        fileId: response.data.fileId,
        file_url: response.data.file_url,
      };

      updatedImages[index!] = uploadedImage;

      if (index === images.length - 1 && images.length < 8) {
        updatedImages.push(null);
        setValue('images', updatedImages);
      }
      setimages(updatedImages);
    } catch (error) {
      console.log(error);
    } finally {
      setPictureUploadingLoader(false);
    }
  };
//   remove image handler
  const handleRemoveImage = async (index?: number) => {
    try {
      const updateImages = [...images];
      console.log('handle remove image called', index);

      if (index === undefined || index === null) return;
      console.log('call continue to delete image at index', index);

      const imageToDelete = updateImages[index];
      console.log(
        'here is the image to delete',
        imageToDelete,
        typeof imageToDelete
      );
      if (imageToDelete && typeof imageToDelete === 'object') {
        // to delete images

        console.log('required file id is ', imageToDelete.fileId);

        const res = await axiosInstance.delete(
          '/product/api/delete-product-image',
          {
            data: {
              fileId: imageToDelete.fileId!,
            },
          }
        );
        console.log('image delete response', res);
      }
      updateImages.splice(index, 1);

      //  add null placeholder if not present

      if (!updateImages.includes(null) && updateImages.length < 8) {
        updateImages.push(null);
      }
      setimages(updateImages);
      setValue('images', updateImages);
    } catch (error) {
      console.log(error);
    }
  };
//   apply transformation on the image
  const applyTransformation = async (transformation: string) => {
    if (!selectedImage || processing) return;
    setProcessing(true);
    try {
      const transformedUrl = `${selectedImage}?tr=${transformation}`;
      console.log('current transformed url is', transformedUrl);

      setSelectedImage(transformedUrl);
    } catch (error) {
      console.log('error applying transformation', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveDarft = () => {};

  return (
    <form
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
      onSubmit={handleSubmit(onSubmit, (errors) => {
        console.log('Form validation errors:', errors);
        toast.error('Please fill all required fields');
      })}
    >
      {/* Heading and breadCrumbs */}
      <h2 className="text-2xl font-semibold font-poppins text-white py-2">
        {' '}
        Create Product
      </h2>
      <div className="flex items-center">
        <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
        <ChevronRight size={20} className="opacity-[.8]" />
        <span>Create Product</span>
      </div>
      {/* content Layout */}
      <div className="py-4  w-full flex gap-6 ">
        {/* Left side => image upload section */}
        <div className="md:w-[35%]">
          {images?.length > 0 && (
            <ImagePlaceHolder
              setOpenImageModal={setOpenImageModal}
              size="765*850"
              small={false}
              index={0}
              onImageChange={handleImageChange}
              setSelectedImage={setSelectedImage}
              onRemove={handleRemoveImage}
              images={images}
              pictureUploadingLoader={pictureUploadingLoader}
            />
          )}
          <div className="grid grid-cols-2 gap-3 mt-4 ">
            {images.slice(1).map((img, index) => (
              <ImagePlaceHolder
                setOpenImageModal={setOpenImageModal}
                size="765*850"
                small
                key={index}
                index={index + 1}
                setSelectedImage={setSelectedImage}
                onImageChange={handleImageChange}
                onRemove={handleRemoveImage}
                images={images}
                pictureUploadingLoader={pictureUploadingLoader}
              />
            ))}
          </div>
        </div>

        <div className="md:w-[65%] flex gap-4">
          {/* title goes here */}
          <div className="w-2/4">
            <Input
              label="product title*"
              placeholder="Enter product title"
              {...register('title', { required: 'title is required ' })}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message as string}
              </p>
            )}

            {/* description goes here */}

            <div className="mt-2">
              <Input
                type="textarea"
                rows={7}
                cols={10}
                label="short description *(max 150 words)"
                placeholder="Enter product description for quick review"
                {...register('short_description', {
                  required: 'short_description is required ',
                  validate: (value) => {
                    const wordCount = value.trim().split(/\s+/).length;
                    return (
                      wordCount <= 150 ||
                      `short_description should not exceed 150 words (currently ${wordCount} words)`
                    );
                  },
                })}
              />
              {errors.short_description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.short_description.message as string}
                </p>
              )}
            </div>

            {/* tags goes here */}
            <div className="mt-2">
              <Input
                label="tags*"
                placeholder="Enter product tags separated by commas"
                {...register('tags', {
                  required: 'seperate related products with commas ',
                })}
              />
              {errors.tags && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.tags.message as string}
                </p>
              )}
            </div>
            {/* warranty goes here */}
            <div className="mt-2">
              <Input
                label="Warranty*"
                placeholder="Enter product warranty details"
                {...register('warranty', {
                  required: 'warranty information is required ',
                })}
              />
              {errors.warranty && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.warranty.message as string}
                </p>
              )}
            </div>
            {/* slug goes here */}
            <div className="mt-2">
              <Input
                label="Slug*"
                placeholder="Enter product slug"
                {...register('slug', {
                  required: 'slug is required ',
                  pattern: {
                    value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                    message:
                      'slug can only contain lowercase letters, numbers, and hyphens',
                  },
                  minLength: {
                    value: 3,
                    message: 'slug must be at least 3 characters long',
                  },
                  maxLength: {
                    value: 50,
                    message: 'slug must be at most 50 characters long',
                  },
                })}
              />
              {errors.slug && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.slug.message as string}
                </p>
              )}
            </div>
            {/* brand goes here */}
            <div className="mt-2 whitespace-nowrap">
              <Input
                label="Brand*"
                placeholder="Enter product brand details"
                {...register('brand', {
                  required: 'brand information is required ',
                })}
              />
              {errors.brand && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.brand.message as string}
                </p>
              )}
            </div>
            {/* colors goes here */}
            <div className="mt-2">
              <ColorSelector control={control} errors={errors} />
            </div>
            <div className="mt-2">
              <CustomSpecifications control={control} errors={errors} />
            </div>
            <div className="mt-2">
              <CustomProperties control={control} errors={errors} />
            </div>
            <div className="mt-2">
              <label>Cash on Delivery*</label>
              <select
                {...register('cash_on_delivery', {
                  required: 'cash on delivery information is required ',
                })}
                defaultValue="yes"
                className="w-full outline-none border border-gray-700 bg-transparent "
              >
                <option value="yes" className="bg-black">
                  Yes
                </option>
                <option value="no" className="bg-black">
                  No
                </option>
                {errors.cash_on_delivery && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.cash_on_delivery.message as string}
                  </p>
                )}
              </select>
            </div>
          </div>
          <div className="w-2/4">
            {/* categories goes here */}
            <label className="block font-semibold text-gray-300 mb-1">
              Category*
            </label>
            {isLoading ? (
              <p className="text-gray-400">Loading categories...</p>
            ) : isError ? (
              <p className="text-red-500">Failed to load categories</p>
            ) : (
              <Controller
                name="category"
                control={control}
                rules={{ required: 'category is required' }}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full border outline-none border-gray-700 bg-transparent"
                  >
                    {' '}
                    <option value={''} className="bg-black">
                      Select Category
                    </option>
                    {categories?.map((category: string) => (
                      <option
                        value={category}
                        key={category}
                        className="bg-black"
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                )}
              />
            )}
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">
                {errors.category.message as string}
              </p>
            )}

            {/* showing subCategories */}
            <div className="mt-2">
              <label className="block font-semibold text-gray-300 mb-1">
                SubCategory*
              </label>
              <Controller
                name="subCategory"
                control={control}
                rules={{ required: 'subCategory is required' }}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full border outline-none border-gray-700 bg-transparent"
                  >
                    {' '}
                    <option value={''} className="bg-black">
                      Select SubCategory
                    </option>
                    {subCategories?.map((subCategory: string) => (
                      <option
                        value={subCategory}
                        key={subCategory}
                        className="bg-black"
                      >
                        {subCategory}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.subCategory && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.subCategory.message as string}
                </p>
              )}
            </div>
            {/* detailed description goes here */}
            <div className="mt-2">
              <label className="block font-semibold text-gray-300 mb-1">
                Detailed Description * (min 100 words)
              </label>
              <Controller
                name="detailed_description"
                control={control}
                rules={{
                  required: 'Detailed description is required',
                  validate: (value) => {
                    if (!value) return 'Detailed description is required';

                    // Create a temporary div to properly decode HTML
                    const div = document.createElement('div');
                    div.innerHTML = value;
                    const plainText = (
                      div.textContent ||
                      div.innerText ||
                      ''
                    ).trim();

                    console.log('Raw value:', value);
                    console.log('Plain text:', plainText);

                    const wordCount = plainText
                      .split(/\s+/)
                      .filter((word: string) => word.length > 0).length;

                    console.log('Word count:', wordCount);

                    return (
                      wordCount >= 100 ||
                      `Description must be at least 100 words (currently ${wordCount} words)`
                    );
                  },
                }}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              {errors.detailed_description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.detailed_description.message as string}
                </p>
              )}
            </div>
            {/* video url goes here */}
            <div className="mt-2">
              <Input
                label="Video URL"
                placeholder="https://www.youtube.com/embed/xyz123"
                {...register('video_url', {
                  pattern: {
                    value:
                      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
                    message: 'Please enter a valid YouTube URL',
                  },
                })}
              />
              {errors.video_url && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.video_url.message as string}
                </p>
              )}
            </div>
            {/* regular price goes here */}

            <div mt-2>
              <Input
                label="regular price"
                placeholder="$20"
                {...register('regular_price', {
                  valueAsNumber: true,
                  required: 'regular price is required',
                  min: { value: 1, message: 'price must be at least $1' },
                  validate: (value) =>
                    !isNaN(value) || 'regular price must be a number',
                })}
              />
              {errors.regular_price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.regular_price.message as string}
                </p>
              )}
            </div>
            {/* sale price goes here */}
            <div mt-2>
              <Input
                label="sale price"
                placeholder="$15"
                {...register('sale_price', {
                  valueAsNumber: true,
                  required: 'regular price is required',
                  min: { value: 1, message: 'price must be at least $1' },
                  validate: (value) => {
                    !isNaN(value) || 'regular price must be a number';
                    if (regularPrice && value >= regularPrice) {
                      return 'sale price must be less than regular price';
                    }
                    return true;
                  },
                })}
              />
              {errors.sale_price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.sale_price.message as string}
                </p>
              )}
            </div>
            {/* stock quantity goes here */}

            <div mt-2>
              <Input
                label="Stock *"
                placeholder="100"
                {...register('stock', {
                  valueAsNumber: true,
                  required: 'stock quantity is required',
                  min: {
                    value: 0,
                    message: 'stock quantity cannot be negative',
                  },
                  max: {
                    value: 1000,
                    message: 'stock quantity seems too high',
                  },
                  validate: (value) => {
                    !isNaN(value) || 'stock quantity must be a number';
                    if (!Number.isInteger(value)) {
                      return 'stock quantity must be an integer';
                    }
                    return true;
                  },
                })}
              />
              {errors.stock && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.stock.message as string}
                </p>
              )}
            </div>
          
          {/* size selector */}
            <div>
              <SizeSelector control={control} errors={errors} />
            </div>
     {/* discount Codes */}
            <div className="mt-3">
              <label className="block font-semibold text-gray-300 mb-1">
                Select Discount Codes *
              </label>

              {discountLoading ? (
                <p className="text-gray-300">Loading discount codes...</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {discount_codes?.map((code: any) => (
                    <button
                      key={code.id}
                      type="button"
                      className={`px-3 py-1 border rounded-md text-sm font-semibold border-gray-700  ${
                        watch('discount_codes')?.includes(code.id)
                          ? 'bg-blue-600 text-white border-blue-600 hover:bg-gray-800 '
                          : 'bg-gray-800 hover:bg-gray-700 border-gray-600 text-gray-300'
                      }`}
                      onClick={() => {
                        const currentSelection = watch('discount_codes') || [];
                        const updatedSelection = currentSelection?.includes(
                          code.id
                        )
                          ? currentSelection.filter(
                              (id: string) => id !== code.id
                            )
                          : [...currentSelection, code.id];
                        setValue('discount_codes', updatedSelection);
                      }}
                    >
                      {code.public_name} ({code.discountValue}
                      {code.discountType === 'percentage' ? '%' : '$'})
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {openImageModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-60">
          <div className="bg-gray-800 p-6 rounded-lg text-white  w-[450px]">
            <div className="flex justify-between items-center pb-3 mb-4">
              <h2 className="text-lg font-semibold">Enhance Product Image</h2>
              <X
                className="cursor-pointer"
                size={20}
                onClick={() => setOpenImageModal(!openImageModal)}
              />
            </div>

            <div className="w-full  h-[250px]  rounded-md overflow-hidden border border-gray-600">
              <Image
                src={selectedImage}
                alt="Enhanced Product"
                width={400}
                height={400}
              />
            </div>
            {selectedImage && (
              <div className="mt-4  space-y-2 ">
                <h3 className="text-white text-sm font-semibold">
                  AI Enhancement
                </h3>
                <div className="grid grid-cols-2 gap-3 mx-h-[250px]overflow-y-auto">
                  {enhancements.map(({ label, effect }) => (
                    <button
                      key={effect}
                      className={`p-2 rounded-md flex items-center gap-2 ${
                        activeEffect === effect
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      onClick={() => applyTransformation(effect)}
                      disabled={processing}
                    >
                      <Wand size={16} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mt-6 flex justify-end gap-3 ">
        {isChanged && (
          <button
            type="button"
            onClick={handleSaveDarft}
            className="px-4 py-2 bg-gray-700 text-white rounded-md"
          >
            save draft
          </button>
        )}

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md "
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default page;
