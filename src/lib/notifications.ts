// PWA 푸시 알림 유틸리티
export class NotificationService {
  private static instance: NotificationService;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // 서비스 워커 등록
  async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // 알림 권한 요청
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // 푸시 구독 생성
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.registerServiceWorker();
    }

    if (!this.registration) {
      console.error('Service Worker not registered');
      return null;
    }

    try {
      const applicationServerKey = this.urlBase64ToUint8Array(
        // VAPID public key (실제 서비스에서는 환경변수로 관리)
        'BMqSvZXhGiGqwGliGL7URhDMJEfGUiMWnLULXqJUZxRRoP_D_P1GKnYgx2YY_8YZy5GF2DgWLhJO'
      );
      
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource
      });
      
      console.log('Push subscription successful:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // 로컬 알림 표시 (즉시 표시용)
  async showLocalNotification(title: string, body: string, data?: Record<string, unknown>): Promise<void> {
    const permission = await this.requestPermission();
    
    if (permission === 'granted') {
      const options: NotificationOptions = {
        body,
        icon: '/dad-avatar.png',
        badge: '/dad-avatar.png',
        data: data || { dateOfArrival: Date.now() },
        tag: 'sambuja-notification',
        requireInteraction: false,
        silent: false
      };

      if ('serviceWorker' in navigator && this.registration) {
        // Service Worker를 통해 알림 표시
        await this.registration.showNotification(title, options);
      } else {
        // 일반 브라우저 알림
        new Notification(title, options);
      }
    }
  }

  // 새 소통글 알림
  async notifyNewPost(authorName: string, title: string, targetAudience: string): Promise<void> {
    let body = `${authorName}님이 새 글을 작성했습니다: ${title}`;
    
    if (targetAudience !== 'all') {
      const targetNames = {
        'dad': '아빠',
        'eldest': '짱남',
        'youngest': '막둥이'
      };
      body = `${authorName}님이 ${targetNames[targetAudience as keyof typeof targetNames]}에게 글을 보냈습니다: ${title}`;
    }

    await this.showLocalNotification('새로운 소통', body, {
      type: 'communication',
      url: '/communication'
    });
  }

  // 새 도움 요청 알림
  async notifyNewHelpRequest(requesterName: string, title: string, targetAudience: string): Promise<void> {
    let body = `${requesterName}님이 도움을 요청했습니다: ${title}`;
    
    if (targetAudience !== 'all') {
      const targetNames = {
        'dad': '아빠',
        'eldest': '짱남', 
        'youngest': '막둥이'
      };
      body = `${requesterName}님이 ${targetNames[targetAudience as keyof typeof targetNames]}에게 도움을 요청했습니다: ${title}`;
    }

    await this.showLocalNotification('도움 요청', body, {
      type: 'help',
      url: '/help'
    });
  }

  // 새 일정 알림
  async notifyNewSchedule(creatorName: string, title: string, date: string): Promise<void> {
    const body = `${creatorName}님이 새 일정을 등록했습니다: ${title} (${new Date(date).toLocaleDateString('ko-KR')})`;
    
    await this.showLocalNotification('새로운 일정', body, {
      type: 'schedule',
      url: '/schedule'
    });
  }

  // 목표 달성 알림
  async notifyGoalAchieved(ownerName: string, goalTitle: string): Promise<void> {
    const body = `${ownerName}님이 목표를 달성했습니다: ${goalTitle} 🎉`;
    
    await this.showLocalNotification('목표 달성!', body, {
      type: 'goal',
      url: '/goals'
    });
  }

  // 알림 설정 상태 확인
  isNotificationEnabled(): boolean {
    return Notification.permission === 'granted';
  }

  // 브라우저 지원 여부 확인
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // VAPID 키 변환 유틸리티
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}