'use client';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import {  useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

type formData = {
  email: string;
  password: string;
};

const ForgotPassword = () => {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [otp, setOtp] = useState(['','','','']);
  const [userEmail, setUserEmail] = useState<string|null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();


  // timer for resend otp
  const startResendTimer = () => {
    setCanResend(false);
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
//   request otp mutation
  const requestOtpMutation = useMutation({
    mutationFn: async ({email}: {email: string}) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/forgot-password-user`, { email });
      return response.data;
    },
    onSuccess : (_,{email})=>{
      setUserEmail(email);
      setStep('otp');
      startResendTimer();
      setServerError(null);
      setCanResend(false);
    },
    onError : (error:AxiosError)=>{
        const errorMessage = (error.response?.data as {message: string})?.message || "invalid OTP. Please try again.";

        setServerError(errorMessage);

    }
  });

  // verify otp mutation

  const verifyOtpMutation = useMutation({
    mutationFn : async ()=>{
      if( !userEmail ) return;

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/verify-forgot-password-user`, {
        email: userEmail,
        otp: otp.join(''),
      });
      return response.data;
    },
    onSuccess :()=>{
        setStep('reset');
        setServerError(null);
    },
    onError : (error:AxiosError)=>{
        const errorMessage = (error.response?.data as {message: string})?.message || "invalid OTP. Please try again.";  
        setServerError(errorMessage);
    }
  });

  // reset password mutation

  const resetPasswordMutation = useMutation({
    mutationFn : async ({password} : {password:string})=>{
      if(!password)return;
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/reset-password-user`, { email: userEmail, newPassword: password });

      return response.data;
    },
    onSuccess : ()=>{
      setStep('email');
      toast.success('Password reset successful. Please login with your new password.');
      setServerError(null);
      router.push('/login');
    },
    onError : (error:AxiosError)=>{
        const errorMessage = (error.response?.data as {message: string})?.message || "Failed to reset password. Please try again.";  
        setServerError(errorMessage);
    }
  }) 

  // function to handle otp input change 

   const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return; // only allow digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // move to next input if value is entered
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  //   handle otp key down for backspace navigation

   const handleOtpKeyDown = (
      index: number,
      e: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    const onSubmitEmail = ({email} : {email:string})=>{
        requestOtpMutation.mutate({email});
    };

    const onSubmitPassword = ({password}:{password:string})=>{
        resetPasswordMutation.mutate({password});
    } 

  
  // react hook form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formData>();

  // login mutation handler

 
  const onSubmit = async (data: formData) => {
   console.log('here is your form data',data);
  };

  return (
    <div className="w-full py-10 h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-poppins font-semibold text-black text-center">
        Forgot  Password
      </h1>
      <p className="text-center text-lg font-medium py-3 text-black">
        Home. Forgot Password
      </p>

      <div className="w-full  flex justify-center">
        <div className="md:w-[480px]  p-8 bg-white  shadow rounded-lg">
         {step === 'email' && (<>
           <h3 className="text-3xl font-semibold text-center mb-2  ">
            Login to Eshop
          </h3>
          <p className="text-gray-500 text-center mb-4 ">
            Go back to?{' '}
            <span>
              {' '}
              <Link href={'/login'} className="text-blue-500 ml-2 ">
                Login here
              </Link>
            </span>
          </p>

          {/*  header for forgot password */}
       
          <form onSubmit={handleSubmit(onSubmitEmail)}>
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
                 
                    {/* submit button */}
                    <button
                      type="submit"
                      className=" mt-4 w-full p-2 bg-blue-500 text-white text-lg cursor-pointer rounded-lg"
                      disabled={requestOtpMutation.isPending}
                    >
                      {requestOtpMutation.isPending? 'Sending OTP...':'Submit'}
                    </button>
                    {serverError && (
                      <p className="text-red-500 text-sm mt-2 text-center">
                        {serverError}
                      </p>
                    )}
                  </form>
         </>)}

         {step === 'otp' && (<>
             <div>
              <h3 className="text-xl font-semibold text-center mb-4">
                Enter OTP
              </h3>

              <div className="flex justify-center gap-6">
                {/* OTP input fields */}
                {otp?.map((digit, idx) => (
                  <input
                    type="text"
                    key={idx}
                    ref={(el) => {
                      if (el) {
                        inputRefs.current[idx] = el;
                      }
                    }}
                    maxLength={1}
                    placeholder={`${idx + 1}`}
                    aria-label={`OTP digit ${idx + 1}`}
                    className="w-12 h-12 border border-gray-300 text-center text-xl outline-none rounded-md "
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  />
                ))}
              </div>
              {/* otp submit button */}
              <button
                type="submit"
                className="w-full mt-4 bg-blue-500 text-white text-lg cursor-pointer p-2 rounded-lg "
                disabled={verifyOtpMutation.isPending}
                onClick={() => verifyOtpMutation.mutate()}
              >
                {' '}
                {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
              </button>
              {/*resend otp implementation on condition basis  */}
              <p className="text-center text-sm mt-4 ">
                {/* {canResend ? (
                  <button
                    className="  text-blue-500  cursor-pointer "
                    onClick={resendOtp}
                  >
                    Resend OTP
                  </button>
                ) : (
                  `Resend OTP in ${timer} seconds`
                )} */}
              </p>
              {serverError &&
                
                  <p className="text-red-500  text-sm mt-2">
                   {serverError}
                  </p>
                }
            </div>
         </>)}

          {step === 'reset' && (
            <>
            <h3 className='text-xl font-semibold text-center  mb-4'>Reset Password</h3>
            <form onSubmit = {handleSubmit(onSubmitPassword)}>
              {/* new password input  */}
              <label className='block text-gray-600 mb-1'>New Password</label>
                 <input
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
                {errors.password && (
                  <p className="text-red-500 text-sm mb-2">
                    {String(errors.password.message)} 
                  </p>
                )}

                <button
                type="submit"
                className="w-full p-2 bg-blue-500 mt-2 text-white text-lg cursor-pointer rounded-lg"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
              </button>
              {serverError && (
              <p className="text-red-500 text-sm mt-2 text-center">
                {serverError}
              </p>
            )}
                 

            </form>
            </>
          )}
                </div>
              </div>
            </div>
  );
};

export default ForgotPassword;
