'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { profileQuestions, getDefaultAnswers, ProfileAnswer } from '@/lib/profileTemplate';
import ProfileCard from '@/components/profile/ProfileCard';
import Avatar from '@/components/shared/Avatar';


export default function ProfilePage() {
  const { user, users } = useAuthStore();
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [profileAnswers, setProfileAnswers] = useState<{ [userId: string]: ProfileAnswer[] }>({});

  useEffect(() => {
    if (user) {
      setSelectedMember(user.id);
    }

    // 모든 가족 구성원의 기본 프로필 데이터 로드
    const allAnswers: { [userId: string]: ProfileAnswer[] } = {};
    users.forEach(member => {
      allAnswers[member.id] = getDefaultAnswers();
    });
    setProfileAnswers(allAnswers);
  }, [user, users]);

  const handleUpdateAnswers = (userId: string, answers: ProfileAnswer[]) => {
    // 로컬 상태만 업데이트 (실제 서버 저장은 추후 구현)
    setProfileAnswers(prev => ({
      ...prev,
      [userId]: answers,
    }));
  };

  const selectedMemberData = users.find(member => member.id === selectedMember);
  const selectedMemberAnswers = profileAnswers[selectedMember] || getDefaultAnswers();

  if (!user) return <div>로딩 중...</div>;

  return (
    <div className="space-y-6">

      {/* 가족 구성원 선택 탭 */}
      <div className="family-card p-2">
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
          {users.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member.id)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                selectedMember === member.id
                  ? 'bg-white text-blue-600 shadow-sm transform scale-[1.02]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <div className={`transition-all duration-200 ${
                  selectedMember === member.id 
                    ? 'scale-110 ring-2 ring-blue-500 ring-offset-1 rounded-full' 
                    : 'opacity-70 hover:opacity-90'
                }`}>
                  <Avatar user={member} size="sm" />
                </div>
                <span>{member.name}</span>
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
          answers={selectedMemberAnswers}
          onUpdateAnswers={(answers) => handleUpdateAnswers(selectedMember, answers)}
          isOwner={true}
        />
      )}

      {/* 설명 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-100">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200/30 to-transparent rounded-tr-full"></div>
        
        <div className="relative p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white text-lg">💡</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">프로필 작성 가이드</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  각 가족 구성원의 탭을 클릭하여 프로필을 확인할 수 있어요
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  모든 가족 구성원의 프로필을 편집할 수 있어요
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                  모든 질문에 답변하여 가족이 서로를 더 잘 알 수 있도록 해보세요!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}