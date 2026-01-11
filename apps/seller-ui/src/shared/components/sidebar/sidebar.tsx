'use client';

import useSeller from 'apps/seller-ui/src/hooks/useSeller';
import useSidebar from 'apps/seller-ui/src/hooks/useSidebar';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import Box from '../box';
import { Sidebar } from './sidebar.style';
import Link from 'next/link';
import {
  BellPlus,
  BellRing,
  CalendarPlus,
  ChartNoAxesGantt,
  DollarSign,
  EyeClosedIcon,
  Home,
  LogOut,
  Mail,
  PackageSearch,
  Settings,
  SquareChartGantt,
  SquarePlus,
  TicketPercent,
  Wallet,
} from 'lucide-react';
import SidebarItem from './sidebar.item';
import SidebarMenu from './sidebar.menu';

const SideBarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathname = usePathname();
  const { seller } = useSeller();

  console.log('seller from sidebar', seller);

  const getIconColor = (route: string) =>
    activeSidebar === route ? '#0085ff' : '#969696';

  useEffect(() => {
    setActiveSidebar(pathname);
  }, [pathname, setActiveSidebar]);
  return (
    <Box
      css={{
        height: '100vh',
        zIndex: 102,
        position: 'sticky',
        padding: '10px',
        top: 0,
        overflow: 'scroll',
        scrollbarWidth: 'none',
      }}
      className="siderbar-wrapper"
    >
      <Sidebar.Header>
        <Box>
          <Link
            href={'/'}
            className=" flex justify-center text-center gap-2   "
          >
            <EyeClosedIcon />
            <Box>
              <h3 className="text-xl font-medium text-[#ecedee]">
                {seller?.shop?.name}
              </h3>

              <h5 className="font-medium text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w[170px]">
                {seller?.shop?.address}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>

      <div className="block my-3 sidebar">
        <Sidebar.Body className="body sidebar">
          <SidebarItem
            title="Dashboard"
            icon={<Home color={getIconColor('/dashboard')} size={20} />}
            isActive={activeSidebar === '/dashboard'}
            href="/dashboard"
          />

          <div className="mt-2 block">
            <SidebarMenu title="main menu">
              <SidebarItem
                isActive={activeSidebar === '/dashboard/orders'}
                title="Orders"
                href="/dashboard/orders"
                icon={<SquareChartGantt size={24} color={getIconColor('/dashboard/orders')} />}
              />
              <SidebarItem
                isActive={activeSidebar === '/dashboard/payments'}
                title="Payments"
                href="/dashboard/payments"
                icon={<Wallet size={24} color={getIconColor('/dashboard/payments')} />}
              />
            </SidebarMenu>

            <SidebarMenu title="products">
               <SidebarItem
                isActive={activeSidebar === '/dashboard/create-product'}
                title="Create Product"
                href="/dashboard/create-product"
                icon={<SquarePlus size={24} color={getIconColor('/dashboard/create-product')} />}
              />
               <SidebarItem
                isActive={activeSidebar === '/dashboard/all-products'}
                title="All Products"
                href="/dashboard/all-products"
                icon={<PackageSearch size={24} color={getIconColor('/dashboard/all-products')} />}
              />
            </SidebarMenu>

            <SidebarMenu title = 'events'>
               <SidebarItem
                isActive={activeSidebar === '/dashboard/create-event'}
                title="Create Event"
                href="/dashboard/create-event"
                icon={<CalendarPlus size={26} color={getIconColor('/dashboard/create-event')} />}
              />

               <SidebarItem
                isActive={activeSidebar === '/dashboard/all-events'}
                title="All Events"
                href="/dashboard/all-events"
                icon={<BellPlus size={26} color={getIconColor('/dashboard/all-events')} />}
              />
            </SidebarMenu>
            <SidebarMenu title = 'Controllers'>
               <SidebarItem
                isActive={activeSidebar === '/dashboard/inbox'}
                title="Inbox"
                href="/dashboard/inbox"
                icon={<Mail size={26} color={getIconColor('/dashboard/inbox')} />}
              />

               <SidebarItem
                isActive={activeSidebar === '/dashboard/settings'}
                title="Settings"
                href="/dashboard/settings"
                icon={<Settings size={26} color={getIconColor('/dashboard/settings')} />}
              />
               <SidebarItem
                isActive={activeSidebar === '/dashboard/notifications'}
                title="Notifications"
                href="/dashboard/notifications"
                icon={<BellRing size={26} color={getIconColor('/dashboard/notifications')} />}
              />
            </SidebarMenu>

              <SidebarMenu title = 'Extras'>
               <SidebarItem
                isActive={activeSidebar === '/dashboard/discount-codes'}
                title="Discount Codes"
                href="/dashboard/discount-codes"
                icon={<TicketPercent size={26} color={getIconColor('/dashboard/discount-codes')} />}
              />

               <SidebarItem
                isActive={activeSidebar === '/logout'}
                title="Logout "
                href="/logout"
                icon={<LogOut size={26} color={getIconColor('/logout')} />}
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
};

export default SideBarWrapper;
