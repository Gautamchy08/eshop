import React from 'react'

const GoogleButton = () => {
  return (
    <div className='w-full flex justify-center'>
        <div className='h-[40px] cursor pointer border rounded-lg  shadow-sm border-blue-100 flex items-center justify-center '>

          <img src ="https://cdn-icons-png.flaticon.com/128/281/281764.png" alt="google logo" className='w-[20px] h-[18px] inline text-center ml-2' />
            <span className='pl-3 font-medium text-black mr-2 '>Continue with Google</span>
        </div>
    </div>
  )
} 

export default GoogleButton
