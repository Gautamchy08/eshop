import { X } from 'lucide-react';
import React from 'react'

const DeleteDiscountcodeModel = ( {discount,onClose,onConfirm}:{discount:any; onClose : ()=>void; onConfirm?: any}) => {
  return (
   <div className="fixed top-0  left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 w-[450px] shadow-lg">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                <h3 className='tex-xl text-white'>Delete Discount Code</h3>
                <button onClick={onClose} className="text-white text-xl font-bold hover:text-gray-400 transition"> 
                    <X  size={20}/>{}
                </button>
                </div>
                {/* warning message */}
                <p className='text-gray-300 mt-4'>
                    Are you sure you want to delete the discount code <span className='font-semibold text-white'>{discount?.public_name}</span>? <br />
                    This action cannot be undone.
                </p>
                <div className='flex justify-end gap-3 mt-6'>
                    <button onClick={onClose}
                    className='bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition '>Cancel</button>
                    <button onClick={onConfirm}
                    className='bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md transition'>Delete</button>
                </div>
            </div>
            </div>
  )
}

export default DeleteDiscountcodeModel
