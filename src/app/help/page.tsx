'use client';

import { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle, Users, AlertCircle, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
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



export default function HelpPage() {
  const { user } = useAuthStore();
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'in_progress' | 'completed'>('all');
  const [newRequest, setNewRequest] = useState({ title: '', description: '', target_audience: 'all' });
  const [editingRequest, setEditingRequest] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  const filteredRequests = helpRequests.filter(request => 
    selectedStatus === 'all' || request.status === selectedStatus
  );

  const handleSubmitRequest = async () => {
    if (!user || !newRequest.title.trim() || !newRequest.description.trim()) return;
    
    const request = {
      id: Date.now().toString(),
      title: newRequest.title,
      description: newRequest.description,
      status: 'open' as const,
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
  };

  const handleOfferHelp = (requestId: string) => {
    if (!user) return;
    
    setHelpRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { 
            ...request, 
            status: 'in_progress' as const,
            helper_id: user.id,
            helper: user,
            updated_at: new Date().toISOString()
          }
        : request
    ));
  };

  const handleCompleteHelp = (requestId: string) => {
    setHelpRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { 
            ...request, 
            status: 'completed' as const,
            updated_at: new Date().toISOString()
          }
        : request
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return '도움 요청';
      case 'in_progress':
        return '진행 중';
      case 'completed':
        return '완료됨';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTargetAudienceOptions = () => {
    if (!user) return [];
    
    const options = [{ value: 'all', label: '모두에게' }];
    
    if (user.role === 'dad') {
      options.push(
        { value: 'eldest', label: '장남에게' },
        { value: 'youngest', label: '막둥이에게' }
      );
    } else if (user.role === 'eldest') {
      options.push(
        { value: 'dad', label: '아빠에게' },
        { value: 'youngest', label: '막둥이에게' }
      );
    } else if (user.role === 'youngest') {
      options.push(
        { value: 'dad', label: '아빠에게' },
        { value: 'eldest', label: '형에게' }
      );
    }
    
    return options;
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

  const handleAddComment = (content: string, targetId: string) => {
    if (!user) return;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      content,
      target_type: 'help',
      target_id: targetId,
      author_id: user.id,
      author: user,
      created_at: new Date().toISOString(),
    };
    
    setComments(prev => [...prev, newComment]);
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

  const handleDeleteRequest = (requestId: string) => {
    if (window.confirm('정말 이 도움 요청을 삭제하시겠습니까?')) {
      setHelpRequests(helpRequests.filter(r => r.id !== requestId));
      setShowDropdown(null);
    }
  };

  const handleUpdateRequest = async () => {
    if (!user || !newRequest.title.trim() || !newRequest.description.trim() || !editingRequest) return;
    
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
  };

  const canEditRequest = (request: { requester_id: string }) => {
    return user && (user.role === 'dad' || user.id === request.requester_id);
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

      {/* 상태 필터 */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">상태:</span>
        {[
          { key: 'all', label: '전체' },
          { key: 'open', label: '요청 중' },
          { key: 'in_progress', label: '진행 중' },
          { key: 'completed', label: '완료됨' },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setSelectedStatus(filter.key as 'all' | 'open' | 'in_progress' | 'completed')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedStatus === filter.key
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* 요청 폼 */}
      {showForm && (
        <div className="family-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingRequest ? '도움 요청 수정' : '도움 요청하기'}
          </h3>
          <div className="space-y-4">
            {/* 대상 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">누구에게 도움을 요청할까요?</label>
              <div className="flex flex-wrap gap-2">
                {getTargetAudienceOptions().map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setNewRequest({ ...newRequest, target_audience: option.value })}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      newRequest.target_audience === option.value
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              placeholder="어떤 도움이 필요한지 제목을 입력하세요"
              value={newRequest.title}
              onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 outline-none"
            />
            <textarea
              placeholder="구체적으로 어떤 도움이 필요한지 설명해주세요"
              value={newRequest.description}
              onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 outline-none resize-none"
            />
            <div className="flex space-x-2">
              <button
                onClick={editingRequest ? handleUpdateRequest : handleSubmitRequest}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                {editingRequest ? '수정하기' : '요청하기'}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setNewRequest({ title: '', description: '', target_audience: 'all' });
                  setEditingRequest(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
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
              {selectedStatus === 'all' ? '도움 요청이 없습니다' : `${getStatusText(selectedStatus)} 요청이 없습니다`}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              가족에게 도움이 필요할 때 언제든 요청해보세요!
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
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
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(request.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>

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
              
              {request.helper && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      도움 제공: <span className="font-medium">{request.helper.name}</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(request.helper.role)}`}>
                        {getRoleName(request.helper.role)}
                      </span>
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                {request.status === 'open' && user && user.id !== request.requester_id && (
                  <button
                    onClick={() => handleOfferHelp(request.id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    도와주기
                  </button>
                )}
                
                {request.status === 'in_progress' && user && (user.id === request.requester_id || user.id === request.helper_id) && (
                  <button
                    onClick={() => handleCompleteHelp(request.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    완료 처리
                  </button>
                )}
              </div>
              
              <CommentSection
                targetType="help"
                targetId={request.id}
                comments={comments}
                onAddComment={(content) => handleAddComment(content, request.id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}