'use client';

import { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle, Users, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { getRoleName, getRoleColor, getRelativeTime } from '@/lib/utils';
import CommentSection from '@/components/shared/CommentSection';
import { Comment } from '@/types';
import Avatar from '@/components/shared/Avatar';
import { NotificationService } from '@/lib/notifications';

const mockHelpRequests = [
  {
    id: '1',
    title: '아빠, 수학 숙제 좀 도와주세요',
    description: '분수 계산이 너무 어려워요. 특히 통분하는 방법을 모르겠어요. 내일까지 숙제를 해야 하는데 도와주세요!',
    target_audience: 'dad' as const,
    status: 'open' as const,
    requester_id: '3',
    requester: {
      id: '3',
      name: '막뚱이',
      role: 'youngest' as const,
      email: 'youngest@example.com',
      created_at: '2025-01-01',
    },
    created_at: '2025-09-02T09:00:00Z',
    updated_at: '2025-09-02T09:00:00Z',
  },
  {
    id: '2',
    title: '장남아, 컴퓨터 프로그램 설치 좀 도와줘',
    description: '새 컴퓨터에 필요한 프로그램들을 설치하고 싶은데 어떤 것들이 필요한지 모르겠어요. 추천해주시고 설치도 도와주세요.',
    target_audience: 'eldest' as const,
    status: 'in_progress' as const,
    requester_id: '1',
    requester: {
      id: '1',
      name: '아빠',
      role: 'dad' as const,
      email: 'dad@example.com',
      created_at: '2025-01-01',
    },
    helper_id: '2',
    helper: {
      id: '2',
      name: '짱남',
      role: 'eldest' as const,
      email: 'eldest@example.com',
      created_at: '2025-01-01',
    },
    created_at: '2025-09-01T14:30:00Z',
    updated_at: '2025-09-02T10:15:00Z',
  },
  {
    id: '3',
    title: '아빠, 축구 연습 같이 해요',
    description: '축구 실력을 늘리고 싶어요. 드리블과 슈팅 연습을 같이 해주실 분 계신가요? 주말에 시간 되실 때 부탁드려요.',
    target_audience: 'dad' as const,
    status: 'completed' as const,
    requester_id: '2',
    requester: {
      id: '2',
      name: '짱남',
      role: 'eldest' as const,
      email: 'eldest@example.com',
      created_at: '2025-01-01',
    },
    helper_id: '1',
    helper: {
      id: '1',
      name: '아빠',
      role: 'dad' as const,
      email: 'dad@example.com',
      created_at: '2025-01-01',
    },
    created_at: '2025-08-30T16:00:00Z',
    updated_at: '2025-09-01T18:30:00Z',
  },
  {
    id: '4',
    title: '누구든지 같이 게임해요!',
    description: '새로 산 보드게임이 너무 재미있어요! 가족 모두 같이 하면 좋겠는데 시간 되실 때 같이 해요!',
    target_audience: 'all' as const,
    status: 'open' as const,
    requester_id: '3',
    requester: {
      id: '3',
      name: '막뚱이',
      role: 'youngest' as const,
      email: 'youngest@example.com',
      created_at: '2025-01-01',
    },
    created_at: '2025-09-02T20:00:00Z',
    updated_at: '2025-09-02T20:00:00Z',
  },
];

const mockComments: Comment[] = [
  {
    id: '1',
    content: '분수 계산은 처음엔 어려울 수 있어. 천천히 함께 해보자!',
    target_type: 'help',
    target_id: '1',
    author_id: '1',
    author: {
      id: '1',
      name: '아빠',
      role: 'dad',
      email: 'dad@example.com',
      created_at: '2025-01-01',
    },
    created_at: '2025-09-02T09:30:00Z',
  },
];

export default function HelpPage() {
  const { user } = useAuthStore();
  const [helpRequests, setHelpRequests] = useState(mockHelpRequests);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [showForm, setShowForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'in_progress' | 'completed'>('all');
  const [newRequest, setNewRequest] = useState({ title: '', description: '', target_audience: 'all' });

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
            onClick={() => setSelectedStatus(filter.key as any)}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">도움 요청하기</h3>
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
                onClick={handleSubmitRequest}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                요청하기
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setNewRequest({ title: '', description: '', target_audience: 'all' });
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
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(request.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
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