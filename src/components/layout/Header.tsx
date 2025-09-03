'use client';

import { Settings } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { getRoleName, getRoleColor } from '@/lib/utils';
import TopNavigation from './TopNavigation';
import NotificationButton from '@/components/shared/NotificationButton';
import Image from 'next/image';

export default function Header() {
  const { user } = useAuthStore();

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center space-x-2 sm:space-x-3">
          {user && (
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span 
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}
              >
                {getRoleName(user.role)}
              </span>
              <span className="text-sm text-gray-600 hidden sm:inline">{user.name}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          <NotificationButton />
          <button className="touch-target touch-feedback rounded-full p-2">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
        </div>
      </div>
      <TopNavigation />
    </div>
  );
}