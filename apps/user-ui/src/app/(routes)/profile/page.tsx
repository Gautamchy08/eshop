'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import useUser from '@/hooks/useUser';
import axiosInstance from '@/utils/axiosInstance';
import StatCard from '@/app/shared/components/cards/stat.card';
import QuickActionCard from '@/app/shared/components/cards/quick-action.card';
import ShippingAddressAction from '@/app/shared/components/shippingAddress.tsx';
import {
  User,
  ShoppingBag,
  Inbox,
  Bell,
  MapPin,
  Lock,
  LogOut,
  Loader2,
  Package,
  Clock,
  CheckCircle,
  Camera,
  Mail,
  Calendar,
  Settings,
  CreditCard,
  Award,
  HelpCircle,
  Gift,
  Eye,
  EyeOff,
} from 'lucide-react';

const navItems = [
  { key: 'profile', label: 'Profile', icon: <User size={18} /> },
  { key: 'orders', label: 'My Orders', icon: <ShoppingBag size={18} /> },
  { key: 'inbox', label: 'Inbox', icon: <Inbox size={18} /> },
  { key: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
  { key: 'address', label: 'Shipping Address', icon: <MapPin size={18} /> },
  { key: 'password', label: 'Change Password', icon: <Lock size={18} /> },
];

const ProfilePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { user, isLoading } = useUser();
  const queryTab = searchParams.get('active') || 'profile';
  const [activeTab, setActiveTab] = useState(queryTab);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  useEffect(() => {
    if (activeTab !== queryTab) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('active', activeTab);
      router.replace(`/profile?${newParams.toString()}`);
    }
  }, [activeTab]);

  const logoutHandler = async () => {
    await axiosInstance.get('/api/logout-user').then(() => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/login');
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg('Passwords do not match');
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg('');
    try {
      await axiosInstance.post('/api/reset-user-password', {
        email: user?.email,
        newPassword,
      });
      setPasswordMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPasswordMsg('Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Full-page loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-[95%] xl:w-[90%] 2xl:w-[85%] mx-auto py-8">
        {/* Stat Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Orders"
            count={12}
            icon={<Package size={22} />}
          />
          <StatCard title="Processing" count={3} icon={<Clock size={22} />} />
          <StatCard
            title="Completed"
            count={9}
            icon={<CheckCircle size={22} />}
          />
        </div>

        {/* 3-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <aside className="w-full lg:w-[240px] flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* User mini-card */}
              <div className="p-5 border-b border-gray-100 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <p className="text-sm font-semibold text-gray-900 mt-3 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>

              {/* Nav Items */}
              <nav className="p-2 space-y-1">
                {navItems.map((item) => (
                  <NavItem
                    key={item.key}
                    label={item.label}
                    icon={item.icon}
                    active={activeTab === item.key}
                    onClick={() => setActiveTab(item.key)}
                  />
                ))}
                <NavItem
                  label="Logout"
                  icon={<LogOut size={18} />}
                  danger
                  onClick={logoutHandler}
                />
              </nav>
            </div>
          </aside>

          {/* Center Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    My Profile
                  </h2>

                  {/* Avatar Section */}
                  <div className="flex items-center gap-5 mb-8">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                        {user?.images && user.images.length > 0 ? (
                          <img
                            src={user.images[0].url}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-3xl font-bold">
                            {user?.name?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      {/* Edit Overlay */}
                      <button className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Camera size={20} className="text-white" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user?.name}
                      </h3>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <button className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
                        Change Photo
                      </button>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <User size={14} />
                        <span className="text-xs font-medium uppercase tracking-wide">
                          Full Name
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.name || '—'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Mail size={14} />
                        <span className="text-xs font-medium uppercase tracking-wide">
                          Email
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.email || '—'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Calendar size={14} />
                        <span className="text-xs font-medium uppercase tracking-wide">
                          Member Since
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              }
                            )
                          : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    My Orders
                  </h2>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <ShoppingBag size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">
                      No orders yet
                    </h3>
                    <p className="text-sm text-gray-400">
                      Your order history will appear here.
                    </p>
                  </div>
                </div>
              )}

              {/* Inbox Tab */}
              {activeTab === 'inbox' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Inbox
                  </h2>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Inbox size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">
                      No messages
                    </h3>
                    <p className="text-sm text-gray-400">
                      Your messages will appear here.
                    </p>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Notifications
                  </h2>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Bell size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">
                      All caught up!
                    </h3>
                    <p className="text-sm text-gray-400">
                      No new notifications right now.
                    </p>
                  </div>
                </div>
              )}

              {/* Shipping Address Tab */}
              {activeTab === 'address' && <ShippingAddressAction />}

              {/* Change Password Tab */}
              {activeTab === 'password' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Change Password
                  </h2>
                  <form
                    onSubmit={handleChangePassword}
                    className="max-w-md space-y-4"
                  >
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrent ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent(!showCurrent)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                        >
                          {showCurrent ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNew ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew(!showNew)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                        >
                          {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50"
                      />
                    </div>

                    {passwordMsg && (
                      <p
                        className={`text-sm font-medium ${
                          passwordMsg.includes('success')
                            ? 'text-green-600'
                            : 'text-red-500'
                        }`}
                      >
                        {passwordMsg}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {passwordLoading && (
                        <Loader2 size={16} className="animate-spin" />
                      )}
                      {passwordLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </main>

          {/* Right Quick Panel */}
          <aside className="w-full lg:w-[240px] flex-shrink-0">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">
                Quick Actions
              </h3>
              <QuickActionCard
                icon={<Settings size={16} />}
                title="Settings"
                description="Account preferences"
                onClick={() => setActiveTab('profile')}
              />
              <QuickActionCard
                icon={<CreditCard size={16} />}
                title="Billing History"
                description="View payment history"
                onClick={() => setActiveTab('orders')}
              />
              <QuickActionCard
                icon={<Award size={16} />}
                title="Your Badge"
                description="Member rewards tier"
              />
              <QuickActionCard
                icon={<HelpCircle size={16} />}
                title="Support Center"
                description="Get help & FAQs"
              />
              <QuickActionCard
                icon={<Gift size={16} />}
                title="Refer & Earn"
                description="Invite friends, get rewards"
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

// NavItem sub-component
const NavItem = ({ label, icon, active, danger, onClick }: any) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer
        ${
          active
            ? 'bg-indigo-50 text-indigo-700'
            : danger
            ? 'text-red-500 hover:bg-red-50'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }
      `}
    >
      <span
        className={
          active ? 'text-indigo-600' : danger ? 'text-red-400' : 'text-gray-400'
        }
      >
        {icon}
      </span>
      {label}
    </button>
  );
};
