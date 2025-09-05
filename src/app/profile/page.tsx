'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { profileQuestions, getDefaultAnswers, ProfileAnswer } from '@/lib/profileTemplate';
import ProfileCard from '@/components/profile/ProfileCard';
import Avatar from '@/components/shared/Avatar';


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
  if (users.length === 0) return <div className="flex justify-center items-center min-h-64"><div className="text-gray-500">로딩 중...</div></div>;

  return (
    <div className="space-y-3 md:space-y-6">

      {/* 가족 구성원 선택 탭 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 md:p-3">
        <div className="flex space-x-1 md:space-x-2 bg-gradient-to-r from-sky-50 via-blue-50 to-sky-50 rounded-lg p-2">
          {users.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member.id)}
              className={`flex-1 py-3 px-2 md:py-4 md:px-3 rounded-lg font-medium text-sm md:text-sm transition-all duration-300 ${
                selectedMember === member.id
                  ? 'bg-white text-sky-600 shadow-md ring-1 ring-sky-200'
                  : 'text-gray-600 hover:text-sky-500 hover:bg-white/50'
              }`}
            >
              <div className="flex flex-col items-center space-y-1 md:space-y-2">
                <div className={`transition-all duration-300 ${
                  selectedMember === member.id 
                    ? 'ring-2 ring-sky-300 ring-offset-1 rounded-full' 
                    : 'opacity-80 hover:opacity-100'
                }`}>
                  <Avatar user={member} size="sm" />
                </div>
                <span className="font-semibold text-sm md:text-base">{member.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 선택된 구성원의 프로필 카드 */}
      {selectedMemberData && (
        <ProfileCard
          user={selectedMemberData}
          questions={profileQuestions}
          isOwner={user ? (user.role === 'dad' || user.id === selectedMember) : false}
        />
      )}

      {/* 설명 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-sky-50 rounded-xl border border-sky-100 shadow-sm">
        <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-gradient-to-bl from-sky-200/20 to-transparent rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 md:w-24 md:h-24 bg-gradient-to-tr from-blue-200/20 to-transparent rounded-tr-full"></div>
        
        <div className="relative p-3 md:p-6">
          <div className="flex items-start space-x-3 md:space-x-4">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white text-sm md:text-lg">💡</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 mb-2 md:mb-3 text-base md:text-lg">프로필 가이드</h3>
              <div className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-700">
                <p className="flex items-center">
                  <span className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-sky-400 to-sky-500 rounded-full mr-2 md:mr-3 shadow-sm flex-shrink-0"></span>
                  각 가족 구성원의 탭을 클릭하여 프로필을 확인해보세요
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full mr-2 md:mr-3 shadow-sm flex-shrink-0"></span>
                  모든 가족 구성원의 프로필을 편집할 수 있어요
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full mr-2 md:mr-3 shadow-sm flex-shrink-0"></span>
                  모든 질문에 답변하여 가족이 서로를 더 잘 알 수 있도록 해보세요! ✨
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}