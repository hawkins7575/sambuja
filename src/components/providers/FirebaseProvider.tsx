'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/lib/store';

interface FirebaseProviderProps {
  children: ReactNode;
}

export default function FirebaseProvider({ children }: FirebaseProviderProps) {
  const { initializeApp, isLoading, isInitialized } = useAuthStore();

  useEffect(() => {
    // 앱 초기화 (한 번만 실행)
    initializeApp();
  }, []); // 의존성 배열을 비워서 한 번만 실행

  if (isLoading && !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">삼부자 앱을 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}