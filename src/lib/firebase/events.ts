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
import { Event } from '@/types';

const EVENTS_COLLECTION = 'events';

// 이벤트 생성
export async function createEvent(eventData: Omit<Event, 'id' | 'created_at'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
      ...eventData,
      created_at: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    throw new Error('일정 생성에 실패했습니다.');
  }
}

// 모든 이벤트 조회 (시작일 기준 정렬)
export async function getEvents(): Promise<Event[]> {
  try {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      orderBy('start_date', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at,
      } as Event;
    });
  } catch (error) {
    console.error('Error getting events:', error);
    throw new Error('일정 목록을 가져오는데 실패했습니다.');
  }
}

// 특정 이벤트 조회
export async function getEvent(eventId: string): Promise<Event | null> {
  try {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at,
      } as Event;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting event:', error);
    throw new Error('일정을 가져오는데 실패했습니다.');
  }
}

// 생성자별 이벤트 조회
export async function getEventsByCreator(createdBy: string): Promise<Event[]> {
  try {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where('created_by', '==', createdBy),
      orderBy('start_date', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at,
      } as Event;
    });
  } catch (error) {
    console.error('Error getting events by creator:', error);
    throw new Error('생성자별 일정을 가져오는데 실패했습니다.');
  }
}

// 날짜 범위별 이벤트 조회
export async function getEventsByDateRange(startDate: string, endDate: string): Promise<Event[]> {
  try {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where('start_date', '>=', startDate),
      where('start_date', '<=', endDate),
      orderBy('start_date', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at,
      } as Event;
    });
  } catch (error) {
    console.error('Error getting events by date range:', error);
    throw new Error('날짜별 일정을 가져오는데 실패했습니다.');
  }
}

// 대상 청중별 이벤트 조회
export async function getEventsByAudience(audience: string): Promise<Event[]> {
  try {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where('target_audience', 'in', [audience, 'all']),
      orderBy('start_date', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at,
      } as Event;
    });
  } catch (error) {
    console.error('Error getting events by audience:', error);
    throw new Error('대상별 일정을 가져오는데 실패했습니다.');
  }
}

// 특정 날짜의 이벤트 조회
export async function getEventsForDate(date: string): Promise<Event[]> {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, EVENTS_COLLECTION),
      where('start_date', '>=', startOfDay.toISOString()),
      where('start_date', '<=', endOfDay.toISOString()),
      orderBy('start_date', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at,
      } as Event;
    });
  } catch (error) {
    console.error('Error getting events for date:', error);
    throw new Error('해당 날짜의 일정을 가져오는데 실패했습니다.');
  }
}

// 이벤트 업데이트
export async function updateEvent(eventId: string, updates: Partial<Event>): Promise<void> {
  try {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await updateDoc(docRef, {
      ...updates,
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating event:', error);
    throw new Error('일정 수정에 실패했습니다.');
  }
}

// 이벤트 삭제
export async function deleteEvent(eventId: string): Promise<void> {
  try {
    const docRef = doc(db, EVENTS_COLLECTION, eventId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw new Error('일정 삭제에 실패했습니다.');
  }
}