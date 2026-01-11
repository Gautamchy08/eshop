import React from 'react'
import Link from 'next/link'

interface props {
title : string,


icon : React.ReactNode,
isActive?: boolean,
href:string
}
const SidebarItem = ({icon,title,isActive,href}:props) => {
  return (
    <Link href={href} className='my-2 block'>
      <div className={`flex gap-2 w-full min-h-12  text-white h-full items-center px-[13px] rounded-lg cursor-pointer transition hover:bg-[#2b2f31] ${isActive && "scale-[.98] bg-[#0f3158] fill-blue-200 hover:[#015836d6] "}`}>
        {icon}
        <h5 className='text-lg text-slate-200'>{title}</h5>
      </div>
    </Link>
  )
}

export default SidebarItem
