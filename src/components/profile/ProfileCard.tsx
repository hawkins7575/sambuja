'use client';

import { useState, useEffect } from 'react';
import { Edit, Save, X, ExternalLink } from 'lucide-react';
import { User } from '@/types';
import { getRoleName, getRoleColor } from '@/lib/utils';
import { ProfileQuestion, ProfileAnswer, findAnswerByQuestionId, getDefaultAnswers } from '@/lib/profileTemplate';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';

// 프로필 카테고리 정의
interface ProfileCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  questions: string[];
}

const profileCategories: ProfileCategory[] = [
  {
    id: 'basic',
    title: '기본 정보',
    icon: '👤',
    description: '기본적인 개인 정보',
    color: 'from-slate-300 to-slate-400',
    questions: ['birthdate', 'nickname', 'blood_type', 'education']
  },
  {
    id: 'preferences',
    title: '취향',
    icon: '❤️',
    description: '좋아하는 것들과 선호사항',
    color: 'from-rose-200 to-pink-300',
    questions: ['favorite_food', 'favorite_music', 'favorite_movie', 'favorite_color', 'favorite_season', 'favorite_place', 'hate_food']
  },
  {
    id: 'personality',
    title: '성격 & 특성',
    icon: '⭐',
    description: '성격과 개인적 특성',
    color: 'from-amber-200 to-yellow-300',
    questions: ['personality', 'special_skill', 'hobby']
  },
  {
    id: 'goals',
    title: '목표 & 꿈',
    icon: '🎯',
    description: '미래의 계획과 목표',
    color: 'from-emerald-200 to-green-300',
    questions: ['dream', 'favorite_subject', 'bucket_list']
  },
  {
    id: 'contact',
    title: '연락처 & SNS',
    icon: '📱',
    description: '연락 수단과 소셜 미디어',
    color: 'from-purple-200 to-violet-300',
    questions: ['email', 'sns']
  },
  {
    id: 'relationships',
    title: '인간관계',
    icon: '👥',
    description: '친구와 인간관계',
    color: 'from-cyan-200 to-sky-300',
    questions: ['best_friend']
  }
];

interface ProfileCardProps {
  user: User;
  questions: ProfileQuestion[];
  isOwner: boolean;
}

