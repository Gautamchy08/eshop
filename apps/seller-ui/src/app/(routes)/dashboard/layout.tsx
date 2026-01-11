
import React from 'react'
import SideBarWrapper from 'apps/seller-ui/src/shared/components/sidebar/sidebar'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className=' flex h-full min-h-screen bg-black flex text-white'>
        {/* sidebar */}
        <aside className='w-[280px] min-w-[250px] max-w-[300px] border-r border-r-slate-800 text-white p-4'>
            <div className='sticky top-0'>
                <SideBarWrapper />
            </div>

        </aside>

{/* main content area */}

{/* <AppSidebar/> */}
<main className='flex-1'>
    <div className='overflow-auto'>
      {children}

    </div>
</main>

    </div>
  )
}

export default Layout

// import {
//   SidebarProvider,
//   SidebarTrigger,
// } from 'apps/seller-ui/src/components/ui/sidebar';
// import { AppSidebar } from 'apps/seller-ui/src/shared/components/sidebar/sidebar';

// export default function Layout({ children }: { children: React.ReactNode }) {
//   return (
//     <SidebarProvider
//       style={
//         {
//           '--sidebar-width': '16rem',
//         } as React.CSSProperties
//       }
//     >
//       <AppSidebar />
//       <div className="h-full min-h-screen  flex flex-col flex-1">
//         <header className="border-b">
//           <SidebarTrigger className="bg-white" />
//         </header>
//         <main className="flex-1">{children}</main>
//       </div>
//     </SidebarProvider>
//   );
// }
