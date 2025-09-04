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
import { Comment } from '@/types';

const COMMENTS_COLLECTION = 'comments';

// 댓글 생성
export async function createComment(commentData: Omit<Comment, 'id' | 'created_at'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
      ...commentData,
      created_at: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw new Error('댓글 작성에 실패했습니다.');
  }
}

// 특정 타겟의 댓글 조회 (게시글, 도움요청, 일정, 목표 등)
export async function getCommentsByTarget(targetType: string, targetId: string): Promise<Comment[]> {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where('target_type', '==', targetType),
      where('target_id', '==', targetId),
      orderBy('created_at', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at,
      } as Comment;
    });
  } catch (error) {
    console.error('Error getting comments by target:', error);
    throw new Error('댓글을 가져오는데 실패했습니다.');
  }
}

// 특정 댓글 조회
export async function getComment(commentId: string): Promise<Comment | null> {
  try {
    const docRef = doc(db, COMMENTS_COLLECTION, commentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at,
      } as Comment;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting comment:', error);
    throw new Error('댓글을 가져오는데 실패했습니다.');
  }
}

// 작성자별 댓글 조회
export async function getCommentsByAuthor(authorId: string): Promise<Comment[]> {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
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
      } as Comment;
    });
  } catch (error) {
    console.error('Error getting comments by author:', error);
    throw new Error('작성자별 댓글을 가져오는데 실패했습니다.');
  }
}

// 댓글 수정
export async function updateComment(commentId: string, content: string): Promise<void> {
  try {
    const docRef = doc(db, COMMENTS_COLLECTION, commentId);
    await updateDoc(docRef, {
      content,
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    throw new Error('댓글 수정에 실패했습니다.');
  }
}

// 댓글 삭제
export async function deleteComment(commentId: string): Promise<void> {
  try {
    const docRef = doc(db, COMMENTS_COLLECTION, commentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw new Error('댓글 삭제에 실패했습니다.');
  }
}