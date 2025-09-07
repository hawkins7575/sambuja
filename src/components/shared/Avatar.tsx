'use client';

import Image from 'next/image';
import { User } from '@/types';
import { memo } from 'react';

interface AvatarProps {
  user: User;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
}

const sizeConfig = {
  xs: { class: 'w-6 h-6', size: 24 },
  sm: { class: 'w-8 h-8', size: 32 }, 
  md: { class: 'w-10 h-10', size: 40 },
  lg: { class: 'w-16 h-16', size: 64 },
  xl: { class: 'w-24 h-24', size: 96 }
} as const;

const avatarPaths = {
  dad: '/dad-avatar.png',
  eldest: '/eldest-avatar.png', 
  youngest: '/youngest-avatar.png'
} as const;

function Avatar({ user, size = 'md', className = '', showBorder = true }: AvatarProps) {
  const config = sizeConfig[size];
  const borderClass = showBorder ? 'border border-gray-200' : '';
  const avatarPath = avatarPaths[user.role as keyof typeof avatarPaths] || avatarPaths.dad;
  
  // 40px 이상일 때만 blur placeholder 사용 (성능 최적화)
  const shouldUseBlurPlaceholder = config.size >= 40;
  
  return (
    <div className={`${config.class} rounded-full overflow-hidden ${borderClass} transition-transform-gpu ${className}`}>
      <Image 
        src={avatarPath}
        alt={`${user.name}의 아바타`}
        width={config.size} 
        height={config.size}
        className="w-full h-full object-cover" 
        loading="lazy"
        {...(shouldUseBlurPlaceholder && {
          placeholder: "blur",
          blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        })}
      />
    </div>
  );
}

export default memo(Avatar);