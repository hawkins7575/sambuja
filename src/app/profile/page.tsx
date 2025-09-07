'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { profileQuestions, getDefaultAnswers, ProfileAnswer } from '@/lib/profileTemplate';
import ProfileCard from '@/components/profile/ProfileCard';
import Avatar from '@/components/shared/Avatar';
import { UserTabsSkeleton, ProfileCardSkeleton } from '@/components/ui/Skeleton';


export default function ProfilePage() {
  const { user, users } = useAuthStore();
  const [selectedMember, setSelectedMember] = useState<string>('');
  useEffect(() => {
    // 기본적으로 첫 번째 사용자 선택 (로그인 상태와 무관)
    if (users.length > 0 && !selectedMember) {
      setSelectedMember(users[0].id);
    }
    
    // 로그인한 사용자가 있으면 해당 사용자 선택
    if (user && users.length > 0) {
      setSelectedMember(user.id);
    }
  }, [user, users]);

  const selectedMemberData = users.find(member => member.id === selectedMember);

  // 사용자 목록이 없으면 로딩 표시
  if (users.length === 0) {
    return (
      <div className="space-y-2 md:space-y-6 -mx-4 md:mx-0">
        <UserTabsSkeleton />
        <div className="mx-4 md:mx-0">
          <ProfileCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 md:space-y-6 -mx-4 md:mx-0">

      {/* 가족 구성원 선택 탭 */}
      <div className="bg-white md:rounded-xl shadow-sm border-0 md:border border-gray-100 mx-4 md:mx-0">
        <div className="p-1 bg-gray-50 rounded-xl md:rounded-xl">
          <div className="flex space-x-1">
            {users.map((member) => (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member.id)}
                className={`flex-1 py-3 px-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  selectedMember === member.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <Avatar user={member} size="sm" showBorder={false} />
                  <span className="text-xs font-medium">{member.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 선택된 구성원의 프로필 카드 */}
      {selectedMemberData && (
        <div className="mx-4 md:mx-0">
          <ProfileCard
            user={selectedMemberData}
            questions={profileQuestions}
            isOwner={true}
          />
        </div>
      )}

      {/* 설명 - 데스탑에서만 표시 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 mx-4 md:mx-0 hidden md:block">
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-sm">📝</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">프로필 가이드</h3>
          </div>
          <div className="space-y-2 text-xs text-gray-600 pl-8">
            <p className="flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
              각 가족 구성원의 탭을 클릭하여 프로필을 확인해보세요
            </p>
            <p className="flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
              모든 가족 구성원의 프로필을 편집할 수 있어요
            </p>
            <p className="flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
              모든 질문에 답변하여 가족이 서로를 더 잘 알 수 있도록 해보세요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}