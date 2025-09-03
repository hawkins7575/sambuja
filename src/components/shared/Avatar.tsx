'use client';

import Image from 'next/image';
import { User } from '@/types';

interface AvatarProps {
  user: User;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8', 
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

const getAvatarSrc = (role: string) => {
  switch (role) {
    case 'dad': return '/dad-avatar.png';
    case 'eldest': return '/eldest-avatar.png';
    case 'youngest': return '/youngest-avatar.png';
    default: return '/dad-avatar.png';
  }
};

export default function Avatar({ user, size = 'md', className = '', showBorder = true }: AvatarProps) {
  const sizeClass = sizeClasses[size];
  const borderClass = showBorder ? 'border border-gray-200' : '';
  
  return (
    <div className={`${sizeClass} rounded-full overflow-hidden ${borderClass} ${className}`}>
      <Image 
        src={getAvatarSrc(user.role)} 
        alt={user.name} 
        width={size === 'xs' ? 24 : size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 64 : 96} 
        height={size === 'xs' ? 24 : size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 64 : 96} 
        className="w-full h-full object-cover" 
      />
    </div>
  );
}