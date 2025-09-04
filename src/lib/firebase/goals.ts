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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Goal } from '@/types';

const GOALS_COLLECTION = 'goals';

// 목표 생성
export async function createGoal(goalData: Omit<Goal, 'id' | 'created_at'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, GOALS_COLLECTION), {
      ...goalData,
      progress: goalData.progress || 0,
      completed: goalData.completed || false,
      created_at: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating goal:', error);
    throw new Error('목표 생성에 실패했습니다.');
  }
}

// 모든 목표 조회
export async function getGoals(): Promise<Goal[]> {
  try {
    const q = query(
      collection(db, GOALS_COLLECTION),
      orderBy('created_at', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at,
      } as Goal;
    });
  } catch (error) {
    console.error('Error getting goals:', error);
    throw new Error('목표 목록을 가져오는데 실패했습니다.');
  }
}

// 특정 목표 조회
export async function getGoal(goalId: string): Promise<Goal | null> {
  try {
    const docRef = doc(db, GOALS_COLLECTION, goalId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at,
      } as Goal;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting goal:', error);
    throw new Error('목표를 가져오는데 실패했습니다.');
  }
}

// 소유자별 목표 조회
export async function getGoalsByOwner(ownerId: string): Promise<Goal[]> {
  try {
    const q = query(
      collection(db, GOALS_COLLECTION),
      where('owner_id', '==', ownerId),
      orderBy('created_at', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at,
      } as Goal;
    });
  } catch (error) {
    console.error('Error getting goals by owner:', error);
    throw new Error('소유자별 목표를 가져오는데 실패했습니다.');
  }
}

// 완료 상태별 목표 조회
export async function getGoalsByStatus(completed: boolean): Promise<Goal[]> {
  try {
    const q = query(
      collection(db, GOALS_COLLECTION),
      where('completed', '==', completed),
      orderBy('created_at', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at,
      } as Goal;
    });
  } catch (error) {
    console.error('Error getting goals by status:', error);
    throw new Error('상태별 목표를 가져오는데 실패했습니다.');
  }
}

// 진행중인 목표 조회 (완료되지 않은 목표)
export async function getActiveGoals(): Promise<Goal[]> {
  return getGoalsByStatus(false);
}

// 완료된 목표 조회
export async function getCompletedGoals(): Promise<Goal[]> {
  return getGoalsByStatus(true);
}

// 목표 진행률 업데이트
export async function updateGoalProgress(goalId: string, progress: number): Promise<void> {
  try {
    const docRef = doc(db, GOALS_COLLECTION, goalId);
    const completed = progress >= 100;
    
    await updateDoc(docRef, {
      progress,
      completed,
      updated_at: serverTimestamp(),
      ...(completed && { completed_at: serverTimestamp() })
    });
  } catch (error) {
    console.error('Error updating goal progress:', error);
    throw new Error('목표 진행률 업데이트에 실패했습니다.');
  }
}

// 목표 완료 토글
export async function toggleGoalCompletion(goalId: string): Promise<void> {
  try {
    const goalDoc = await getGoal(goalId);
    if (!goalDoc) {
      throw new Error('목표를 찾을 수 없습니다.');
    }

    const newCompleted = !goalDoc.completed;
    const docRef = doc(db, GOALS_COLLECTION, goalId);
    
    await updateDoc(docRef, {
      completed: newCompleted,
      progress: newCompleted ? 100 : goalDoc.progress,
      updated_at: serverTimestamp(),
      ...(newCompleted && { completed_at: serverTimestamp() })
    });
  } catch (error) {
    console.error('Error toggling goal completion:', error);
    throw new Error('목표 완료 상태 변경에 실패했습니다.');
  }
}

// 목표 정보 업데이트
export async function updateGoal(goalId: string, updates: Partial<Goal>): Promise<void> {
  try {
    const docRef = doc(db, GOALS_COLLECTION, goalId);
    await updateDoc(docRef, {
      ...updates,
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    throw new Error('목표 수정에 실패했습니다.');
  }
}

// 목표 삭제
export async function deleteGoal(goalId: string): Promise<void> {
  try {
    const docRef = doc(db, GOALS_COLLECTION, goalId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw new Error('목표 삭제에 실패했습니다.');
  }
}