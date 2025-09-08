'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Send, Heart, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { Comment } from '@/types';
import { getRoleName, getRoleColor, getRelativeTime } from '@/lib/utils';
import Image from 'next/image';

interface CommentSectionProps {
  targetType: 'post' | 'help' | 'event' | 'goal';
  targetId: string;
  comments: Comment[];
  onAddComment: (content: string) => void;
  onEditComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
}

export default function CommentSection({
  targetType,
  targetId,
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment
}: CommentSectionProps) {
  const { user } = useAuthStore();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  const handleSubmitComment = () => {
    if (!user || !newComment.trim()) return;
    
    onAddComment(newComment);
    setNewComment('');
    setShowCommentForm(false);
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    setShowDropdown(null);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim() || !editingCommentId) return;
    
    onEditComment(editingCommentId, editContent);
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm('댓글을 삭제하시겠습니까?')) {
      onDeleteComment(commentId);
    }
    setShowDropdown(null);
  };

  const canModifyComment = (comment: Comment) => {
    return user && (user.id === comment.author_id || user.role === 'dad');
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(null);
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  const targetComments = comments.filter(
    comment => comment.target_type === targetType && comment.target_id === targetId
  );

  return (
    <div className="border-t border-gray-100 pt-3 sm:pt-4 mt-3 sm:mt-4">
      {/* 댓글 보기/작성 버튼 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3 sm:space-x-4 text-gray-500">
          <button className="flex items-center space-x-1 hover:text-red-500 transition-colors touch-target touch-feedback">
            <Heart className="w-4 h-4" />
            <span className="text-sm">좋아요</span>
          </button>
          <button 
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="flex items-center space-x-1 hover:text-blue-500 transition-colors touch-target touch-feedback"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">
              댓글 {targetComments.length > 0 && `(${targetComments.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* 댓글 목록 */}
      {targetComments.length > 0 && (
        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
          {targetComments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-3 relative">
              {/* 수정/삭제 드롭다운 - 카드 우측상단 */}
              {canModifyComment(comment) && (
                <div className="absolute top-2 right-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(showDropdown === comment.id ? null : comment.id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                  
                  {showDropdown === comment.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[100px]">
                      <button
                        onClick={() => handleEditComment(comment)}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>수정</span>
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>삭제</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                  <Image 
                    src={`/${comment.author.role === 'dad' ? 'dad' : comment.author.role === 'eldest' ? 'eldest' : 'youngest'}-avatar.png`} 
                    alt={comment.author.name} 
                    width={32} 
                    height={32} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">
                      {comment.author.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(comment.author.role)}`}>
                        {getRoleName(comment.author.role)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getRelativeTime(comment.created_at)}
                        {comment.updated_at && comment.updated_at !== comment.created_at && (
                          <span className="ml-1">(수정됨)</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* 댓글 내용 또는 수정 폼 */}
                  {editingCommentId === comment.id ? (
                    <div className="mt-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 outline-none resize-none text-sm text-gray-900 bg-white"
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                          저장
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 text-sm leading-relaxed break-words">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 댓글 작성 폼 */}
      {showCommentForm && user && (
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
              <Image 
                src={`/${user.role === 'dad' ? 'dad' : user.role === 'eldest' ? 'eldest' : 'youngest'}-avatar.png`} 
                alt={user.name} 
                width={32} 
                height={32} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 outline-none resize-none text-sm text-gray-900 bg-white"
              />
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                <button
                  onClick={() => {
                    setShowCommentForm(false);
                    setNewComment('');
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors touch-target touch-feedback"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmitComment}
                  className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm touch-target touch-feedback"
                >
                  <Send className="w-3 h-3" />
                  <span>댓글</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 로그인 안내 */}
      {showCommentForm && !user && (
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
          <p className="text-gray-500 text-sm">댓글을 작성하려면 로그인해주세요.</p>
        </div>
      )}
    </div>
  );
}