import Link from 'next/link'
import React from 'react'
import { Search,CircleUser, Heart, ShoppingCart } from 'lucide-react'
import HeaderBottom from './header-bottom'


const Header = () => {
  return (
    <div  className='w-full bg-white'>
        <div className='w-[80%] py-2 m-auto flex items-center justify-between'>
             <div>
                <Link href='/'> <span className='text-3xl font-medium'>Eshop</span></Link>
             </div>
             <div className='w-[50%] relative'>
                <input type="text"  placeholder='search for products...'
                className='w-full px-4 font-poppins font-medium border-[2.5px] border-[#3489FF] outline-none h-[55px] '/>
             <div className=' w-[60px] cursor-pointer text-white flex items-center justify-center h-[55px]  bg-[#3489FF] absolute top-0 right-0 z-10'>
              <Search  />
             </div>
            
             </div>
              <div className='flex items-center gap-8'>
                {/* div for sign in */}
              <div className= 'flex items-center gap-2'>
                 <Link href='/login'  className='w-[50px] h-[50px] font-medium  border-2 flex items-center justify-center rounded-full border-[#c1cddeab]'><CircleUser  size={30} /></Link>
                <Link href='/login'> 
                <span className=' block font-medium'>hello,</span>
                <span className=' font-semibold'> Sign in</span>
                </Link>
                </div> 
          {/* div for wishlist  and cart*/}

          <div className='flex items-center gap-6'>
            <Link href='/wishlist' className='relative'>
           <Heart />
               <div className='size-6 border-2 border-white bg-red-600 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px] '>
                <span className='text-white font-medium text-sm'>0</span>
               </div>

            </Link>
              <Link href='/cart' className='relative'>
          <ShoppingCart />
               <div className='size-6 border-2 border-white bg-red-600 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px] '>
                <span className='text-white font-medium text-sm'>0</span>
               </div>

            </Link>
            </div>

             </div>
            </div>   
        <div className='border-b border-b-gray-400'/>
          <HeaderBottom />
          
    </div>

  )
}

export default Header
