'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import GoogleButton from '../../shared/components/google-button';
import { EyeOff, Eye } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

type formData = {
  name: string;
  email: string;
  password: string;
};

const Signup = () => {
  const [serverError, setServerError] = useState<string|null>(null)
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [userData, setUserData] = useState<formData | null>(null);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-registration`,
        data
      );

      return response.data;
    },
    onSuccess: (_, formData) => {
      setUserData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
     onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as { message: string })?.message || 'invalid Credentials.';

      toast.error('registration failed: ' + errorMessage);

      console.log(errorMessage);
      setServerError(errorMessage);
    }
  });

  // function to handle verify otp and call verify-user api
  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/verify-user`,
        {
          ...userData,
          otp: otp.join(''),
        }
      );
      return response.data;
    },
    onSuccess: () => {
      router.push('/login');
    },
  });

  const onSubmit = async (data: formData) => {
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

  const resendOtp = () => {
    if (!userData) return;
    signupMutation.mutate(userData);
    setOtp(['', '', '', '']);
  };

  return (
    <div className="w-full py-2 h-[105vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-poppins font-semibold text-black text-center">
        Signup
      </h1>
      <p className="text-center text-lg font-medium py-3 text-black">
        Home. Signup
      </p>

      <div className="w-full  flex justify-center">
        <div className="md:w-[480px]  p-8 bg-white  shadow rounded-lg">
          {/* header for sign up */}
          <h3 className="text-3xl font-semibold text-center mb-2  ">
            Sign up for Eshop
          </h3>
          {/* already have an account */}
          <p className="text-gray-500 text-center mb-4 ">
            already have an account?{' '}
            <span>
              {' '}
              <Link href={'/login'} className="text-blue-500 ml-2 ">
                Login here
              </Link>
            </span>
          </p>
          <GoogleButton />
          {/*  header for sign up with email */}
          <div className="flex items-center my-2 text-sm text-gray-400">
            <div className="flex-1 border-t border-gray-300" />

            <span className="px-3  "> or Sign up with Email</span>
            <div className="flex-1  border-t border-gray-300" />
          </div>
          /*
          {!showOtp ? (
            <form onSubmit={handleSubmit(onSubmit)}>
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
              {serverError &&
                
                  <p className="text-red-500  text-sm mt-2">
                   {serverError}
                  </p>
                }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;

// <-------- React Hook Form explanation with TypeScript types -------->

// 1. Define the form data structure using a TypeScript type

// const { 
//   register,           // Connect input fields only those defined in formData
//   handleSubmit,       // Handle form submission
//   formState: { errors, isSubmitting },  // Track form state
//   watch,              // Watch field values in real-time
//   reset,              // Reset form to default values
//   getValues,          // Get all form values programmatically
//   setValue            // Set field value programmatically
// } = useForm<formData>({
//   defaultValues: {
//     name: '',
//     email: '',
//     password: ''
//   }
// });



// 2. This is how handleSubmit works internally =>
// const handleSubmit = (callback) => {
//   return (event) => {
//     event.preventDefault();

//    // Step 1: Validate all registered fields
//     const validationErrors = validateAllFields();

//     if (Object.keys(validationErrors).length === 0) {
    //   // Step 2: If valid, collect all values
//       const formData = {
//         name: inputValues.name,
//         email: inputValues.email,
//         password: inputValues.password,
//       };

//       // Step 3: Pass to your callback function
//       callback(formData); // ← This is your onSubmit!
//     }
//   };
// };
