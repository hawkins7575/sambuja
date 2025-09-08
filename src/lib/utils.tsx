import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import React from 'react';

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

// URL을 감지하고 링크로 변환하는 함수
export function convertUrlsToLinks(text: string): React.ReactNode[] {
  // URL을 감지하는 정규식 (http/https, www, 유튜브, 기본 도메인 등)
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|youtu\.be\/[^\s]+|youtube\.com\/[^\s]+)/gi;
  
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      let url = part;
      
      // www로 시작하는 경우 http:// 추가
      if (part.startsWith('www.')) {
        url = `https://${part}`;
      }
      
      // 유튜브 링크인지 확인
      const isYoutube = part.includes('youtube.com') || part.includes('youtu.be');
      
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline font-medium transition-colors ${
            isYoutube ? 'text-red-600 hover:text-red-800' : ''
          }`}
        >
          {isYoutube && (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          )}
          {part}
        </a>
      );
    }
    return part;
  });
}

// 텍스트를 React 컴포넌트로 변환 (URL 링크 포함)
export function renderTextWithLinks(text: string): React.ReactNode {
  return (
    <>
      {convertUrlsToLinks(text)}
    </>
  );
}