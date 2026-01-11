'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { EyeOff, Eye } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { countries } from 'apps/seller-ui/src/utils/countries';
import CreateShop from '../../../shared/modules/auth/create-shop';
import { useRouter } from 'next/navigation';
type formData = {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  country: string;
};
const Signup = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(3);
  const [serverError, setServerError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [sellerData, setSellerData] = useState<any | null>(null);
  const [sellerId, setSellerId] = useState('');
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // react hook form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formData>();
  // function to start resend otp timer
  const startResendTimer = () => {
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
  //    function to handle signup and call user-registration api
  const signupMutation = useMutation({
    mutationFn: async (data: formData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/seller-registration`,
        data
      );
      console.log('response data from signup:', response.data);
      return response.data;
    },
    onSuccess: (_, formData) => {
      console.log(formData);
      toast.success('OTP sent to your email.');
      setSellerData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message: string })?.message ||
        'invalid Credentials.';

      toast.error('registration failed: ' + errorMessage);

      console.log(errorMessage);
      setServerError(errorMessage);
    },
  });

  // function to handle verify otp and call verify-user api
  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!sellerData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/verify-seller`,
        {
          ...sellerData,
          otp: otp.join(''),
        }
      );
      console.log('response from verify otp', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log(
        'OTP verification success, full response:',
        JSON.stringify(data, null, 2)
      );
      console.log('seller object:', data?.newSeller);
      console.log('seller id:', data?.newSeller?.id);

      if (!data?.newSeller?.id) {
        console.error('No seller ID found in response!');
        setServerError('Invalid response from server');
        return;
      }

      toast.success('Seller registered successfully. Setting up your shop...');
      setSellerId(data.newSeller.id);
      setShowOtp(false);
      setActiveStep(2);
      console.log('Active step changed to: 2');
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message: string })?.message ||
        'OTP verification failed';
      toast.error(errorMessage);
      console.log('OTP verification error:', errorMessage);
      setServerError(errorMessage);
    },
  });

  const onSubmit = async (data: any) => {
    console.log(data);
    signupMutation.mutate(data);
  };
  // function to handle moving between otp inputs
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
  // function to handle backspace events for otp inputs
  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  //  connect stripe function

  const connectStripe = async () => {
    try {
      router.push('/success');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/create-stripe-link`,
        { params: { sellerId } }
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.log('stripe connection error', error);
    }
  };

  const resendOtp = () => {
    if (!sellerData) return;
    signupMutation.mutate(sellerData);
    setOtp(['', '', '', '']);
  };

  return (
    <div className="w-full  min-h-screen py-5 bg-[#f1f1f1] flex flex-col items-center ">
      {/* steps goes here */}
      <div className="relative  md:w-[50%] mb-8  flex  items-center justify-between ">
        <div className="absolute top-[25%] left-0 w-[80%] md:w-[90%]  h-1 bg-gray-300 z-0 " />

        {[1, 2, 3].map((step) => (
          <div key={step} className="relative z-10">
            <div
              className={`size-10 flex items-center justify-center rounded-full text-white font-bold   ${
                step <= activeStep ? 'bg-blue-600 ' : 'bg-gray-300'
              }`}
            >
              {step}
            </div>
            <span className="ml-[-14px]">
              {step === 1
                ? 'Create Account'
                : step === 2
                ? 'Setup Shop'
                : 'Connect Bank'}
            </span>
          </div>
        ))}
      </div>
      {/* steps content */}
      <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
        {/* step 1 => signup */}
        {activeStep === 1 && (
          <>
            {!showOtp ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className="text-2xl font-semibold text-center mb-4">
                  Create your account
                </h3>

                {/* name input */}
                <label className="text-gray-700 mb-1 block">Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
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
                {/* phone number input */}

                <label className="text-gray-700 mb-1 block">Phone number</label>
                <input
                  type="text"
                  placeholder="947182****"
                  className="w-full p-2 border  border-gray-300 outline-0 !rounded mb-1"
                  {...register('phone_number', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\+?[1-9]\d{1,14}$/,
                      message: 'Invalid phone number',
                    },
                    minLength: {
                      value: 10,
                      message: 'Phone number must be at least 10 digits long',
                    },
                    maxLength: {
                      value: 15,
                      message: 'Phone number must be at most 15 digits long',
                    },
                  })}
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-sm mb-2">
                    {String(errors.phone_number.message)}
                  </p>
                )}

                {/* country */}
                <label className="text-gray-700 mb-1 block">Country</label>
                <select
                  className="w-full p-2 border border-gray-300 outline-0  rounded-[4px] "
                  {...register('country', {
                    required: 'Country is required',
                  })}
                  name="country"
                  id="country"
                >
                  <option className="" value="">
                    {' '}
                    Select your country
                  </option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-500 text-sm mb-2">
                    {String(errors.country.message)}
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
                {/* submit button */}
                <button
                  type="submit"
                  className="w-full p-2 bg-blue-500 mt-2 text-white text-lg cursor-pointer rounded-lg"
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? 'Signing up...' : 'Signup'}
                </button>
                {signupMutation.isError &&
                  signupMutation.error instanceof AxiosError && (
                    <p className="text-red-500 text-sm mt-2">
                      {signupMutation.error.message}
                    </p>
                  )}

                <p className="text-center pt-3">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-500 underline">
                    Login
                  </Link>
                </p>
              </form>
            ) : (
              //   otp verification form
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
                  {canResend ? (
                    <button
                      className="  text-blue-500  cursor-pointer "
                      onClick={resendOtp}
                    >
                      Resend OTP
                    </button>
                  ) : (
                    `Resend OTP in ${timer} seconds`
                  )}
                </p>
                {serverError && (
                  <p className="text-red-500  text-sm mt-2">{serverError}</p>
                )}
              </div>
            )}
          </>
        )}

        {/* step 2 => create shop */}
        {activeStep === 2 && (
          <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
        )}

        {/* step 3 => connect bank */}
        {activeStep === 3 && (
          <div className="text-center">
            <h3 className="text-2xl font-semibold">Withdraw method</h3>
            <br />
            <button
              className="w-full m-auto flex items-center justify-center gap-3 text-lg bg-[#334155] text-white py-2 rounded-lg"
              onClick={connectStripe}
            >
              Connect Stripe{' '}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
