'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Users, Calendar, Target, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { useAuthStore, useAppStore } from '@/lib/store';
import { getRoleName, getRoleColor, getRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import Avatar from '@/components/shared/Avatar';

// Mock data for latest content
const mockLatestPosts = [
  {
    id: '1',
    title: '오늘 회사에서 있었던 일',
    content: '오늘 회사에서 프레젠테이션을 성공적으로 마쳤어요! 여러분이 응원해줘서 용기가 났답니다. 감사해요 😊',
    author: { id: '1', name: '아빠', role: 'dad' as const, email: 'dad@example.com', created_at: '2025-01-01' },
    target_audience: 'all' as const,
    created_at: '2025-09-02T10:30:00Z',
  },
  {
    id: '2',
    title: '아빠, 축구 가르쳐줘서 고마워요!',
    content: '오늘 체육시간에 축구를 했는데 우리 팀이 이겼어요! 골도 한 개 넣었답니다.',
    author: { id: '2', name: '짱남', role: 'eldest' as const, email: 'eldest@example.com', created_at: '2025-01-01' },
    target_audience: 'dad' as const,
    created_at: '2025-09-02T14:15:00Z',
  },
];

const mockLatestHelp = [
  {
    id: '1',
    title: '아빠, 수학 숙제 좀 도와주세요',
    description: '분수 계산이 너무 어려워요. 특히 통분하는 방법을 모르겠어요.',
    requester: { id: '3', name: '막뚱이', role: 'youngest' as const, email: 'youngest@example.com', created_at: '2025-01-01' },
    status: 'open' as const,
    target_audience: 'dad' as const,
    created_at: '2025-09-02T09:00:00Z',
  },
];

const mockLatestEvents = [
  {
    id: '1',
    title: '장남 축구 경기',
    description: '학교 대표팀 축구 경기가 있어요. 응원 와주세요!',
    start_date: '2025-09-05T15:00:00Z',
    creator: { id: '2', name: '짱남', role: 'eldest' as const, email: 'eldest@example.com', created_at: '2025-01-01' },
    created_at: '2025-09-02T10:00:00Z',
  },
  {
    id: '2',
    title: '가족 영화 관람',
    description: '주말에 온 가족이 함께 영화를 보러 가요!',
    start_date: '2025-09-08T19:30:00Z',
    creator: { id: '3', name: '막뚱이', role: 'youngest' as const, email: 'youngest@example.com', created_at: '2025-01-01' },
    created_at: '2025-09-02T16:20:00Z',
  },
];

const mockLatestGoals = [
  {
    id: '1',
    title: '매일 30분 운동하기',
    description: '건강한 몸을 만들기 위해 매일 30분씩 운동하기로 했어요.',
    owner: { id: '1', name: '아빠', role: 'dad' as const, email: 'dad@example.com', created_at: '2025-01-01' },
    progress: 65,
    completed: false,
    target_date: '2025-12-31',
    created_at: '2025-09-01T09:00:00Z',
  },
  {
    id: '2',
    title: '피아노 곡 하나 완주하기',
    description: '좋아하는 피아노 곡을 처음부터 끝까지 완벽하게 연주할 수 있도록 연습하기!',
    owner: { id: '2', name: '짱남', role: 'eldest' as const, email: 'eldest@example.com', created_at: '2025-01-01' },
    progress: 100,
    completed: true,
    target_date: '2025-10-15',
    created_at: '2025-07-20T10:00:00Z',
  },
];

// const quickActions = [
//   {
//     title: '소통하기',
//     description: '가족과 이야기를 나눠보세요',
//     icon: MessageCircle,
//     href: '/communication',
//     color: 'bg-blue-500',
//   },
//   {
//     title: '일정 확인',
//     description: '오늘의 가족 일정을 확인하세요',
//     icon: Calendar,
//     href: '/schedule',
//     color: 'bg-green-500',
//   },
//   {
//     title: '목표 관리',
//     description: '개인 목표를 설정하고 관리하세요',
//     icon: Target,
//     href: '/goals',
//     color: 'bg-purple-500',
//   },
//   {
//     title: '도움 요청',
//     description: '도움이 필요할 때 언제든지',
//     icon: Users,
//     href: '/help',
//     color: 'bg-orange-500',
//   },
// ];

export default function Home() {
  const { user, setUser, users, loadUsers } = useAuthStore();
  const { posts, events, goals, helpRequests, loadAllData, isDataLoading } = useAppStore();

  useEffect(() => {
    // 데이터 로드 (한 번만 실행)
    loadAllData();
    loadUsers(); // 사용자 데이터도 로드
  }, []); // 의존성 배열을 비워서 한 번만 실행

  const handleUserSelect = (selectedUser: { id: string; name: string; role: 'dad' | 'eldest' | 'youngest'; email: string; created_at: string }) => {
    setUser(selectedUser);
  };

  // 최근 데이터만 표시 (각각 최대 2개)
  const recentPosts = posts.slice(0, 2);
  const recentEvents = events.slice(0, 2);
  const recentGoals = goals.slice(0, 2);
  const recentHelpRequests = helpRequests.slice(0, 2);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Users className="w-4 h-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* 사용자 선택 또는 환영 메시지 */}
      {!user ? (
        <div className="family-card">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">삼부자 가족 사이트</h2>
            <p className="text-gray-600 mb-6">누구로 로그인 하시겠어요?</p>
            <div className="flex justify-center space-x-4">
              {users.length > 0 ? users.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleUserSelect(member)}
                  className="flex flex-col items-center space-y-3 px-6 py-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-blue-500 group-hover:scale-110 transition-all">
                    <Image 
                      src={`/${member.role === 'dad' ? 'dad' : member.role === 'eldest' ? 'eldest' : 'youngest'}-avatar.png`} 
                      alt={member.name} 
                      width={64} 
                      height={64} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(member.role)}`}>
                      {getRoleName(member.role)}
                    </span>
                  </div>
                </button>
              )) : (
                <div className="text-center py-4 text-gray-500">
                  사용자를 불러오는 중...
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="family-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar user={user} size="lg" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  안녕하세요, {user.name}님! 👋
                </h2>
                <p className="text-gray-600 mt-1">
                  오늘도 따뜻한 하루 되세요
                </p>
              </div>
            </div>
            <button
              onClick={() => setUser(null)}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              다른 사용자로 전환
            </button>
          </div>
        </div>
      )}


      {/* 최근 소통 - 로그인된 경우에만 표시 */}
      {user && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">최근 소통</h3>
            <Link href="/communication" className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
              <span>더보기</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        <div className="space-y-3">
          {isDataLoading ? (
            <div className="text-center py-4 text-gray-500">데이터를 불러오는 중...</div>
          ) : recentPosts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">아직 게시글이 없습니다.</div>
          ) : (
            recentPosts.map((post) => (
            <div key={post.id} className="family-card hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <Avatar user={post.author} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">{post.author.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(post.author.role)}`}>
                      {getRoleName(post.author.role)}
                    </span>
                    <span className="text-xs text-gray-500">{getRelativeTime(post.created_at)}</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1 text-sm">{post.title}</h4>
                  <p className="text-gray-600 text-xs line-clamp-2">{post.content}</p>
                </div>
              </div>
            </div>
          ))
          )}
        </div>
        </div>
      )}

      {/* 최근 도움 요청 - 로그인된 경우에만 표시 */}
      {user && (
        <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">최근 도움 요청</h3>
          <Link href="/help" className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 text-sm font-medium">
            <span>더보기</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {isDataLoading ? (
            <div className="text-center py-4 text-gray-500">데이터를 불러오는 중...</div>
          ) : recentHelpRequests.length === 0 ? (
            <div className="text-center py-4 text-gray-500">아직 도움 요청이 없습니다.</div>
          ) : (
            recentHelpRequests.map((request) => (
              <div key={request.id} className="family-card hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <Avatar user={request.requester} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 text-sm">{request.requester.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(request.requester.role)}`}>
                        {getRoleName(request.requester.role)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(request.status)}
                      <span className="text-xs text-gray-500">{getRelativeTime(request.created_at)}</span>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1 text-sm">{request.title}</h4>
                  <p className="text-gray-600 text-xs line-clamp-2">{request.description}</p>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
        </div>
      )}

      {/* 다가오는 일정 - 로그인된 경우에만 표시 */}
      {user && (
        <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">다가오는 일정</h3>
          <Link href="/schedule" className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm font-medium">
            <span>더보기</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {events.slice(0, 2).map((event) => (
            <div key={event.id} className="family-card hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <Avatar user={event.creator} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 text-sm">{event.creator.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(event.creator.role)}`}>
                        {getRoleName(event.creator.role)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">
                        {new Date(event.start_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1 text-sm">{event.title}</h4>
                  <p className="text-gray-600 text-xs line-clamp-2">{event.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      )}

      {/* 진행 중인 목표 - 로그인된 경우에만 표시 */}
      {user && (
        <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">진행 중인 목표</h3>
          <Link href="/goals" className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-sm font-medium">
            <span>더보기</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {goals.slice(0, 2).map((goal) => (
            <div key={goal.id} className={`family-card hover:shadow-md transition-shadow ${
              goal.completed ? 'bg-green-50 border-green-200' : ''
            }`}>
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  goal.completed ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  {goal.completed ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <Target className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 text-sm">{goal.owner.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(goal.owner.role)}`}>
                        {getRoleName(goal.owner.role)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {goal.completed ? '완료!' : `${goal.progress}%`}
                    </div>
                  </div>
                  <h4 className={`font-medium mb-1 text-sm ${
                    goal.completed ? 'text-green-800' : 'text-gray-900'
                  }`}>{goal.title}</h4>
                  <p className="text-gray-600 text-xs line-clamp-1 mb-2">{goal.description}</p>
                  
                  {!goal.completed && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(goal.progress)}`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      )}
    </div>
  );
}