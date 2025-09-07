'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreVertical,
  Image as ImageIcon,
  Video,
  FileText,
  Calendar,
  MapPin,
  Star,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { useAuthStore, useAppStore } from '@/lib/store';
import { getRoleName, getRoleColor, getRelativeTime } from '@/lib/utils';
import Avatar from '@/components/shared/Avatar';
import CreatePostForm, { PostFormData } from '@/components/share/CreatePostForm';
import PostDetailModal from '@/components/share/PostDetailModal';
import { 
  getSharePosts, 
  createSharePost, 
  uploadSharePostImages,
  updateSharePost,
  deleteSharePost,
  toggleSharePostLike, 
  toggleSharePostBookmark, 
  incrementShareCount,
  getUserSharePostInteractions
} from '@/lib/firebase/sharePosts';
import { SharePost as FirebaseSharePost } from '@/types';
import Link from 'next/link';

interface SharePost {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'photo' | 'video' | 'document' | 'event' | 'location';
  author: {
    id: string;
    name: string;
    role: 'dad' | 'eldest' | 'youngest';
    email: string;
    created_at: string;
  };
  images?: string[];
  location?: string;
  eventDate?: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  created_at: string;
  updated_at: string;
}

// 임시 데이터 (Firebase 타입과 호환)
const mockSharePosts: FirebaseSharePost[] = [
  {
    id: '1',
    title: '오늘 점심 메뉴 추천',
    content: '집에서 간단하게 만들 수 있는 맛있는 파스타 레시피를 공유해요! 재료도 간단하고 만들기도 쉬워서 추천합니다.',
    type: 'general',
    author_id: '1',
    author: { id: '1', name: '아빠', role: 'dad', email: 'dad@family.com', created_at: '2024-01-01T00:00:00Z' },
    tags: ['요리', '레시피', '점심'],
    target_audience: 'all',
    allow_comments: true,
    is_pinned: false,
    likes_count: 5,
    comments_count: 3,
    shares_count: 1,
    created_at: '2024-01-15T12:30:00Z',
    updated_at: '2024-01-15T12:30:00Z'
  },
  {
    id: '2', 
    title: '가족 여행 사진',
    content: '지난 주말 제주도 여행에서 찍은 사진들이에요. 날씨도 좋고 정말 즐거운 시간이었어요!',
    type: 'photo',
    author_id: '2',
    author: { id: '2', name: '첫째', role: 'eldest', email: 'eldest@family.com', created_at: '2024-01-01T00:00:00Z' },
    images: ['/sambuja-family-icon.png'],
    location: '제주도 한라산',
    tags: ['여행', '가족', '제주도', '사진'],
    target_audience: 'all',
    allow_comments: true,
    is_pinned: false,
    likes_count: 8,
    comments_count: 5,
    shares_count: 2,
    created_at: '2024-01-14T09:15:00Z',
    updated_at: '2024-01-14T09:15:00Z'
  },
  {
    id: '3',
    title: '이번 주말 영화 추천',
    content: '넷플릭스에 새로 나온 가족 영화가 정말 재미있어요. 같이 보면 좋을 것 같아요!',
    type: 'general',
    author_id: '3',
    author: { id: '3', name: '막내', role: 'youngest', email: 'youngest@family.com', created_at: '2024-01-01T00:00:00Z' },
    tags: ['영화', '추천', '가족시간'],
    target_audience: 'all',
    allow_comments: true,
    is_pinned: true,
    likes_count: 3,
    comments_count: 2,
    shares_count: 0,
    created_at: '2024-01-13T20:45:00Z',
    updated_at: '2024-01-13T20:45:00Z'
  }
];

const postTypes = [
  { id: 'all', label: '전체', icon: FileText },
  { id: 'general', label: '일반', icon: FileText },
  { id: 'photo', label: '사진', icon: ImageIcon },
  { id: 'video', label: '동영상', icon: Video },
  { id: 'event', label: '일정', icon: Calendar },
  { id: 'location', label: '위치', icon: MapPin }
];

const sortOptions = [
  { id: 'latest', label: '최신순' },
  { id: 'popular', label: '인기순' },
  { id: 'comments', label: '댓글순' }
];

