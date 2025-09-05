'use client';

import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
      {...props}
    />
  );
}

// 프로필 카드 스켈레톤
export function ProfileCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-gray-100">
      {/* 헤더 스켈레톤 */}
      <div className="bg-gradient-to-r from-sky-400 to-blue-500 px-4 py-6 md:px-6 md:py-8">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="w-20 h-10 rounded-lg" />
        </div>
      </div>
      
      {/* 컨텐츠 스켈레톤 */}
      <div className="p-3 md:p-6 space-y-4">
        {[...Array(6)].map((_, categoryIndex) => (
          <div key={categoryIndex} className="space-y-3">
            {/* 카테고리 헤더 */}
            <div className="flex items-center space-x-2 border-t border-gray-200 pt-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="h-5 w-24" />
            </div>
            
            {/* 질문 카드들 */}
            <div className="space-y-3">
              {[...Array(3)].map((_, questionIndex) => (
                <div key={questionIndex} className="bg-gray-50 rounded-lg border border-gray-200">
                  <div className="bg-gray-100 px-3 py-2">
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="p-2">
                    <Skeleton className="h-8 w-full rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* 완성도 섹션 */}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="text-center space-y-3">
            <Skeleton className="w-8 h-8 rounded-lg mx-auto" />
            <Skeleton className="h-5 w-32 mx-auto" />
            <div className="grid grid-cols-3 gap-2">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center space-x-1 mb-1">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-1 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 사용자 선택 탭 스켈레톤
export function UserTabsSkeleton() {
  return (
    <div className="bg-white md:rounded-xl shadow-sm border-0 md:border border-gray-100 p-2 md:p-3 mx-4 md:mx-0">
      <div className="flex space-x-1 md:space-x-2 bg-gradient-to-r from-sky-50 via-blue-50 to-sky-50 rounded-lg p-2">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="flex-1 py-2 px-1 rounded-lg">
            <div className="flex flex-col items-center space-y-1">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="h-3 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 리스트 아이템 스켈레톤
export function ListItemSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start space-x-3">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </div>
  );
}

// 카드 그리드 스켈레톤
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Skeleton className="w-6 h-6 rounded" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="w-16 h-6 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}