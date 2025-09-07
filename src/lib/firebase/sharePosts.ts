import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../firebase';
import { SharePost, SharePostReaction, SharePostBookmark, ShareComment } from '@/types';

// 컬렉션 참조
const sharePostsRef = collection(db, 'sharePosts');
const reactionsRef = collection(db, 'sharePostReactions');
const bookmarksRef = collection(db, 'sharePostBookmarks');
const shareCommentsRef = collection(db, 'shareComments');

// undefined 값 제거 유틸리티 함수
function removeUndefinedFields(obj: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// 공유 게시물 생성
export async function createSharePost(postData: {
  title: string;
  content: string;
  type: 'general' | 'photo' | 'video' | 'document' | 'event' | 'location';
  author_id: string;
  images?: string[];
  location?: string;
  event_date?: string;
  event_time?: string;
  tags: string[];
  target_audience: 'all' | 'dad' | 'eldest' | 'youngest';
  background_color?: string;
  allow_comments: boolean;
  is_pinned: boolean;
}): Promise<string> {
  try {
    const cleanedData = removeUndefinedFields({
      ...postData,
      images: postData.images || [],
      tags: postData.tags || [],
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    
    console.log('Creating share post with cleaned data:', cleanedData);
    const docRef = await addDoc(sharePostsRef, cleanedData);
    
    console.log('Share post created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating share post:', error);
    throw error;
  }
}

// 이미지 업로드
export async function uploadSharePostImages(files: File[], postId: string): Promise<string[]> {
  const uploadPromises = files.map(async (file, index) => {
    const fileName = `share-posts/${postId}/${Date.now()}-${index}-${file.name}`;
    const imageRef = ref(storage, fileName);
    
    try {
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
}

// 모든 공유 게시물 가져오기
export async function getSharePosts(): Promise<SharePost[]> {
  try {
    // 인덱스 필요 없이 created_at만으로 정렬 (클라이언트에서 is_pinned 정렬)
    const q = query(sharePostsRef, orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const posts: SharePost[] = [];
    
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      
      // 작성자 정보 가져오기
      const userDoc = await getDoc(doc(db, 'users', data.author_id));
      const authorData = userDoc.data();
      
      if (authorData) {
        const post: SharePost = {
          id: docSnap.id,
          title: data.title,
          content: data.content,
          type: data.type,
          author_id: data.author_id,
          author: {
            id: userDoc.id,
            name: authorData.name,
            email: authorData.email,
            role: authorData.role,
            created_at: authorData.created_at?.toDate?.()?.toISOString() || new Date().toISOString()
          },
          images: data.images || [],
          location: data.location,
          event_date: data.event_date,
          event_time: data.event_time,
          tags: data.tags || [],
          target_audience: data.target_audience,
          background_color: data.background_color,
          allow_comments: data.allow_comments ?? true,
          is_pinned: data.is_pinned ?? false,
          likes_count: data.likes_count || 0,
          comments_count: data.comments_count || 0,
          shares_count: data.shares_count || 0,
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString()
        };
        
        posts.push(post);
      }
    }
    
    // 클라이언트 측에서 is_pinned로 정렬 (고정된 게시물이 먼저 나오도록)
    return posts.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) {
        return b.is_pinned ? 1 : -1; // 고정된 게시물이 먼저
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // 최신순
    });
  } catch (error) {
    console.error('Error fetching share posts:', error);
    return [];
  }
}

// 게시물 좋아요 토글
export async function toggleSharePostLike(postId: string, userId: string): Promise<void> {
  try {
    const reactionQuery = query(
      reactionsRef,
      where('post_id', '==', postId),
      where('user_id', '==', userId),
      where('type', '==', 'like')
    );
    
    const reactionSnapshot = await getDocs(reactionQuery);
    const postRef = doc(db, 'sharePosts', postId);
    
    if (reactionSnapshot.empty) {
      // 좋아요 추가
      await addDoc(reactionsRef, {
        post_id: postId,
        user_id: userId,
        type: 'like',
        created_at: Timestamp.now()
      });
      
      await updateDoc(postRef, {
        likes_count: increment(1)
      });
    } else {
      // 좋아요 제거
      const reactionDoc = reactionSnapshot.docs[0];
      await deleteDoc(reactionDoc.ref);
      
      await updateDoc(postRef, {
        likes_count: increment(-1)
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
}

// 게시물 북마크 토글
export async function toggleSharePostBookmark(postId: string, userId: string): Promise<void> {
  try {
    const bookmarkQuery = query(
      bookmarksRef,
      where('post_id', '==', postId),
      where('user_id', '==', userId)
    );
    
    const bookmarkSnapshot = await getDocs(bookmarkQuery);
    
    if (bookmarkSnapshot.empty) {
      // 북마크 추가
      await addDoc(bookmarksRef, {
        post_id: postId,
        user_id: userId,
        created_at: Timestamp.now()
      });
    } else {
      // 북마크 제거
      const bookmarkDoc = bookmarkSnapshot.docs[0];
      await deleteDoc(bookmarkDoc.ref);
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    throw error;
  }
}

// 게시물 공유 수 증가
export async function incrementShareCount(postId: string): Promise<void> {
  try {
    const postRef = doc(db, 'sharePosts', postId);
    await updateDoc(postRef, {
      shares_count: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing share count:', error);
    throw error;
  }
}

// 사용자의 좋아요/북마크 상태 확인
export async function getUserSharePostInteractions(userId: string): Promise<{
  likes: string[];
  bookmarks: string[];
}> {
  try {
    const [likesSnapshot, bookmarksSnapshot] = await Promise.all([
      getDocs(query(reactionsRef, where('user_id', '==', userId), where('type', '==', 'like'))),
      getDocs(query(bookmarksRef, where('user_id', '==', userId)))
    ]);
    
    const likes = likesSnapshot.docs.map(doc => doc.data().post_id);
    const bookmarks = bookmarksSnapshot.docs.map(doc => doc.data().post_id);
    
    return { likes, bookmarks };
  } catch (error) {
    console.error('Error fetching user interactions:', error);
    return { likes: [], bookmarks: [] };
  }
}

// 댓글 추가
export async function addSharePostComment(postId: string, content: string, authorId: string, parentId?: string): Promise<void> {
  try {
    await addDoc(shareCommentsRef, {
      post_id: postId,
      content,
      author_id: authorId,
      parent_id: parentId || null,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    
    // 댓글 수 증가
    const postRef = doc(db, 'sharePosts', postId);
    await updateDoc(postRef, {
      comments_count: increment(1)
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

// 게시물 댓글 가져오기
export async function getSharePostComments(postId: string): Promise<ShareComment[]> {
  try {
    const q = query(shareCommentsRef, where('post_id', '==', postId), orderBy('created_at', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const comments: ShareComment[] = [];
    
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      
      // 작성자 정보 가져오기
      const userDoc = await getDoc(doc(db, 'users', data.author_id));
      const authorData = userDoc.data();
      
      if (authorData) {
        const comment: ShareComment = {
          id: docSnap.id,
          post_id: data.post_id,
          content: data.content,
          author_id: data.author_id,
          author: {
            id: userDoc.id,
            name: authorData.name,
            email: authorData.email,
            role: authorData.role,
            created_at: authorData.created_at?.toDate?.()?.toISOString() || new Date().toISOString()
          },
          parent_id: data.parent_id,
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString()
        };
        
        comments.push(comment);
      }
    }
    
    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

// 게시물 삭제
export async function deleteSharePost(postId: string, authorId: string): Promise<void> {
  try {
    const postRef = doc(db, 'sharePosts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postDoc.data();
    
    // 작성자 확인
    if (postData.author_id !== authorId) {
      throw new Error('Unauthorized to delete this post');
    }
    
    // 관련 이미지 삭제
    if (postData.images && postData.images.length > 0) {
      const deletePromises = postData.images.map(async (imageUrl: string) => {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.warn('Error deleting image:', error);
        }
      });
      
      await Promise.all(deletePromises);
    }
    
    // 관련 데이터 삭제
    const [reactionsSnapshot, bookmarksSnapshot, commentsSnapshot] = await Promise.all([
      getDocs(query(reactionsRef, where('post_id', '==', postId))),
      getDocs(query(bookmarksRef, where('post_id', '==', postId))),
      getDocs(query(shareCommentsRef, where('post_id', '==', postId)))
    ]);
    
    const deletePromises = [
      ...reactionsSnapshot.docs.map(doc => deleteDoc(doc.ref)),
      ...bookmarksSnapshot.docs.map(doc => deleteDoc(doc.ref)),
      ...commentsSnapshot.docs.map(doc => deleteDoc(doc.ref))
    ];
    
    await Promise.all(deletePromises);
    
    // 게시물 삭제
    await deleteDoc(postRef);
  } catch (error) {
    console.error('Error deleting share post:', error);
    throw error;
  }
}

// 게시물 수정
export async function updateSharePost(postId: string, authorId: string, updates: Partial<SharePost>): Promise<void> {
  try {
    const postRef = doc(db, 'sharePosts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postDoc.data();
    
    // 작성자 확인
    if (postData.author_id !== authorId) {
      throw new Error('Unauthorized to update this post');
    }
    
    const updateData = removeUndefinedFields({
      ...updates,
      updated_at: Timestamp.now()
    });
    
    // author 정보는 제외
    delete updateData.author;
    delete updateData.id;
    delete updateData.author_id;
    delete updateData.created_at;
    
    console.log('Updating share post with cleaned data:', updateData);
    await updateDoc(postRef, updateData);
  } catch (error) {
    console.error('Error updating share post:', error);
    throw error;
  }
}