export default function SharePage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<FirebaseSharePost[]>(mockSharePosts); // 초기값을 목업으로 설정
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false); // 초기값을 false로 설정
  const [userInteractions, setUserInteractions] = useState<{ likes: string[], bookmarks: string[] }>({ likes: [], bookmarks: [] });
  const [showDropdownId, setShowDropdownId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<FirebaseSharePost | null>(null);
  const [selectedPost, setSelectedPost] = useState<FirebaseSharePost | null>(null);

  // 게시물 로드
  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading share posts...');
      
      // Firebase에서 게시물 가져오기 시도, 실패 시 목업 사용
      try {
        console.log('Attempting to load posts from Firebase...');
        const fetchedPosts = await getSharePosts();
        console.log('Loaded posts from Firebase:', fetchedPosts.length);
        setPosts(fetchedPosts.length > 0 ? fetchedPosts : mockSharePosts);
      } catch (error) {
        console.warn('Firebase fetch failed, using fallback mock data:', error);
        setPosts(mockSharePosts);
      }
      
      // 사용자 상호작용 정보 로드
      if (user) {
        try {
          const interactions = await getUserSharePostInteractions(user.id);
          setUserInteractions(interactions);
        } catch (error) {
          console.warn('Failed to load user interactions:', error);
          setUserInteractions({ likes: [], bookmarks: [] });
        }
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      // 에러 시 목업 데이터 사용
      setPosts(mockSharePosts);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdownId && !(event.target as Element).closest('.relative')) {
        setShowDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdownId]);

  const handleCreatePost = useCallback(async (postData: PostFormData) => {
    if (!user) {
      console.error('No user found for post creation');
      alert('로그인이 필요합니다. 먼저 홈에서 사용자를 선택해주세요.');
      return;
    }
    
    try {
      console.log('Creating post with user:', user);
      console.log('Creating post with data:', postData);
      
      // 필수 필드 체크
      if (!postData.title.trim() || !postData.content.trim()) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
      }
      
      let imageUrls: string[] = [];
      
      // 이미지가 있으면 먼저 업로드 (임시로 Base64 사용)
      if (postData.images && postData.images.length > 0) {
        console.log('Converting images to base64...', postData.images.length);
        try {
          // 임시로 Base64로 변환 (CORS 문제 해결 전까지)
          imageUrls = await Promise.all(
            postData.images.map(file => {
              return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
              });
            })
          );
          console.log('Images converted to base64 successfully:', imageUrls.length);
        } catch (error) {
          console.error('Image conversion failed:', error);
          alert('이미지 처리에 실패했습니다. 텍스트만 게시됩니다.');
        }
      }
      
      console.log('About to call createSharePost with data:', {
        title: postData.title,
        content: postData.content,
        type: postData.type,
        author_id: user.id,
        images: imageUrls,
        location: postData.location,
        event_date: postData.eventDate,
        event_time: postData.eventTime,
        tags: postData.tags,
        target_audience: postData.targetAudience,
        background_color: postData.backgroundColor,
        allow_comments: postData.allowComments,
        is_pinned: postData.isPinned
      });
      
      // 게시물 생성
      const postId = await createSharePost({
        title: postData.title,
        content: postData.content,
        type: postData.type,
        author_id: user.id,
        images: imageUrls,
        location: postData.location,
        event_date: postData.eventDate,
        event_time: postData.eventTime,
        tags: postData.tags,
        target_audience: postData.targetAudience,
        background_color: postData.backgroundColor,
        allow_comments: postData.allowComments,
        is_pinned: postData.isPinned
      });
      
      console.log('Post created with ID:', postId);
      
      console.log('Post creation completed successfully');
      
      // 게시물 목록 새로고침
      await loadPosts();
      
      // 폼 닫기
      setShowCreateForm(false);
      
      alert('게시물이 성공적으로 작성되었습니다!');
    } catch (error) {
      console.error('Error creating post:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      alert(`게시물 작성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }, [user, loadPosts]);

  const handlePostAction = useCallback(async (postId: string, action: 'like' | 'bookmark' | 'share') => {
    if (!user) return;
    
    try {
      switch (action) {
        case 'like':
          await toggleSharePostLike(postId, user.id);
          break;
        case 'bookmark':
          await toggleSharePostBookmark(postId, user.id);
          break;
        case 'share':
          await incrementShareCount(postId);
          // 실제 공유 기능 구현 (예: 클립보드 복사, 소셜 미디어 공유 등)
          navigator.share && navigator.share({
            title: '삼부자 가족 앱',
            text: '가족과 함께 공유하는 소중한 순간',
            url: window.location.href
          });
          break;
      }
      
      // 상태 업데이트
      await loadPosts();
      
      if (user) {
        const interactions = await getUserSharePostInteractions(user.id);
        setUserInteractions(interactions);
      }
    } catch (error) {
      console.error(`Error ${action}ing post:`, error);
    }
  }, [user, loadPosts]);

  // 게시물 수정 핸들러
  const handleEditPost = useCallback(async (postData: PostFormData) => {
    if (!user || !editingPost) return;
    
    try {
      console.log('Updating post with data:', postData);
      
      // 이미지가 있으면 업로드
      let imageUrls = editingPost.images || [];
      if (postData.images && postData.images.length > 0) {
        console.log('Uploading new images for post:', editingPost.id);
        const newImageUrls = await uploadSharePostImages(postData.images, editingPost.id);
        imageUrls = [...imageUrls, ...newImageUrls];
      }
      
      await updateSharePost(editingPost.id, user.id, {
        title: postData.title,
        content: postData.content,
        type: postData.type,
        images: imageUrls,
        location: postData.location,
        event_date: postData.eventDate,
        event_time: postData.eventTime,
        tags: postData.tags,
        target_audience: postData.targetAudience,
        background_color: postData.backgroundColor,
        allow_comments: postData.allowComments,
        is_pinned: postData.isPinned
      });
      
      console.log('Post updated successfully');
      await loadPosts();
      setEditingPost(null);
      alert('게시물이 성공적으로 수정되었습니다!');
    } catch (error) {
      console.error('Error updating post:', error);
      alert(`게시물 수정 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }, [user, editingPost, loadPosts]);

  // 게시물 삭제 핸들러
  const handleDeletePost = useCallback(async (postId: string) => {
    if (!user) return;
    
    if (!confirm('이 게시물을 삭제하시겠습니까?')) return;
    
    try {
      console.log('Deleting post:', postId);
      await deleteSharePost(postId, user.id);
      console.log('Post deleted successfully');
      await loadPosts();
      alert('게시물이 성공적으로 삭제되었습니다!');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(`게시물 삭제 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }, [user, loadPosts]);

  // 필터링 및 정렬된 게시물
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts;

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 타입 필터
    if (selectedType !== 'all') {
      filtered = filtered.filter(post => post.type === selectedType);
    }

    // 정렬
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.likes_count + b.comments_count + b.shares_count) - (a.likes_count + a.comments_count + a.shares_count);
        case 'comments':
          return b.comments_count - a.comments_count;
        case 'latest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [posts, searchTerm, selectedType, sortBy]);

  const getPostTypeIcon = (type: string) => {
    const typeObj = postTypes.find(t => t.id === type);
    const IconComponent = typeObj?.icon || FileText;
    return IconComponent;
  };

  const getPostTypeColor = (type: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      photo: 'bg-green-100 text-green-800',
      video: 'bg-purple-100 text-purple-800',
      document: 'bg-gray-100 text-gray-800',
      event: 'bg-orange-100 text-orange-800',
      location: 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || colors.general;
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">로그인이 필요한 서비스입니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="family-card">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">공유</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>새 글 작성</span>
          </button>
        </div>

        {/* 검색 및 필터 */}
        <div className="space-y-3">
          {/* 검색 바 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="제목, 내용, 태그로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 필터 옵션 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 overflow-x-auto">
              {postTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedType === type.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <IconComponent className="w-3 h-3" />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 게시물 목록 */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">게시물을 불러오는 중...</p>
          </div>
        ) : filteredAndSortedPosts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || selectedType !== 'all' ? '검색 결과가 없습니다.' : '아직 공유된 게시물이 없습니다.'}
          </div>
        ) : (
          filteredAndSortedPosts.map((post) => {
            const IconComponent = getPostTypeIcon(post.type);
            return (
              <article key={post.id} className={`family-card hover:shadow-md transition-shadow ${
                post.is_pinned ? 'ring-2 ring-blue-200 bg-blue-50' : ''
              } ${post.background_color ? `bg-${post.background_color}-50` : ''}`}>
                {/* 게시물 헤더 */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar user={post.author} size="sm" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 text-sm">{post.author.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(post.author.role)}`}>
                          {getRoleName(post.author.role)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.type)}`}>
                          <IconComponent className="w-3 h-3 mr-1" />
                          {postTypes.find(t => t.id === post.type)?.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{getRelativeTime(post.created_at)}</p>
                    </div>
                  </div>
                  {/* 더보기 메뉴 (작성자만 표시) */}
                  {user && user.id === post.author_id && (
                    <div className="relative">
                      <button 
                        onClick={() => setShowDropdownId(showDropdownId === post.id ? null : post.id)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {showDropdownId === post.id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                          <button
                            onClick={() => {
                              setEditingPost(post);
                              setShowDropdownId(null);
                            }}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                          >
                            <Edit className="w-4 h-4" />
                            <span>수정</span>
                          </button>
                          <button
                            onClick={() => {
                              handleDeletePost(post.id);
                              setShowDropdownId(null);
                            }}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>삭제</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 게시물 내용 - 클릭 시 상세보기 */}
                <div 
                  className="mb-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  onClick={() => setSelectedPost(post)}
                >
                  <h2 className="font-semibold text-gray-900 mb-2">{post.title}</h2>
                  <div 
                    className="text-gray-700 text-sm line-clamp-2 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: post.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/__(.*?)__/g, '<u>$1</u>')
                        .replace(/`(.*?)`/g, '<code>$1</code>')
                        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-2 rounded-lg border border-gray-200" />')
                        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
                        .replace(/\n/g, '<br>')
                    }}
                  />
                  {post.content.length > 100 && (
                    <p className="text-blue-600 text-xs mt-1">자세히 보기...</p>
                  )}
                </div>

                {/* 이미지 표시 */}
                {post.images && post.images.length > 0 && (
                  <div className="mb-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {post.images.slice(0, 3).map((image, index) => (
                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={image}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => setSelectedPost(post)}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                      {post.images.length > 3 && (
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer"
                             onClick={() => setSelectedPost(post)}>
                          <span className="text-gray-500 font-medium">+{post.images.length - 3}장 더보기</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 간단한 메타 정보만 표시 */}
                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                  {post.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[100px]">{post.location}</span>
                    </div>
                  )}
                  {post.event_date && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(post.event_date).toLocaleDateString('ko-KR')}</span>
                    </div>
                  )}
                  {post.images && post.images.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <span>📷 {post.images.length}장</span>
                    </div>
                  )}
                  {post.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <span>🏷️ {post.tags.length}개</span>
                    </div>
                  )}
                </div>

                {/* 상호작용 버튼 */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => handlePostAction(post.id, 'like')}
                      className={`flex items-center space-x-1 text-sm transition-colors ${
                        userInteractions.likes.includes(post.id) ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${userInteractions.likes.includes(post.id) ? 'fill-current' : ''}`} />
                      <span>{post.likes_count}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments_count}</span>
                    </button>
                    <button 
                      onClick={() => handlePostAction(post.id, 'share')}
                      className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-600 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{post.shares_count}</span>
                    </button>
                  </div>
                  <button 
                    onClick={() => handlePostAction(post.id, 'bookmark')}
                    className={`transition-colors ${
                      userInteractions.bookmarks.includes(post.id) ? 'text-yellow-600' : 'text-gray-500 hover:text-yellow-600'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${userInteractions.bookmarks.includes(post.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* 새 글 작성 폼 */}
      {showCreateForm && (
        <CreatePostForm
          user={user}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreatePost}
        />
      )}

      {/* 게시물 수정 폼 */}
      {editingPost && (
        <CreatePostForm
          user={user}
          onClose={() => setEditingPost(null)}
          onSubmit={handleEditPost}
          initialData={{
            title: editingPost.title,
            content: editingPost.content,
            type: editingPost.type,
            tags: editingPost.tags,
            location: editingPost.location,
            eventDate: editingPost.event_date,
            eventTime: editingPost.event_time,
            targetAudience: editingPost.target_audience,
            backgroundColor: editingPost.background_color,
            allowComments: editingPost.allow_comments,
            isPinned: editingPost.is_pinned
          }}
        />
      )}

      {/* 게시물 상세보기 모달 */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          onLike={(postId) => handlePostAction(postId, 'like')}
          onBookmark={(postId) => handlePostAction(postId, 'bookmark')}
          onShare={(postId) => handlePostAction(postId, 'share')}
          onEdit={(post) => {
            setEditingPost(post);
            setSelectedPost(null);
          }}
          onDelete={handleDeletePost}
          userInteractions={userInteractions}
        />
      )}
    </div>
  );
}