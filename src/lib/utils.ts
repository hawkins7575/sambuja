import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getRelativeTime(date: string) {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return '방금 전';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}분 전`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}시간 전`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}일 전`;
  } else {
    return formatDate(date);
  }
}

export function getRoleName(role: 'dad' | 'eldest' | 'youngest') {
  const roleNames = {
    dad: '아빠',
    eldest: '장남',
    youngest: '막둥이'
  };
  return roleNames[role];
}

export function getRoleColor(role: 'dad' | 'eldest' | 'youngest') {
  const colors = {
    dad: 'bg-blue-100 text-blue-800',
    eldest: 'bg-green-100 text-green-800',
    youngest: 'bg-purple-100 text-purple-800'
  };
  return colors[role];
}