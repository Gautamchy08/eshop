'use client'
import Link from 'next/link'
import { navItems } from '@/configs/constants'
import { AlignLeft, ChevronDown, CircleUser, Heart, ShoppingCart } from 'lucide-react'
import React, { useEffect } from 'react'
import { useState } from 'react'
import useUser from '@/hooks/useUser'
import { useStore } from '@/store'
const HeaderBottom = () => {


   const wishlist  = useStore((state:any)=> state.wishlist);
   const cart  = useStore((state:any)=> state.cart);
   const {user,isLoading} = useUser();
   const [show, setShow] = useState(false)
   const [isSticky, setIsSticky] = useState(false)

   // track scroll position

   useEffect(() => {
   

    const handleScroll = () => {

        if(window.scrollY > 100){
            setIsSticky(true)
        }else{
            setIsSticky(false)
        }
    };
    window.addEventListener('scroll', handleScroll)
    return () => {
        window.removeEventListener('scroll', handleScroll)
    } ;


   }, [])

  return (
    <div className = {`w-full transition-all duration-300  ${isSticky ? 'fixed top-0 left-0 z-50 shadow-lg bg-white':'relative' } `}>

       <div className= {`w-[80%] m-auto relative  flex  items-center  justify-between {isSticky ? 'pt-3' : 'py-0'} `}>

           {/* all dropdowns */}

           <div className={`w-[260px] ${isSticky && '-mb-2 '} cursor-pointer flex items-center justify-between  px-5 h-[50px] bg-[#3489FF] text-white`}
           onClick={()=>setShow(!show)}> 
           <div className='flex items-center gap-2'>
            <AlignLeft color = 'white' />
            <span className='font-medium text-white'> All Departments</span>
           </div>
           <ChevronDown color='white' />

           </div>
              {/* dropdown items */}

              {show && (
                <div className={`absolute left-0 ${isSticky ? 'top-[70px]' : 'top-[50px]'} w-[260px] h-[400px] bg-[#f8f2f2] `}>

                </div>
              )}

              {/* navigation links */}
              <div className=' flex items-center '>
                {navItems.map((i : NavItemsTypes,idx:number) => (
                  <Link href={i.href}
                    key={idx} className='px-5 font-medium text-lg '>
                        {i.title}
                    </Link>
                  
                ))}
              </div>

              <div>

                {isSticky && (
                             <div className='flex items-center gap-8'>
                {/* div for sign in */}
              <div className= 'flex items-center gap-2'>
                {
                  !isLoading && user ? (
                    <>
   <Link href='/profile'  className='w-[50px] h-[50px] font-medium  border-2 flex items-center justify-center rounded-full border-[#c1cddeab]'><CircleUser  size={30} /></Link>
                <Link href='/login'> 
                <span className=' block font-medium'>hello,</span>
                <span className=' font-semibold'>{user.name.split(' ')[0]}</span>
                </Link>
                    </>
                  ):<>  
                 <Link href='/login'  className='w-[50px] h-[50px] font-medium  border-2 flex items-center justify-center rounded-full border-[#c1cddeab]'><CircleUser  size={30} /></Link>
                <Link href='/login'> 
                <span className=' block font-medium'>hello,</span>
                <span className=' font-semibold'>{isLoading ? 'Loading...' : 'Sign in'}</span>
                </Link>
                  </>
                }
                </div> 
          {/* div for wishlist  and cart*/}

          <div className='flex items-center gap-6'>
            <Link href='/wishlist' className='relative'>
           <Heart /> 
               <div className='size-6 border-2 border-white bg-red-600 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px] '>
                <span className='text-white font-medium text-sm'>{wishlist?.length}</span>
               </div>

            </Link>
              <Link href='/cart' className='relative'>
          <ShoppingCart />
               <div className='size-6 border-2 border-white bg-red-600 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px] '>
                <span className='text-white font-medium text-sm'>{cart?.length}</span>
               </div>

            </Link>
            </div>

             </div>
                )}
              </div>

       </div>
    </div>
  )
}

export default  HeaderBottom