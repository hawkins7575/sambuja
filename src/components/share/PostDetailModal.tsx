'use client';

import { useState, useCallback } from 'react';
import { 
  X, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreVertical,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { SharePost as FirebaseSharePost } from '@/types';
import { useAuthStore } from '@/lib/store';
import { getRoleName, getRoleColor, getRelativeTime } from '@/lib/utils';
import Avatar from '@/components/shared/Avatar';

interface PostDetailModalProps {
  post: FirebaseSharePost;
  isOpen: boolean;
  onClose: () => void;
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onShare: (postId: string) => void;
  onEdit: (post: FirebaseSharePost) => void;
  onDelete: (postId: string) => void;
  userInteractions: { likes: string[], bookmarks: string[] };
}

// URL을 자동으로 링크로 변환하는 함수
const formatContentWithLinks = (content: string) => {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  const parts = content.split(urlRegex);
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      const url = part.startsWith('http') ? part : `https://${part}`;
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
        >
          {part}
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

export default function PostDetailModal({
  post,
  isOpen,
  onClose,
  onLike,
  onBookmark,
  onShare,
  onEdit,
  onDelete,
  userInteractions
}: PostDetailModalProps) {
  const { user } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  const isLiked = userInteractions.likes.includes(post.id);
  const isBookmarked = userInteractions.bookmarks.includes(post.id);
  const canEdit = user && user.id === post.author_id;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar user={post.author} size="sm" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 text-sm">{post.author.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(post.author.role)}`}>
                    {getRoleName(post.author.role)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{getRelativeTime(post.created_at)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* 더보기 메뉴 (작성자만) */}
              {canEdit && (
                <div className="relative">
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                      <button
                        onClick={() => {
                          onEdit(post);
                          setShowDropdown(false);
                          onClose();
                        }}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                      >
                        <Edit className="w-4 h-4" />
                        <span>수정</span>
                      </button>
                      <button
                        onClick={() => {
                          onDelete(post.id);
                          setShowDropdown(false);
                          onClose();
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
              
              {/* 닫기 버튼 */}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 제목 */}
          <h2 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h2>
          
          {/* 본문 - 마크다운 렌더링 및 링크 자동 변환 */}
          <div 
            className="text-gray-700 text-sm mb-4 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: post.content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/__(.*?)__/g, '<u>$1</u>')
                .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-gray-100 rounded text-xs">$1</code>')
                .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
                .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-3 mb-2">$1</h2>')
                .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-2 mb-1">$1</h3>')
                .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-2">$1</blockquote>')
                .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
                .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4">$1. $2</li>')
                .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-2 rounded-lg border border-gray-200" />')
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
                .replace(/(https?:\/\/[^\s]+|www\.[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
                .replace(/\n/g, '<br>')
            }}
          />

          {/* 위치 정보 */}
          {post.location && (
            <div className="flex items-center space-x-1 text-sm text-gray-500 mb-3">
              <MapPin className="w-4 h-4" />
              <span>{post.location}</span>
            </div>
          )}

          {/* 이벤트 날짜 */}
          {post.event_date && (
            <div className="flex items-center space-x-1 text-sm text-gray-500 mb-3">
              <Calendar className="w-4 h-4" />
              <span>{new Date(post.event_date).toLocaleDateString('ko-KR')}</span>
              {post.event_time && <span>at {post.event_time}</span>}
            </div>
          )}

          {/* 이미지 표시 */}
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {post.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          {/* 태그 */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 하단 상호작용 버튼 */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => onLike(post.id)}
                className={`flex items-center space-x-2 transition-colors ${
                  isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">{post.likes_count}</span>
              </button>
              
              <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{post.comments_count}</span>
              </button>
              
              <button 
                onClick={() => onShare(post.id)}
                className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-medium">{post.shares_count}</span>
              </button>
            </div>
            
            <button 
              onClick={() => onBookmark(post.id)}
              className={`transition-colors ${
                isBookmarked ? 'text-yellow-600' : 'text-gray-500 hover:text-yellow-600'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}