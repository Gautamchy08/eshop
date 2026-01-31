import React from 'react'

const SectionTitle = ({title} : {title: string}) => {
  return (
    <div className='relative'>
        <h1 className=' relative z-10 font-semibold text-xl md:text-3xl'>
            {title}
        </h1>
        
      
    </div>
  )
}

export default SectionTitle
