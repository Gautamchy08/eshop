import { forwardRef } from 'react';
import React from 'react';


interface BaseProps {
    type?: "text"|"number"|"email"|"password"|"textarea";
    className?: string;
    label?: string;

}

type InputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>;
type TextAreaProps = BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>;
type props = InputProps | TextAreaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, props>(({
    type="text",
    className,
    label,
    ...props
}, ref) => {

    return(
         <div className=' w-full '>
            {label && (
                <label className='block mb-1 text-sm font-semibold text-gray-300'>
                    {label}
                </label>
            )}

            {type==="textarea" ? (
                <textarea 
                ref = {ref as React.Ref<HTMLTextAreaElement>}
                className={`w-full outline-none border border-gray-600 bg-transparent p-2 rounded-md text-white ${className} `}
                {...(props as TextAreaProps)} />

            
            ):(
                <input type={type} 
                ref = {ref as React.Ref<HTMLInputElement>}
                className={`w-full outline-none border border-gray-600 bg-transparent p-2 rounded-md text-white ${className} `}
                {...(props as InputProps)} 
                     />       
            )}
         </div>

    );

});

Input.displayName = "Input";

export default Input;