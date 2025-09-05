'use client';

import { useEffect, ReactNode, useState } from 'react';
import { useAuthStore } from '@/lib/store';

interface FirebaseProviderProps {
  children: ReactNode;
}

export default function FirebaseProvider({ children }: FirebaseProviderProps) {
  const { initializeApp, isLoading, isInitialized } = useAuthStore();
  const [initTimeout, setInitTimeout] = useState(false);

  useEffect(() => {
    // 앱 초기화 (한 번만 실행)
    initializeApp();
    
    // 10초 후 타임아웃 설정
    const timeout = setTimeout(() => {
      setInitTimeout(true);
    }, 10000);

    return () => clearTimeout(timeout);
  }, [initializeApp]);

  // 타임아웃이 발생했거나 이미 초기화된 경우 앱 렌더링
  if (!isLoading || isInitialized || initTimeout) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">삼부자 앱을 준비하고 있습니다...</p>
        <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
      </div>
    </div>
  );
}