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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Post, User } from '@/types';

const POSTS_COLLECTION = 'posts';

// 게시글 생성
export async function createPost(postData: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
      ...postData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw new Error('게시글 작성에 실패했습니다.');
  }
}

// 모든 게시글 조회 (최신순)
export async function getPosts(): Promise<Post[]> {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
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
      } as Post;
    });
  } catch (error) {
    console.error('Error getting posts:', error);
    throw new Error('게시글 목록을 가져오는데 실패했습니다.');
  }
}

// 특정 게시글 조회
export async function getPost(postId: string): Promise<Post | null> {
  try {
    const docRef = doc(db, POSTS_COLLECTION, postId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at,
        updated_at: data.updated_at instanceof Timestamp ? data.updated_at.toDate().toISOString() : data.updated_at,
      } as Post;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting post:', error);
    throw new Error('게시글을 가져오는데 실패했습니다.');
  }
}

// 작성자별 게시글 조회
export async function getPostsByAuthor(authorId: string): Promise<Post[]> {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      where('author_id', '==', authorId),
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
      } as Post;
    });
  } catch (error) {
    console.error('Error getting posts by author:', error);
    throw new Error('작성자별 게시글을 가져오는데 실패했습니다.');
  }
}

// 대상 청중별 게시글 조회
export async function getPostsByAudience(audience: string): Promise<Post[]> {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
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
      } as Post;
    });
  } catch (error) {
    console.error('Error getting posts by audience:', error);
    throw new Error('대상별 게시글을 가져오는데 실패했습니다.');
  }
}

// 최근 게시글 조회 (제한된 개수)
export async function getRecentPosts(limitCount: number = 10): Promise<Post[]> {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      orderBy('created_at', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at,
        updated_at: data.updated_at instanceof Timestamp ? data.updated_at.toDate().toISOString() : data.updated_at,
      } as Post;
    });
  } catch (error) {
    console.error('Error getting recent posts:', error);
    throw new Error('최근 게시글을 가져오는데 실패했습니다.');
  }
}

// 게시글 업데이트
export async function updatePost(postId: string, updates: Partial<Post>): Promise<void> {
  try {
    const docRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(docRef, {
      ...updates,
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating post:', error);
    throw new Error('게시글 수정에 실패했습니다.');
  }
}

// 게시글 삭제
export async function deletePost(postId: string): Promise<void> {
  try {
    const docRef = doc(db, POSTS_COLLECTION, postId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting post:', error);
    throw new Error('게시글 삭제에 실패했습니다.');
  }
}