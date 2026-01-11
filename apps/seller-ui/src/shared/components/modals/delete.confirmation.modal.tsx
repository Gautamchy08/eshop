import { X } from 'lucide-react';
import React from 'react';

const DeleteConfirmationModal = ({
  product,
  onConfirm,
  onRestore,
  onClose,
}: any) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center ">
      <div className="bg-gray-800 rounded-lg p-6 md:w-[450px] shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-600  pb-3">
          <h3 className="text-xl text-white">Delete Product</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} /> {}
          </button>
        </div>

        {/* Body */}
        <p className="text-gray-300 mt-4">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-white">{product?.title}</span>{' '}
          <br />
          this product will be moved to deleted products section.remove after 24
          hours. you can recover this within this time
        </p>
        {/* Actions */}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-md text-white transition "
          >
            Cancel
          </button>
          <button
            onClick={!product?.isDeleted ? onConfirm : onRestore}
            className={`${
              product?.isDeleted
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            } py-2 px-4 rounded-md text-white font-semibold transition`}
          >
            {!product?.isDeleted ? 'Delete' : 'Restore'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
