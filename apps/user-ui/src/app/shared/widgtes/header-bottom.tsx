'use client'
import Link from 'next/link'
import { navItems } from 'apps/user-ui/src/configs/constants'
import { AlignLeft, ChevronDown } from 'lucide-react'
import React, { useEffect } from 'react'
import { useState } from 'react'
const HeaderBottom = () => {
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
                    <div>Sticky Header</div>
                )}
              </div>

       </div>
    </div>
  )
}

export default  HeaderBottom