export default function ProfileCard({ 
  user, 
  questions, 
  isOwner 
}: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [answers, setAnswers] = useState<ProfileAnswer[]>(getDefaultAnswers());
  const [editingAnswers, setEditingAnswers] = useState<ProfileAnswer[]>(getDefaultAnswers());
  
  // SNS 입력 상태
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [accountInput, setAccountInput] = useState('');
  
  // 학력 입력 상태
  const [selectedLevel, setSelectedLevel] = useState('');
  const [schoolInput, setSchoolInput] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // 친구 정보 입력 상태
  const [friendName, setFriendName] = useState('');
  const [friendPhone, setFriendPhone] = useState('');

  const handleSave = async () => {
    try {
      const userDocRef = doc(db, 'users', user.id);
      await updateDoc(userDocRef, {
        profileAnswers: editingAnswers
      });
      setAnswers(editingAnswers);
      setIsEditing(false);
    } catch (error) {
      console.error('프로필 저장 실패:', error);
      alert('프로필 저장에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    setEditingAnswers(answers);
    setIsEditing(false);
  };

  useEffect(() => {
    if (user.profileAnswers) {
      setAnswers(user.profileAnswers);
      setEditingAnswers(user.profileAnswers);
    }
  }, [user.profileAnswers]);

  const updateAnswer = (questionId: string, value: string | string[]) => {
    setEditingAnswers(prev => 
      prev.map(answer => 
        answer.questionId === questionId 
          ? { ...answer, answer: value }
          : answer
      )
    );
  };

  const addTag = (questionId: string, tag: string) => {
    const currentAnswer = findAnswerByQuestionId(editingAnswers, questionId);
    const currentTags = Array.isArray(currentAnswer?.answer) ? currentAnswer.answer : [];
    
    if (tag.trim() && !currentTags.includes(tag.trim())) {
      updateAnswer(questionId, [...currentTags, tag.trim()]);
    }
  };

  const addEducationEntry = (level: string, school: string, status: string) => {
    if (level && school && status) {
      const entry = `${school} ${status}`;
      const currentAnswer = findAnswerByQuestionId(editingAnswers, 'education');
      const currentValue = typeof currentAnswer?.answer === 'string' ? currentAnswer.answer : '';
      const newValue = currentValue ? `${currentValue}\n${entry}` : entry;
      updateAnswer('education', newValue);
    }
  };

  const addSNSEntry = (platform: string, account: string) => {
    if (platform && account) {
      const entry = `${platform}:${account}`;
      addTag('sns', entry);
    }
  };

  const addFriendEntry = (name: string, phone: string) => {
    if (name.trim()) {
      const entry = phone.trim() ? `${name.trim()} (${phone.trim()})` : name.trim();
      const currentAnswer = findAnswerByQuestionId(editingAnswers, 'best_friend');
      const currentValue = typeof currentAnswer?.answer === 'string' ? currentAnswer.answer : '';
      const newValue = currentValue ? `${currentValue}\n${entry}` : entry;
      updateAnswer('best_friend', newValue);
    }
  };

  const getSNSUrl = (platform: string, account: string) => {
    const cleanAccount = account.replace('@', '');
    switch (platform.toLowerCase()) {
      case '페이스북':
        return `https://facebook.com/${cleanAccount}`;
      case '인스타그램':
        return `https://instagram.com/${cleanAccount}`;
      case '유튜브':
        return `https://youtube.com/@${cleanAccount}`;
      case '틱톡':
        return `https://tiktok.com/@${cleanAccount}`;
      case '트위터':
        return `https://twitter.com/${cleanAccount}`;
      case '카카오스토리':
        return `https://story.kakao.com/${cleanAccount}`;
      case '네이버 블로그':
        return `https://blog.naver.com/${cleanAccount}`;
      default:
        return '#';
    }
  };

  const getSNSIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case '페이스북':
        return { icon: '📘', color: 'from-blue-600 to-blue-700', name: 'Facebook' };
      case '인스타그램':
        return { icon: '📷', color: 'from-pink-500 to-purple-600', name: 'Instagram' };
      case '유튜브':
        return { icon: '🎥', color: 'from-red-600 to-red-700', name: 'YouTube' };
      case '틱톡':
        return { icon: '🎵', color: 'from-black to-gray-800', name: 'TikTok' };
      case '트위터':
        return { icon: '🐦', color: 'from-sky-400 to-sky-500', name: 'Twitter' };
      case '카카오스토리':
        return { icon: '💬', color: 'from-yellow-400 to-yellow-500', name: 'KakaoStory' };
      case '네이버 블로그':
        return { icon: '📝', color: 'from-green-500 to-green-600', name: 'Naver Blog' };
      default:
        return { icon: '🌐', color: 'from-gray-500 to-gray-600', name: 'Other' };
    }
  };

  const removeTag = (questionId: string, tagToRemove: string) => {
    const currentAnswer = findAnswerByQuestionId(editingAnswers, questionId);
    const currentTags = Array.isArray(currentAnswer?.answer) ? currentAnswer.answer : [];
    
    updateAnswer(questionId, currentTags.filter(tag => tag !== tagToRemove));
  };

  const renderQuestionInput = (question: ProfileQuestion) => {
    const currentAnswer = findAnswerByQuestionId(
      isEditing ? editingAnswers : answers, 
      question.id
    );

    if (!isEditing) {
      // 읽기 모드
      const answerValue = currentAnswer?.answer;
      
      if (!answerValue || (Array.isArray(answerValue) && answerValue.length === 0)) {
        return <span className="text-gray-400 italic text-base md:text-sm">미입력</span>;
      }

      if (question.type === 'tags' && Array.isArray(answerValue)) {
        // SNS 항목인 경우 로고 형태로 표시
        if (question.id === 'sns') {
          return (
            <div className="flex flex-wrap gap-3">
              {answerValue.map((tag, index) => {
                const [platform, account] = tag.split(':');
                if (platform && account) {
                  const snsInfo = getSNSIcon(platform);
                  return (
                    <a
                      key={index}
                      href={getSNSUrl(platform, account)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group relative flex flex-col items-center justify-center min-w-[80px] h-20 bg-gradient-to-r ${snsInfo.color} rounded-2xl hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 hover:scale-105 text-white`}
                      title={`${snsInfo.name}: ${account}`}
                    >
                      <span className="text-2xl mb-1 filter drop-shadow-sm">
                        {snsInfo.icon}
                      </span>
                      <span className="text-xs font-medium px-2 text-center leading-tight">
                        {snsInfo.name}
                      </span>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <ExternalLink className="w-3 h-3 text-gray-600" />
                      </div>
                    </a>
                  );
                }
                return null;
              })}
            </div>
          );
        }
        
        // 기본 태그 표시
        return (
          <div className="flex flex-wrap gap-2">
            {answerValue.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 rounded-full text-sm font-medium border border-blue-200 shadow-sm"
              >
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                {tag}
              </span>
            ))}
          </div>
        );
      }

      if (question.type === 'date' && typeof answerValue === 'string') {
        return new Date(answerValue).toLocaleDateString('ko-KR');
      }

      if (question.type === 'textarea' && typeof answerValue === 'string') {
        return <p className="whitespace-pre-wrap">{answerValue}</p>;
      }

      return <span>{answerValue}</span>;
    }

    // 편집 모드
    const answerValue = currentAnswer?.answer || '';

    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={typeof answerValue === 'string' ? answerValue : ''}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            placeholder={question.placeholder}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all duration-200 bg-white hover:border-gray-300"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={typeof answerValue === 'string' ? answerValue : ''}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all duration-200 bg-white hover:border-gray-300"
          />
        );

      case 'textarea':
        // 학력 항목인 경우 특별한 입력 폼 제공
        if (question.id === 'education') {
          const educationLevels = ['유치원', '초등학교', '중학교', '고등학교', '대학교', '대학원', '기타'];
          const statusOptions = ['재학중', '졸업', '휴학', '중퇴'];
          
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded focus:border-blue-500 outline-none text-sm"
                >
                  <option value="">학력 선택</option>
                  {educationLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  value={schoolInput}
                  onChange={(e) => setSchoolInput(e.target.value)}
                  placeholder="학교명 입력"
                  className="px-3 py-2 border border-gray-200 rounded focus:border-blue-500 outline-none text-sm"
                />
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded focus:border-blue-500 outline-none text-sm"
                >
                  <option value="">상태 선택</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                
                <button
                  onClick={() => {
                    addEducationEntry(selectedLevel, schoolInput, selectedStatus);
                    setSelectedLevel('');
                    setSchoolInput('');
                    setSelectedStatus('');
                  }}
                  disabled={!selectedLevel || !schoolInput || !selectedStatus}
                  className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  추가
                </button>
              </div>
              
              <textarea
                value={typeof answerValue === 'string' ? answerValue : ''}
                onChange={(e) => updateAnswer(question.id, e.target.value)}
                placeholder={question.placeholder}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:border-blue-500 outline-none resize-none text-sm"
              />
            </div>
          );
        }

        // 친구 항목인 경우 특별한 입력 폼 제공
        if (question.id === 'best_friend') {
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  placeholder="친구 이름"
                  className="px-3 py-2 border border-gray-200 rounded focus:border-blue-500 outline-none text-sm"
                />
                
                <input
                  type="tel"
                  value={friendPhone}
                  onChange={(e) => setFriendPhone(e.target.value)}
                  placeholder="전화번호 (선택사항)"
                  className="px-3 py-2 border border-gray-200 rounded focus:border-blue-500 outline-none text-sm"
                />
              </div>
              
              <button
                onClick={() => {
                  addFriendEntry(friendName, friendPhone);
                  setFriendName('');
                  setFriendPhone('');
                }}
                disabled={!friendName.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm w-full md:w-auto"
              >
                친구 추가
              </button>
              
              <textarea
                value={typeof answerValue === 'string' ? answerValue : ''}
                onChange={(e) => updateAnswer(question.id, e.target.value)}
                placeholder="또는 직접 입력하세요..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:border-blue-500 outline-none resize-none text-sm"
              />
            </div>
          );
        }
        
        // 기본 텍스트 영역
        return (
          <textarea
            value={typeof answerValue === 'string' ? answerValue : ''}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded focus:border-blue-500 outline-none resize-none text-sm"
          />
        );

      case 'select':
        return (
          <select
            value={typeof answerValue === 'string' ? answerValue : ''}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all duration-200 bg-white hover:border-gray-300"
          >
            <option value="">선택해주세요</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'tags':
        const tags = Array.isArray(answerValue) ? answerValue : [];
        
        // SNS 항목인 경우 특별한 입력 폼 제공
        if (question.id === 'sns') {
          const snsOptions = ['페이스북', '인스타그램', '유튜브', '틱톡', '트위터', '카카오스토리', '네이버 블로그', '기타'];
          
          return (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {tags.map((tag, index) => {
                  const [platform, account] = tag.split(':');
                  if (platform && account) {
                    const snsInfo = getSNSIcon(platform);
                    return (
                      <div key={index} className="group relative">
                        <div className={`flex flex-col items-center justify-center min-w-[80px] h-20 bg-gradient-to-r ${snsInfo.color} rounded-2xl shadow-lg text-white`}>
                          <span className="text-2xl mb-1 filter drop-shadow-sm">
                            {snsInfo.icon}
                          </span>
                          <span className="text-xs font-medium px-2 text-center leading-tight">
                            {snsInfo.name}
                          </span>
                        </div>
                        <button
                          onClick={() => removeTag(question.id, tag)}
                          className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                          title="삭제"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                          {account}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded focus:border-blue-500 outline-none text-sm"
                >
                  <option value="">SNS 선택</option>
                  {snsOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  value={accountInput}
                  onChange={(e) => setAccountInput(e.target.value)}
                  placeholder="계정 ID 입력"
                  className="px-3 py-2 border border-gray-200 rounded focus:border-blue-500 outline-none text-sm"
                />
                
                <button
                  onClick={() => {
                    addSNSEntry(selectedPlatform, accountInput);
                    setSelectedPlatform('');
                    setAccountInput('');
                  }}
                  disabled={!selectedPlatform || !accountInput}
                  className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  추가
                </button>
              </div>
            </div>
          );
        }
        
        // 기본 태그 입력 폼
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-sky-100 to-blue-50 text-sky-700 rounded-full text-sm font-medium border border-sky-200 shadow-sm"
                >
                  <div className="w-1.5 h-1.5 bg-sky-400 rounded-full mr-2"></div>
                  {tag}
                  <button
                    onClick={() => removeTag(question.id, tag)}
                    className="ml-2 w-5 h-5 flex items-center justify-center text-sky-600 hover:text-sky-800 hover:bg-sky-200 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder={question.placeholder}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(question.id, e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
              className="w-full px-4 py-4 md:py-3 text-base md:text-sm border border-gray-200 rounded-xl focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 outline-none transition-all duration-200 bg-white hover:border-gray-300"
            />
            <p className="text-sm md:text-xs text-gray-500">Enter를 눌러서 태그를 추가하세요</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
      {/* 헤더 영역 - 연한 하늘색 그라데이션 배경 */}
      <div className="relative bg-gradient-to-br from-sky-200 via-sky-100 to-blue-200 px-5 py-6 md:px-8 md:py-6">
        <div className="absolute inset-0 bg-white/10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="relative">
              <div className="w-24 h-24 md:w-20 md:h-20 rounded-2xl overflow-hidden shadow-xl border-4 border-white/30 backdrop-blur-sm">
                <Image 
                  src={`/${user.role === 'dad' ? 'dad' : user.role === 'eldest' ? 'eldest' : 'youngest'}-avatar.png`} 
                  alt={user.name} 
                  width={96} 
                  height={96} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-md">
                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1"></div>
              </div>
            </div>
            
            <div className="text-gray-800">
              <h2 className="text-xl md:text-2xl font-bold mb-1 text-gray-800">{user.name}</h2>
              <div className="flex items-center space-x-2 md:space-x-3">
                <span className="inline-flex items-center px-3 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-xs font-medium bg-white/40 backdrop-blur-sm text-gray-700 shadow-sm">
                  {getRoleName(user.role)}
                </span>
                {findAnswerByQuestionId(answers, 'birthdate')?.answer && (
                  <span className="text-sm md:text-sm text-gray-700 opacity-90">
                    {new Date().getFullYear() - new Date(findAnswerByQuestionId(answers, 'birthdate')?.answer as string).getFullYear()}세
                  </span>
                )}
              </div>
            </div>
          </div>

          {isOwner && (
            <div className="flex-shrink-0">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1 md:space-x-2 px-3 py-2 md:px-4 md:py-2 bg-white/50 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white/70 transition-all duration-200 border border-white/40 shadow-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span className="font-medium text-sm">편집</span>
                </button>
              ) : (
                <div className="flex space-x-1 md:space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-1 px-3 py-2 md:px-4 md:py-2 bg-emerald-400/90 backdrop-blur-sm text-white rounded-lg hover:bg-emerald-500 transition-all duration-200 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span className="font-medium text-sm">저장</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-1 px-3 py-2 md:px-4 md:py-2 bg-gray-400/90 backdrop-blur-sm text-white rounded-lg hover:bg-gray-500 transition-all duration-200 shadow-sm"
                  >
                    <X className="w-4 h-4" />
                    <span className="font-medium text-sm">취소</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 컨텐츠 영역 - 카테고리별 구성 */}
      <div className="px-0 py-2 md:p-6 lg:p-8 space-y-3 md:space-y-8">
        {profileCategories.map((category, index) => {
          const categoryQuestions = questions.filter(q => category.questions.includes(q.id));
          
          return (
            <div key={category.id} className="md:bg-white md:rounded-3xl md:shadow-lg md:border md:border-gray-100 md:overflow-hidden">
              {/* 카테고리 헤더 */}
              <div className={`relative ${index > 0 ? 'border-t border-gray-200 pt-3' : ''} md:border-t-0 md:pt-0 md:bg-gradient-to-r md:${category.color} px-0 py-2 md:px-6 md:py-4`}>
                <div className="absolute inset-0 bg-white/10 hidden md:block"></div>
                <div className="relative flex items-center space-x-2 md:space-x-4">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r md:bg-white/20 md:backdrop-blur-sm rounded-lg md:rounded-xl flex items-center justify-center shadow-sm md:shadow-lg" style={{background: `linear-gradient(to right, ${category.color.replace('from-', '').replace(' to-', ', ').replace('-200', '').replace('-300', '')})`}}>
                    <span className="text-sm md:text-2xl text-white md:text-white">{category.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-sm md:text-xl font-bold text-gray-800 md:text-white mb-0">{category.title}</h3>
                    <p className="text-xs md:text-sm text-gray-600 md:text-white/80 hidden md:block">{category.description}</p>
                  </div>
                </div>
              </div>

              {/* 카테고리 내 질문들 */}
              <div className="px-0 py-2 md:p-6">
                <div className="space-y-3 md:grid md:grid-cols-1 md:gap-6 lg:grid-cols-2">
                  {categoryQuestions.map((question) => (
                    <div 
                      key={question.id} 
                      className="bg-gray-50 md:bg-gradient-to-br md:from-gray-50 md:to-white rounded-lg md:rounded-2xl border border-gray-200 md:hover:border-gray-300 md:hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                      {/* 질문 제목 */}
                      <div className="bg-gray-100 md:bg-gray-100/50 px-3 py-2 md:px-4 md:py-3 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium md:font-semibold text-gray-800 text-xs md:text-sm">{question.question}</h4>
                          {question.required && <span className="text-red-500 text-xs">*</span>}
                        </div>
                      </div>
                      
                      {/* 답변 내용 */}
                      <div className="p-2 md:p-4">
                        {renderQuestionInput(question)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* 프로필 완성도 카드 - 모바일에서는 구분선으로 단순화 */}
      <div className="border-t border-gray-200 pt-3 mt-3 md:p-6 lg:p-8">
        <div className="md:bg-gradient-to-br md:from-sky-50 md:via-blue-50 md:to-indigo-50 md:rounded-3xl p-0 md:p-8 md:border md:border-sky-100 md:shadow-sm">
          <div className="text-center md:text-center">
            <div className="w-8 h-8 md:w-14 md:h-14 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg md:rounded-xl mx-auto mb-2 md:mb-6 flex items-center justify-center shadow-sm md:shadow-lg">
              <span className="text-white text-sm md:text-2xl">✨</span>
            </div>
            <h3 className="font-semibold md:font-bold text-gray-800 mb-2 md:mb-3 text-sm md:text-lg">프로필 완성도</h3>
            <p className="text-gray-600 text-xs md:text-base mb-3 md:mb-6 leading-relaxed px-0 md:px-0 hidden md:block">
              카테고리별로 정보를 입력해서 완성도를 높여보세요!
            </p>
            
            {/* 카테고리별 완성도 */}
            <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-6">
              {profileCategories.map((category) => {
                const categoryQuestions = questions.filter(q => category.questions.includes(q.id));
                const completedCount = categoryQuestions.filter(q => {
                  const answer = findAnswerByQuestionId(answers, q.id);
                  return answer && answer.answer && (
                    typeof answer.answer === 'string' ? answer.answer.trim() : answer.answer.length > 0
                  );
                }).length;
                const completionRate = categoryQuestions.length > 0 ? (completedCount / categoryQuestions.length) * 100 : 0;
                
                return (
                  <div key={category.id} className="bg-gray-50 md:bg-white rounded-lg md:rounded-2xl p-2 md:p-4 border border-gray-200 md:shadow-sm">
                    <div className="flex items-center space-x-1 md:space-x-3 mb-1 md:mb-3">
                      <span className="text-xs md:text-xl">{category.icon}</span>
                      <div className="flex-1 text-left">
                        <h4 className="font-medium md:font-semibold text-gray-800 text-xs md:text-sm truncate">{category.title}</h4>
                        <p className="text-xs text-gray-500">{completedCount}/{categoryQuestions.length}</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 md:h-2">
                      <div 
                        className={`bg-gradient-to-r ${category.color} h-1 md:h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 전체 완성도 */}
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-sky-400 to-blue-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ 
                  width: `${Math.round((questions.filter(q => {
                    const answer = findAnswerByQuestionId(answers, q.id);
                    return answer && answer.answer && (
                      typeof answer.answer === 'string' ? answer.answer.trim() : answer.answer.length > 0
                    );
                  }).length / questions.length) * 100)}%` 
                }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-3">
              전체 완성도: {questions.filter(q => {
                const answer = findAnswerByQuestionId(answers, q.id);
                return answer && answer.answer && (
                  typeof answer.answer === 'string' ? answer.answer.trim() : answer.answer.length > 0
                );
              }).length} / {questions.length} ({Math.round((questions.filter(q => {
                const answer = findAnswerByQuestionId(answers, q.id);
                return answer && answer.answer && (
                  typeof answer.answer === 'string' ? answer.answer.trim() : answer.answer.length > 0
                );
              }).length / questions.length) * 100)}%)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}