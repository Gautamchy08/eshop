import React from 'react';
import { Controller, useFieldArray } from 'react-hook-form';
import Input from '../input';
import { PlusCircle, Trash2 } from 'lucide-react';

const CustomSpecifications = ({ control, errors }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'custom_Specifications',
  });
  return (
    <div>
      <label className="block font-semibold bg-green-400 mb-1">
        Custom Specifications
      </label>
      <div className="flex flex-col gap-3">
        {fields.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Controller
              name={`custom_Specifications.${index}.name`}
              control={control}
              rules={{ required: 'Specification name is required' }}
              render={({ field }) => (
                <Input
                  label="specification name"
                  placeholder="battery life, Weight,Material"
                  {...field}
                />
              )}
            />

            <Controller
             name={`custom_Specifications.${index}.value`}
             rules={{required:'value is required'}}
             control={control}
             render={({field})=>(
                <Input 
                 label='Value'
                 placeholder='e.g. 4000 mah ,1.5kg, Plastic'
                 {...field}

                />
             )}
            />
            <button type='button'
            onClick={()=>remove(index)}
            className='text-red-500 hover:text-red-700'>
                    { <Trash2 size={20} />}
            </button>
          </div>
        ))}

         <button type='button'
          className=' flex items-center gap-2  text-blue-500  hover:text-blue-600 '
          onClick={()=>append({name:"",value:""})}
         >
            <PlusCircle size={16} />
            <span>Add Specification</span> 
         </button>
      </div>
      {errors.custom_Specifications && (
        <p className="text-red-500 text-sm mt-1">
          {errors.custom_Specifications.message as string}
        </p>
      )}
    </div>
  );
};

export default CustomSpecifications;
