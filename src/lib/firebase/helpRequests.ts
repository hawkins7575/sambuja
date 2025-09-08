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
import { HelpRequest } from '@/types';

const HELP_REQUESTS_COLLECTION = 'helpRequests';

// 도움 요청 생성
export async function createHelpRequest(helpData: Omit<HelpRequest, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, HELP_REQUESTS_COLLECTION), {
      ...helpData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating help request:', error);
    throw new Error('도움 요청 생성에 실패했습니다.');
  }
}

// 모든 도움 요청 조회
export async function getHelpRequests(): Promise<HelpRequest[]> {
  try {
    const q = query(
      collection(db, HELP_REQUESTS_COLLECTION),
      orderBy('created_at', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at,
        updated_at: data.updated_at instanceof Timestamp ? data.updated_at.toDate().toISOString() : data.updated_at,
      } as HelpRequest;
    });
  } catch (error) {
    console.error('Error getting help requests:', error);
    throw new Error('도움 요청 목록을 가져오는데 실패했습니다.');
  }
}

// 특정 도움 요청 조회
export async function getHelpRequest(requestId: string): Promise<HelpRequest | null> {
  try {
    const docRef = doc(db, HELP_REQUESTS_COLLECTION, requestId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at,
        updated_at: data.updated_at instanceof Timestamp ? data.updated_at.toDate().toISOString() : data.updated_at,
      } as HelpRequest;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting help request:', error);
    throw new Error('도움 요청을 가져오는데 실패했습니다.');
  }
}

// 요청자별 도움 요청 조회
export async function getHelpRequestsByRequester(requesterId: string): Promise<HelpRequest[]> {
  try {
    const q = query(
      collection(db, HELP_REQUESTS_COLLECTION),
      where('requester_id', '==', requesterId),
      orderBy('created_at', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at,
        updated_at: data.updated_at instanceof Timestamp ? data.updated_at.toDate().toISOString() : data.updated_at,
      } as HelpRequest;
    });
  } catch (error) {
    console.error('Error getting help requests by requester:', error);
    throw new Error('요청자별 도움 요청을 가져오는데 실패했습니다.');
  }
}


// 대상 청중별 도움 요청 조회
export async function getHelpRequestsByAudience(audience: string): Promise<HelpRequest[]> {
  try {
    const q = query(
      collection(db, HELP_REQUESTS_COLLECTION),
      where('target_audience', 'in', [audience, 'all']),
      orderBy('created_at', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at,
        updated_at: data.updated_at instanceof Timestamp ? data.updated_at.toDate().toISOString() : data.updated_at,
      } as HelpRequest;
    });
  } catch (error) {
    console.error('Error getting help requests by audience:', error);
    throw new Error('대상별 도움 요청을 가져오는데 실패했습니다.');
  }
}


// 도움 요청 수정
export async function updateHelpRequest(requestId: string, updates: Partial<HelpRequest>): Promise<void> {
  try {
    const docRef = doc(db, HELP_REQUESTS_COLLECTION, requestId);
    await updateDoc(docRef, {
      ...updates,
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating help request:', error);
    throw new Error('도움 요청 수정에 실패했습니다.');
  }
}

// 도움 요청 삭제
export async function deleteHelpRequest(requestId: string): Promise<void> {
  try {
    const docRef = doc(db, HELP_REQUESTS_COLLECTION, requestId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting help request:', error);
    throw new Error('도움 요청 삭제에 실패했습니다.');
  }
}