'use client';

import axiosInstance from '@/utils/axiosInstance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Plus,
  Trash2,
  MapPin,
  Home,
  Briefcase,
  X,
  Loader2,
  Star,
} from 'lucide-react';

const ShippingAddressAction = () => {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      label: 'home',
      name: '',
      city: '',
      street: '',
      country: 'India',
      zip: '',
      isDefault: false,
    },
  });

  const { mutate: addAddress, isPending: addingAddress } = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosInstance.post('/api/add-address', payload);
      return res.data.address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-addresses'] });
      reset();
      setShowModal(false);
    },
  });

  const { mutate: deleteAddress } = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.delete(`/api/delete-address/${id}`);
      return res.data.address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-addresses'] });
    },
  });

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['shipping-addresses'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/shipping-addresses');
      return res.data.addresses;
    },
  });

  const onSubmit = async (data: any) => {
    addAddress({
      ...data,
      isDefault: data.isDefault ? true : false,
    });
  };

  const getLabelIcon = (label: string) => {
    switch (label) {
      case 'home':
        return <Home size={14} />;
      case 'office':
        return <Briefcase size={14} />;
      default:
        return <MapPin size={14} />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Shipping Addresses
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your delivery addresses
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition cursor-pointer"
        >
          <Plus size={16} />
          Add Address
        </button>
      </div>

      {/* Loading State */}
      {addressesLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-indigo-500" />
        </div>
      )}

      {/* Empty State */}
      {!addressesLoading && (!addresses || addresses.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MapPin size={48} className="text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            No addresses yet
          </h3>
          <p className="text-sm text-gray-400">
            Add a shipping address to get started.
          </p>
        </div>
      )}

      {/* Address Cards */}
      {!addressesLoading && addresses?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr: any) => (
            <div
              key={addr.id}
              className={`relative p-5 rounded-xl border-2 transition ${
                addr.isDefault
                  ? 'border-indigo-300 bg-indigo-50/50'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              {/* Default Badge */}
              {addr.isDefault && (
                <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                  <Star size={10} fill="currentColor" /> Default
                </span>
              )}

              {/* Label */}
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                  {getLabelIcon(addr.label)}
                  {addr.label}
                </span>
              </div>

              {/* Name & Address */}
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {addr.name}
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                {addr.street}, {addr.city}
                <br />
                {addr.country} - {addr.zip}
              </p>

              {/* Delete Button */}
              <button
                onClick={() => deleteAddress(addr.id)}
                className="mt-4 flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 transition cursor-pointer"
              >
                <Trash2 size={13} />
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 relative animate-in fade-in zoom-in duration-200">
            {/* Close */}
            <button
              onClick={() => {
                setShowModal(false);
                reset();
              }}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition cursor-pointer"
            >
              <X size={20} className="text-gray-400" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Add New Address
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Fill in the details below
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label
                </label>
                <select
                  {...register('label')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50"
                >
                  <option value="home">🏠 Home</option>
                  <option value="office">🏢 Office</option>
                  <option value="other">📍 Other</option>
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  placeholder="John Doe"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Street */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  {...register('street', { required: 'Street is required' })}
                  placeholder="123 Main Street"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50"
                />
                {errors.street && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.street.message}
                  </p>
                )}
              </div>

              {/* City + Zip */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    {...register('city', { required: 'City is required' })}
                    placeholder="Mumbai"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50"
                  />
                  {errors.city && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    {...register('zip', { required: 'ZIP is required' })}
                    placeholder="400001"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50"
                  />
                  {errors.zip && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.zip.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  {...register('country', { required: 'Country is required' })}
                  placeholder="India"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50"
                />
              </div>

              {/* Default Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isDefault')}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-600">
                  Set as default address
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={addingAddress}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addingAddress && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {addingAddress ? 'Saving...' : 'Save Address'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingAddressAction;
