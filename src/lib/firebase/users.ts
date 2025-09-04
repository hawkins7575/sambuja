import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  DocumentReference
} from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '@/types';

const USERS_COLLECTION = 'users';

// 사용자 생성
export async function createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, USERS_COLLECTION), {
      ...userData,
      created_at: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('사용자 생성에 실패했습니다.');
  }
}

// 모든 사용자 조회
export async function getUsers(): Promise<User[]> {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, USERS_COLLECTION), orderBy('name'))
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as User));
  } catch (error) {
    console.error('Error getting users:', error);
    throw new Error('사용자 목록을 가져오는데 실패했습니다.');
  }
}

// 특정 사용자 조회
export async function getUser(userId: string): Promise<User | null> {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as User;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user:', error);
    throw new Error('사용자 정보를 가져오는데 실패했습니다.');
  }
}

// 역할별 사용자 조회
export async function getUsersByRole(role: 'dad' | 'eldest' | 'youngest'): Promise<User[]> {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', role)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as User));
  } catch (error) {
    console.error('Error getting users by role:', error);
    throw new Error('역할별 사용자를 가져오는데 실패했습니다.');
  }
}

// 사용자 정보 업데이트
export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, {
      ...updates,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('사용자 정보 업데이트에 실패했습니다.');
  }
}

// 사용자 삭제
export async function deleteUser(userId: string): Promise<void> {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('사용자 삭제에 실패했습니다.');
  }
}

// 초기 사용자 데이터 생성 (개발용)
export async function initializeUsers(): Promise<void> {
  try {
    // 기존 사용자 확인
    const existingUsers = await getUsers();
    if (existingUsers.length > 0) {
      return;
    }

    // 초기 사용자 데이터
    const initialUsers = [
      {
        name: '아빠',
        email: 'dad@sambuja.com',
        role: 'dad' as const,
      },
      {
        name: '짱남',
        email: 'eldest@sambuja.com', 
        role: 'eldest' as const,
      },
      {
        name: '막뚱이',
        email: 'youngest@sambuja.com',
        role: 'youngest' as const,
      }
    ];

    // 사용자 생성
    for (const userData of initialUsers) {
      await createUser(userData);
    }

  } catch (error) {
    console.error('Error initializing users:', error);
  }
}