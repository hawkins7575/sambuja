'use client';

import { useEffect, useState } from 'react';

interface UpdateNotification {
  show: boolean;
  message: string;
}

export default function PWAUpdater() {
  const [updateNotification, setUpdateNotification] = useState<UpdateNotification>({
    show: false,
    message: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('PWA: Service Worker registered successfully');
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              console.log('PWA: New service worker found, installing...');
              
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('PWA: New service worker installed, showing update notification');
                  setUpdateNotification({
                    show: true,
                    message: '새로운 업데이트가 있습니다!'
                  });
                }
              });
            }
          });

          // Check for updates every 30 seconds
          setInterval(() => {
            console.log('PWA: Checking for updates...');
            registration.update();
          }, 30000);
        })
        .catch((error) => {
          console.error('PWA: Service Worker registration failed:', error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('PWA: Message from service worker:', event.data);
        
        if (event.data?.type === 'SW_UPDATED') {
          setUpdateNotification({
            show: true,
            message: event.data.message || '앱이 업데이트되었습니다!'
          });
          
          // Auto-refresh after 2 seconds
          setTimeout(() => {
            handleUpdate();
          }, 2000);
        }
      });

      // Listen for service worker controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('PWA: Controller changed, reloading page');
        window.location.reload();
      });
    }
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    console.log('PWA: Applying update...');
    
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration?.waiting) {
          // Send message to waiting service worker to skip waiting
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        
        // Clear all caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => {
              console.log('PWA: Deleting cache:', cacheName);
              return caches.delete(cacheName);
            })
          );
        }
        
        // Force reload
        window.location.reload();
      }
    } catch (error) {
      console.error('PWA: Update failed:', error);
      setIsUpdating(false);
    }
  };

  const dismissNotification = () => {
    setUpdateNotification({ show: false, message: '' });
  };

  if (!updateNotification.show) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-blue-200 text-sm">🔄</span>
          </div>
          <div>
            <p className="font-medium text-sm">{updateNotification.message}</p>
            <p className="text-blue-200 text-xs">자동으로 업데이트됩니다...</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isUpdating ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">업데이트 중...</span>
            </div>
          ) : (
            <>
              <button
                onClick={handleUpdate}
                className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                지금 업데이트
              </button>
              <button
                onClick={dismissNotification}
                className="text-blue-200 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}