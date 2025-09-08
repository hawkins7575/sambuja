import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Firebase 설정 - 환경변수 문제 해결을 위한 직접 설정
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDqK4UslCTFCKZGeO6HC7ACidruOoVW0ss",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "sambuja-11141.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sambuja-11141",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "sambuja-11141.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "625949139674",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:625949139674:web:5717ea10fc448dd2d27be3",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-E50RZ0C15S",
};

// 환경 변수 검증 (개발 환경, 서버 측에서만)
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  console.log('=== FIREBASE ENVIRONMENT DEBUG ===');
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (!value) {
      console.error(`❌ Missing environment variable: ${envVar}`);
    } else {
      console.log(`✅ ${envVar}: ${value.substring(0, 10)}...`);
    }
  }
  
  console.log('Final Firebase Config:', {
    apiKey: firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 10) + '...' : 'MISSING',
    authDomain: firebaseConfig.authDomain || 'MISSING',
    projectId: firebaseConfig.projectId || 'MISSING',
    appId: firebaseConfig.appId ? firebaseConfig.appId.substring(0, 20) + '...' : 'MISSING'
  });
  console.log('=== END FIREBASE DEBUG ===');
}

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// 서비스 초기화
export const db = getFirestore(app);
// Firebase Authentication 임시 비활성화 (CONFIGURATION_NOT_FOUND 오류 해결)
// export const auth = getAuth(app);
export const auth = null; // 임시로 null로 설정
export const storage = getStorage(app);

// Analytics 초기화 (클라이언트 측에서만)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

// 개발 환경에서 에뮬레이터 연결 (현재 비활성화 - 실제 Firebase 사용)
// 에뮬레이터를 사용하려면 아래 주석을 해제하고 Firebase 에뮬레이터를 실행하세요
/*
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  const isEmulatorConnected = {
    firestore: false,
    auth: false,
    storage: false
  };

  // Firestore 에뮬레이터
  if (!isEmulatorConnected.firestore) {
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
      isEmulatorConnected.firestore = true;
    } catch (error) {
      // 에뮬레이터가 실행되지 않은 경우 무시
    }
  }

  // Auth 에뮬레이터
  if (!isEmulatorConnected.auth) {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099');
      isEmulatorConnected.auth = true;
    } catch (error) {
      // 에뮬레이터가 실행되지 않은 경우 무시
    }
  }

  // Storage 에뮬레이터
  if (!isEmulatorConnected.storage) {
    try {
      connectStorageEmulator(storage, 'localhost', 9199);
      isEmulatorConnected.storage = true;
    } catch (error) {
      // 에뮬레이터가 실행되지 않은 경우 무시
    }
  }
}
*/

export default app;