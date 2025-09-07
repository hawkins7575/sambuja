// Firebase 서비스 통합 export
export * from './users';
export * from './posts';
export * from './comments';
export * from './events';
export * from './goals';
export * from './helpRequests';
export * from './sharePosts';

// Firebase 인스턴스
export { db, auth, storage } from '../firebase';

// 데이터 초기화 함수
import { initializeUsers } from './users';

export async function initializeDatabase(): Promise<void> {
  try {
    // 초기 사용자 데이터 생성
    await initializeUsers();
  } catch (error) {
    console.error('Error initializing Firebase database:', error);
    // 프로덕션에서는 오류를 던지지 않고 경고만 출력
    console.warn('Database initialization failed, app will continue without initial data');
  }
}