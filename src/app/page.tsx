'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MessageCircle, Users, Calendar, Target, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { useAuthStore, useAppStore } from '@/lib/store';
import { getRoleName, getRoleColor, getRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import Avatar from '@/components/shared/Avatar';





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

  const loadData = useCallback(async () => {
    try {
      await Promise.all([loadAllData(), loadUsers()]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }, [loadAllData, loadUsers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUserSelect = (selectedUser: { id: string; name: string; role: 'dad' | 'eldest' | 'youngest'; email: string; created_at: string }) => {
    setUser(selectedUser);
  };

  // 최근 데이터만 표시 (각각 최대 2개) - 메모이제이션으로 성능 최적화
  const recentData = useMemo(() => ({
    posts: posts.slice(0, 2),
    events: events.slice(0, 2),
    goals: goals.slice(0, 2),
    helpRequests: helpRequests.slice(0, 2)
  }), [posts, events, goals, helpRequests]);

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
            <h2 className="text-xl font-bold text-gray-900 mb-2">삼부자 가족 사이트</h2>
            <p className="text-gray-600 mb-6">누구로 로그인 하시겠어요?</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-2 justify-items-center sm:justify-center">
              {users.length > 0 ? users.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleUserSelect(member)}
                  className="flex flex-col items-center space-y-3 px-4 py-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-200 group w-full max-w-[200px]"
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
                <h2 className="text-lg font-bold text-gray-900">
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
            <h3 className="text-base font-semibold text-gray-900">최근 소통</h3>
            <Link href="/communication" className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
              <span>더보기</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        <div className="space-y-3">
          {isDataLoading ? (
            <div className="text-center py-4 text-gray-500">데이터를 불러오는 중...</div>
          ) : recentData.posts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">아직 게시글이 없습니다.</div>
          ) : (
            recentData.posts.map((post) => (
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
          <h3 className="text-base font-semibold text-gray-900">최근 도움 요청</h3>
          <Link href="/help" className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 text-sm font-medium">
            <span>더보기</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {isDataLoading ? (
            <div className="text-center py-4 text-gray-500">데이터를 불러오는 중...</div>
          ) : recentData.helpRequests.length === 0 ? (
            <div className="text-center py-4 text-gray-500">아직 도움 요청이 없습니다.</div>
          ) : (
            recentData.helpRequests.map((request) => (
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
          <h3 className="text-base font-semibold text-gray-900">다가오는 일정</h3>
          <Link href="/schedule" className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm font-medium">
            <span>더보기</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {recentData.events.map((event) => (
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
          <h3 className="text-base font-semibold text-gray-900">진행 중인 목표</h3>
          <Link href="/goals" className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-sm font-medium">
            <span>더보기</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {recentData.goals.map((goal) => (
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