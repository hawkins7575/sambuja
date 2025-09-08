'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useAuthStore, useAppStore } from '@/lib/store';
import { getRoleName, getRoleColor, getRelativeTime } from '@/lib/utils';
import CommentSection from '@/components/shared/CommentSection';
import { Comment, HelpRequest } from '@/types';

type User = {
  id: string;
  email: string;
  name: string;
  role: 'dad' | 'eldest' | 'youngest';
  avatar_url?: string;
  created_at: string;
};
import Avatar from '@/components/shared/Avatar';
import { NotificationService } from '@/lib/notifications';
import { createHelpRequest, deleteHelpRequest } from '@/lib/firebase/helpRequests';
import { createComment, getCommentsByTarget, updateComment, deleteComment } from '@/lib/firebase/comments';



export default function HelpPage() {
  const { user } = useAuthStore();
  const { helpRequests, setHelpRequests, loadAllData } = useAppStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newRequest, setNewRequest] = useState({ title: '', description: '', target_audience: 'all' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{title?: string, description?: string, target_audience?: string}>({});
  const [editingRequest, setEditingRequest] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  const filteredRequests = helpRequests;

  const validateForm = () => {
    const newErrors: {title?: string, description?: string, target_audience?: string} = {};
    
    if (!newRequest.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }
    if (!newRequest.description.trim()) {
      newErrors.description = '설명을 입력해주세요.';
    }
    if (!newRequest.target_audience) {
      newErrors.target_audience = '도움을 요청할 대상을 선택해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitRequest = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Firebase에 저장
      const requestId = await createHelpRequest({
        title: newRequest.title,
        description: newRequest.description,
        requester_id: user.id,
        requester: user,
        target_audience: newRequest.target_audience,
      });

      // 로컬 상태 업데이트 (즉시 반영용)
      const request = {
        id: requestId,
        title: newRequest.title,
        description: newRequest.description,
        requester_id: user.id,
        requester: user,
        target_audience: newRequest.target_audience,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setHelpRequests([request, ...helpRequests]);
      setNewRequest({ title: '', description: '', target_audience: 'all' });
      setShowForm(false);

      // 푸시 알림 발송
      const notificationService = NotificationService.getInstance();
      await notificationService.notifyNewHelpRequest(
        user.name,
        newRequest.title,
        newRequest.target_audience
      );
    } catch (error) {
      console.error('도움 요청 저장 실패:', error);
      alert('도움 요청 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };



  const getTargetAudienceOptions = () => {
    // 모든 가족 구성원을 항상 표시
    return [
      { value: 'all', label: '모두에게' },
      { value: 'dad', label: '아빠에게' },
      { value: 'eldest', label: '장남에게' },
      { value: 'youngest', label: '막둥이에게' }
    ];
  };

  const getTargetAudienceLabel = (targetAudience: string) => {
    const options = {
      'all': '모두',
      'dad': '아빠',
      'eldest': '장남',
      'youngest': '막둥이'
    };
    return options[targetAudience as keyof typeof options] || '모두';
  };

  const handleAddComment = async (content: string, targetId: string) => {
    if (!user) return;
    
    try {
      // Firebase에 댓글 저장
      const commentId = await createComment({
        content,
        target_type: 'help',
        target_id: targetId,
        author_id: user.id,
        author: user,
      });

      // 로컬 상태 업데이트
      const newComment: Comment = {
        id: commentId,
        content,
        target_type: 'help',
        target_id: targetId,
        author_id: user.id,
        author: user,
        created_at: new Date().toISOString(),
      };
      
      setComments(prev => [...prev, newComment]);
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('댓글 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      await updateComment(commentId, content);
      
      // 로컬 상태 업데이트
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, content, updated_at: new Date().toISOString() }
          : comment
      ));
    } catch (error) {
      console.error('Failed to edit comment:', error);
      alert('댓글 수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      
      // 로컬 상태 업데이트
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('댓글 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleEditRequest = (requestId: string) => {
    const request = helpRequests.find(r => r.id === requestId);
    if (!request) return;
    
    setNewRequest({
      title: request.title,
      description: request.description,
      target_audience: request.target_audience
    });
    setEditingRequest(requestId);
    setShowForm(true);
    setShowDropdown(null);
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (window.confirm('정말 이 도움 요청을 삭제하시겠습니까?')) {
      try {
        // Firebase에서 삭제
        await deleteHelpRequest(requestId);
        
        // 로컬 상태 업데이트
        setHelpRequests(helpRequests.filter(r => r.id !== requestId));
        setShowDropdown(null);
      } catch (error) {
        console.error('도움 요청 삭제 실패:', error);
        alert('도움 요청 삭제에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleUpdateRequest = async () => {
    if (!user || !editingRequest) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    const updatedRequests = helpRequests.map(request => 
      request.id === editingRequest 
        ? {
            ...request,
            title: newRequest.title,
            description: newRequest.description,
            target_audience: newRequest.target_audience,
            updated_at: new Date().toISOString()
          }
        : request
    );
    
    setHelpRequests(updatedRequests);
    setNewRequest({ title: '', description: '', target_audience: 'all' });
    setShowForm(false);
    setEditingRequest(null);
    setIsSubmitting(false);
  };

  const canEditRequest = (request: { requester_id: string }) => {
    return user && (user.role === 'dad' || user.id === request.requester_id);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // 모든 도움 요청의 댓글 로드
  useEffect(() => {
    const loadAllComments = async () => {
      try {
        const allComments: Comment[] = [];
        for (const request of helpRequests) {
          const requestComments = await getCommentsByTarget('help', request.id);
          allComments.push(...requestComments);
        }
        setComments(allComments);
      } catch (error) {
        console.error('Failed to load comments:', error);
      }
    };
    
    if (helpRequests.length > 0) {
      loadAllComments();
    }
  }, [helpRequests]);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(null);
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>도움 요청</span>
        </button>
      </div>


      {/* 요청 폼 */}
      {showForm && (
        <div className="family-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingRequest ? '도움 요청 수정' : '도움 요청하기'}
          </h3>
          <div className="space-y-4">
            {/* 요청자 표시 */}
            {user && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">요청자</label>
                <div className="flex items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <Avatar user={user} size="sm" />
                  <div className="ml-3">
                    <div className="font-medium text-sm text-gray-900">{user.name}</div>
                    <div className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleName(user.role)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 도움 대상 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                도움 대상 선택 <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">누구에게 도움을 요청할지 선택해주세요.</p>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {getTargetAudienceOptions().map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setNewRequest({ ...newRequest, target_audience: option.value });
                      if (errors.target_audience) setErrors({ ...errors, target_audience: undefined });
                    }}
                    className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center min-h-[44px] ${
                      newRequest.target_audience === option.value
                        ? 'bg-orange-500 text-white shadow-lg transform scale-105 border-2 border-orange-600'
                        : 'bg-white text-gray-700 hover:bg-orange-50 active:scale-95 border-2 border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {errors.target_audience && (
                <p className="mt-2 text-sm text-red-600">{errors.target_audience}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                도움 요청 제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="예: 문서 작업 도와주세요, 기술 지원 필요해요"
                value={newRequest.title}
                onChange={(e) => {
                  setNewRequest({ ...newRequest, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                  errors.title 
                    ? 'border-red-300 focus:border-red-500 bg-red-50' 
                    : 'border-gray-300 focus:border-orange-500'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상세 설명 <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="구체적으로 어떤 도움이 필요한지, 언제까지 필요한지 등을 자세히 설명해주세요."
                value={newRequest.description}
                onChange={(e) => {
                  setNewRequest({ ...newRequest, description: e.target.value });
                  if (errors.description) setErrors({ ...errors, description: undefined });
                }}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none resize-none transition-colors ${
                  errors.description 
                    ? 'border-red-300 focus:border-red-500 bg-red-50' 
                    : 'border-gray-300 focus:border-orange-500'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={editingRequest ? handleUpdateRequest : handleSubmitRequest}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg font-semibold text-sm min-h-[40px] transition-all duration-200 ${
                  isSubmitting
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95 shadow-md'
                }`}
              >
                {isSubmitting 
                  ? (editingRequest ? '수정 중...' : '등록 중...')
                  : (editingRequest ? '수정하기' : '요청하기')
                }
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setNewRequest({ title: '', description: '', target_audience: 'all' });
                  setEditingRequest(null);
                  setErrors({});
                  setIsSubmitting(false);
                }}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg font-semibold text-sm min-h-[40px] transition-all duration-200 ${
                  isSubmitting
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400 active:scale-95'
                }`}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 도움 요청 목록 */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="family-card text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">
              도움 요청이 없습니다
            </p>
            <p className="text-sm text-gray-400 mt-1">
              가족에게 도움이 필요할 때 언제든 요청해보세요!
            </p>
          </div>
        ) : (
          filteredRequests
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((request) => (
            <div key={request.id} className="family-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Avatar user={request.requester} size="md" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{request.requester.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(request.requester.role)}`}>
                        {getRoleName(request.requester.role)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{getRelativeTime(request.created_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">

                  {/* 수정/삭제 메뉴 */}
                  {canEditRequest(request) && (
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDropdown(showDropdown === request.id ? null : request.id);
                        }}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      
                      {showDropdown === request.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                          <button
                            onClick={() => handleEditRequest(request.id)}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>수정</span>
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>삭제</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* 대상 표시 */}
              <div className="flex items-center justify-between mb-3">
                <div></div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">→</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.target_audience === 'all' 
                      ? 'bg-gray-100 text-gray-700'
                      : request.target_audience === 'dad' 
                      ? 'bg-blue-100 text-blue-700'
                      : request.target_audience === 'eldest'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {getTargetAudienceLabel(request.target_audience)}
                  </span>
                </div>
              </div>
              
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{request.title}</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">{request.description}</p>
              
              
              <CommentSection
                targetType="help"
                targetId={request.id}
                comments={comments}
                onAddComment={(content) => handleAddComment(content, request.id)}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}