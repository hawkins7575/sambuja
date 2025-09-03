'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { NotificationService } from '@/lib/notifications';

export default function NotificationButton() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    setIsSupported(notificationService.isSupported());
    setIsEnabled(notificationService.isNotificationEnabled());
    
    // 서비스 워커 등록
    notificationService.registerServiceWorker();
  }, []);

  const toggleNotifications = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (!isEnabled) {
        const permission = await notificationService.requestPermission();
        if (permission === 'granted') {
          await notificationService.subscribeToPush();
          setIsEnabled(true);
          
          // 알림 활성화 확인 메시지
          await notificationService.showLocalNotification(
            '알림 활성화됨',
            '삼부자 가족의 새로운 소식을 알려드릴게요!'
          );
        }
      } else {
        // 알림 비활성화는 브라우저 설정에서 해야 함
        alert('알림을 비활성화하려면 브라우저 설정에서 변경해주세요.');
      }
    } catch (error) {
      console.error('Notification toggle failed:', error);
      alert('알림 설정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return null; // 지원하지 않는 브라우저에서는 버튼을 표시하지 않음
  }

  return (
    <button
      onClick={toggleNotifications}
      disabled={isLoading}
      className={`touch-target touch-feedback rounded-full p-2 transition-colors ${
        isEnabled 
          ? 'text-blue-600 hover:bg-blue-50' 
          : 'text-gray-600 hover:bg-gray-100'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isEnabled ? '알림이 활성화됨' : '알림 활성화하기'}
    >
      {isEnabled ? (
        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
      ) : (
        <BellOff className="w-4 h-4 sm:w-5 sm:h-5" />
      )}
    </button>
  );
}