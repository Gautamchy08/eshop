'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { MoveRight } from 'lucide-react'; // Assuming lucide-react based on component name
import Image from 'next/image';

const Hero = () => {
  const router = useRouter();

  return (
    <div className="bg-[#115061] h-[85vh] flex flex-col justify-center w-full">
      <div className="w-[90%] md:w-[80%] m-auto md:flex h-full items-center">
        {/* Left Content */}
        <div className="md:w-1/2">
          <p className="font-Roboto font-normal text-white pb-2 text-xl">
            Starting from 40$
          </p>
          <h1 className="text-white text-6xl font-extrabold font-Roboto">
            The best watch <br />
            Collection 2025
          </h1>
          <p className="font-Oregano text-3xl pt-4 text-white">
            Exclusive offer <span className="text-yellow-400">10%</span> off
            this week
          </p>
          <br />
          <button
            onClick={() => router.push('/products')}
            className="w-[140px] gap-2 font-semibold h-[40px] flex items-center justify-center bg-white text-black hover:bg-gray-200 transition-all rounded-md"
            suppressHydrationWarning
          >
            Shop Now <MoveRight size={20} />
          </button>
        </div>

        {/* Right Content - Image */}
        <div className="md:w-1/2 flex justify-center">
          <Image
            src="/hero-image.jpg"
            alt="Slider Image"
            width={450}
            height={450}
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
