// Firebase 서비스 통합 export
export * from './users';
export * from './posts';
export * from './comments';
export * from './events';
export * from './goals';
export * from './helpRequests';

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
    throw new Error('데이터베이스 초기화에 실패했습니다.');
  }
}