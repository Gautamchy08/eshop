'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import GoogleButton from '../../shared/components/google-button';
import { EyeOff, Eye } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

type formData = {
  email: string;
  password: string;
};

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  
  // react hook form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formData>();

  // login mutation handler

  const loginMutation =  useMutation({
    mutationFn: async (data: formData) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/login-user`, data,
        {withCredentials: true}
      );
      console.log('here is your login response',response.data);
      console.log('here is your response',response);

      if(response.status===200){
        toast.success('login successfull');
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      // redirect to dashboard or home page after successful login
      router.push('/');
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as { message: string })?.message || 'invalid Credentials.';

      toast.error('Login failed: ' + errorMessage);

      console.log(errorMessage);
      setServerError(errorMessage);
    }
  })

  const onSubmit = async (data: formData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full py-10 h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-poppins font-semibold text-black text-center">
        Login
      </h1>
      <p className="text-center text-lg font-medium py-3 text-black">
        Home. Login
      </p>

      <div className="w-full  flex justify-center">
        <div className="md:w-[480px]  p-8 bg-white  shadow rounded-lg">
          <h3 className="text-3xl font-semibold text-center mb-2  ">
            Login to Eshop
          </h3>
          <p className="text-gray-500 text-center mb-4 ">
            don't have an account?{' '}
            <span>
              {' '}
              <Link href={'/signup'} className="text-blue-500 ml-2 ">
                Signup here
              </Link>
            </span>
          </p>

          <GoogleButton />
          {/*  header for sign in with email */}
          <div className="flex items-center my-5 text-sm text-gray-400">
            <div className="flex-1 border-t border-gray-300" />

            <span className="px-3  "> or Sign in with Email</span>
            <div className="flex-1  border-t border-gray-300" />
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* email input */}
            <label className="text-gray-700 mb-1 block">Email</label>
            <input
              type="text"
              placeholder="support@mail.com"
              className="w-full p-2 border  border-gray-300 outline-0 !rounded mb-1"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mb-2">
                {String(errors.email.message)}
              </p>
            )}
            {/* password input */}
            <label className="text-gray-700 mb-1 block">Password</label>
            <div className="relative">
              <input
                type={passwordVisible ? 'text' : 'password'}
                placeholder="Min 6 characters"
                className="w-full p-2 border  border-gray-300 outline-0 !rounded mb-1"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters long',
                  },
                })}
              />
              {/* password visibility toggle */}
              <div className="absolute inset-y-0 flex items-center right-3  text-gray-400 ">
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? <EyeOff /> : <Eye />}
                </button>
               
                </div>
                 {/* password error message */}
                {errors.password && (
                  <p className="text-red-500 text-sm mb-2">
                    {String(errors.password.message)}
                  </p>
                )}
             
            </div>
            {/* remember me checkbox and forgot password link */}
                <div className="flex justify-between items-center my-4">
                    {/* remember me checkbox */}
                <label className="text-gray-700 mb-1 block">
                    <input 
                      type="checkbox"
                      className="mr-2"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      />
                    Remember me
                </label>
                <Link href ={'/forgot-password'} className="text-blue-500  text-sm ">
                    Forgot Password?
                </Link>
                      </div>

                    {/* submit button */}
                    <button
                      type="submit"
                      className="w-full p-2 bg-blue-500 text-white text-lg cursor-pointer rounded-lg"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? 'Logging in...' : 'Login'}
                    </button>
                    {serverError && (
                      <p className="text-red-500 text-sm mt-2 text-center">
                        {serverError}
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </div>
  );
};

export default Login;
