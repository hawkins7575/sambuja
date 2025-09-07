'use client';

import { useState } from 'react';
import { MessageCircle, Send, Heart } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { Comment } from '@/types';
import { getRoleName, getRoleColor, getRelativeTime } from '@/lib/utils';
import Image from 'next/image';

interface CommentSectionProps {
  targetType: 'post' | 'help' | 'event' | 'goal';
  targetId: string;
  comments: Comment[];
  onAddComment: (content: string) => void;
}

export default function CommentSection({
  targetType,
  targetId,
  comments,
  onAddComment
}: CommentSectionProps) {
  const { user } = useAuthStore();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleSubmitComment = () => {
    if (!user || !newComment.trim()) return;
    
    onAddComment(newComment);
    setNewComment('');
    setShowCommentForm(false);
  };

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
            <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
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
                <div className="flex-1 min-w-0">
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
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed break-words">
                    {comment.content}
                  </p>
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