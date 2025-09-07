'use client';

import { useState, useEffect } from 'react';
import { Edit, Save, X, ExternalLink } from 'lucide-react';
import { User } from '@/types';
import { getRoleName, getRoleColor } from '@/lib/utils';
import { ProfileQuestion, ProfileAnswer, findAnswerByQuestionId, getDefaultAnswers } from '@/lib/profileTemplate';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/ui/Toast';
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
    questions: ['email', 'phone', 'sns']
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
  const [isSaving, setIsSaving] = useState(false);
  const [answers, setAnswers] = useState<ProfileAnswer[]>([]);
  const [editingAnswers, setEditingAnswers] = useState<ProfileAnswer[]>([]);
  const { success, error } = useToast();
  
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
    if (isSaving) return;
    
    console.log('💾 Save button clicked');
    console.log('💾 Editing answers to save:', editingAnswers);
    console.log('💾 Number of answers:', editingAnswers.length);
    
    // 빈 답변 제거하고 유효한 답변만 저장
    const validAnswers = editingAnswers.filter(answer => {
      if (typeof answer.answer === 'string') {
        return answer.answer.trim() !== '';
      } else if (Array.isArray(answer.answer)) {
        return answer.answer.length > 0;
      }
      return false;
    });
    
    console.log('💾 Valid answers to save:', validAnswers);
    
    setIsSaving(true);
    try {
      const userDocRef = doc(db, 'users', user.id);
      console.log('💾 Updating user document:', user.id);
      
      await updateDoc(userDocRef, {
        profileAnswers: validAnswers,
        updated_at: new Date().toISOString()
      });
      
      console.log('✅ Save successful!');
      setAnswers(editingAnswers);
      setIsEditing(false);
      success('프로필 저장 완료', '변경사항이 성공적으로 저장되었습니다.');
    } catch (err) {
      console.error('❌ 프로필 저장 실패:', err);
      error('저장 실패', '프로필 저장 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    console.log('❌ Cancel button clicked');
    console.log('❌ Reverting to original answers:', answers);
    setEditingAnswers([...answers]);
    setIsEditing(false);
  };

  const handleEdit = () => {
    console.log('✏️ Edit button clicked');
    console.log('✏️ Current answers:', answers);
    setEditingAnswers([...answers]);
    setIsEditing(true);
  };

  // 사용자가 변경될 때마다 프로필 답변 초기화
  useEffect(() => {
    console.log('🔄 ProfileCard initialization for user:', user.id);
    
    // 기본 답변 생성
    const defaultAnswers = getDefaultAnswers();
    console.log('📝 Default answers created:', defaultAnswers.length, 'questions');
    
    // 사용자 기존 답변이 있으면 병합, 없으면 기본값 사용
    let initialAnswers: ProfileAnswer[];
    
    if (user.profileAnswers && user.profileAnswers.length > 0) {
      console.log('👤 Found existing profile answers:', user.profileAnswers.length);
      initialAnswers = defaultAnswers.map(defaultAnswer => {
        const existingAnswer = user.profileAnswers?.find(answer => answer.questionId === defaultAnswer.questionId);
        return existingAnswer || defaultAnswer;
      });
    } else {
      console.log('🆕 No existing answers, using defaults');
      initialAnswers = defaultAnswers;
    }
    
    console.log('✅ Setting initial answers:', initialAnswers);
    setAnswers(initialAnswers);
    setEditingAnswers(initialAnswers);
  }, [user.id, user.profileAnswers]);

  const updateAnswer = (questionId: string, value: string | string[]) => {
    console.log('🔄 updateAnswer called:', { questionId, value, type: typeof value });
    
    setEditingAnswers(prev => {
      console.log('📋 Current editing answers:', prev);
      
      // 해당 질문 ID를 찾아서 업데이트
      const answerIndex = prev.findIndex(answer => answer.questionId === questionId);
      
      if (answerIndex >= 0) {
        console.log('✏️ Updating existing answer at index:', answerIndex);
        const updated = [...prev];
        updated[answerIndex] = { ...updated[answerIndex], answer: value };
        console.log('✅ Updated answer:', updated[answerIndex]);
        console.log('📊 All updated answers:', updated);
        return updated;
      } else {
        console.log('➕ Adding new answer for:', questionId);
        const newAnswer = { questionId, answer: value };
        const updated = [...prev, newAnswer];
        console.log('📊 All updated answers:', updated);
        return updated;
      }
    });
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
      // 학교명에서 중복되는 학교급 제거
      let cleanedSchoolName = school.trim();
      
      // 학교명에 이미 학교급이 포함되어 있으면 제거
      const schoolTypes = ['유치원', '초등학교', '중학교', '고등학교', '대학교', '대학원'];
      schoolTypes.forEach(type => {
        if (cleanedSchoolName.endsWith(type)) {
          cleanedSchoolName = cleanedSchoolName.replace(type, '').trim();
        }
      });
      
      // 학교명 + 학교급 + 상태 형식으로 생성
      const entry = `${cleanedSchoolName} ${level} ${status}`;
      console.log('🎓 Adding education entry:', {
        original: school,
        cleaned: cleanedSchoolName,
        level,
        status,
        final: entry
      });
      
      const currentAnswer = findAnswerByQuestionId(editingAnswers, 'education');
      const currentValue = typeof currentAnswer?.answer === 'string' ? currentAnswer.answer : '';
      const newValue = currentValue ? `${currentValue}\n${entry}` : entry;
      
      console.log('🎓 Updated education value:', newValue);
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
    // If account already looks like a URL, return it as-is
    if (account.startsWith('http://') || account.startsWith('https://')) {
      return account;
    }
    
    const cleanAccount = account.replace('@', '');
    const platformLower = platform.toLowerCase();
    
    switch (platformLower) {
      case '페이스북':
      case 'facebook':
        return `https://www.facebook.com/${cleanAccount}`;
      case '인스타그램':
      case 'instagram':
        return `https://www.instagram.com/${cleanAccount}`;
      case '유튜브':
      case 'youtube':
        return `https://www.youtube.com/@${cleanAccount}`;
      case '틱톡':
      case 'tiktok':
        return `https://www.tiktok.com/@${cleanAccount}`;
      case '트위터':
      case 'twitter':
      case 'x':
        return `https://www.twitter.com/${cleanAccount}`;
      case '카카오스토리':
      case 'kakaostory':
        return `https://story.kakao.com/${cleanAccount}`;
      case '네이버 블로그':
      case 'naver':
        return `https://blog.naver.com/${cleanAccount}`;
      case '링크드인':
      case 'linkedin':
        return `https://www.linkedin.com/in/${cleanAccount}`;
      case '깃허브':
      case 'github':
        return `https://github.com/${cleanAccount}`;
      default:
        // If it's not a recognized platform, treat the account as a direct URL
        if (cleanAccount.includes('.')) {
          return cleanAccount.startsWith('www.') ? `https://${cleanAccount}` : cleanAccount;
        }
        return '#';
    }
  };

  const getSNSIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    
    switch (platformLower) {
      case '페이스북':
      case 'facebook':
        return { 
          icon: 'F', 
          color: 'from-[#1877F2] to-[#1877F2]', 
          name: 'Facebook',
          textColor: 'text-white',
          bgColor: 'bg-[#1877F2]'
        };
      case '인스타그램':
      case 'instagram':
        return { 
          icon: '📷', 
          color: 'from-[#E4405F] via-[#F56040] to-[#FFDC80]', 
          name: 'Instagram',
          textColor: 'text-white',
          bgColor: 'bg-gradient-to-br from-[#E4405F] to-[#F56040]'
        };
      case '유튜브':
      case 'youtube':
        return { 
          icon: '▶', 
          color: 'from-[#FF0000] to-[#CC0000]', 
          name: 'YouTube',
          textColor: 'text-white',
          bgColor: 'bg-[#FF0000]'
        };
      case '틱톡':
      case 'tiktok':
        return { 
          icon: '♪', 
          color: 'from-[#000000] to-[#FF0050]', 
          name: 'TikTok',
          textColor: 'text-white',
          bgColor: 'bg-black'
        };
      case '트위터':
      case 'twitter':
      case 'x':
        return { 
          icon: 'X', 
          color: 'from-[#1DA1F2] to-[#0d8bd9]', 
          name: 'X (Twitter)',
          textColor: 'text-white',
          bgColor: 'bg-black'
        };
      case '카카오스토리':
      case 'kakaostory':
        return { 
          icon: 'K', 
          color: 'from-[#FEE500] to-[#FFCD00]', 
          name: 'KakaoStory',
          textColor: 'text-black',
          bgColor: 'bg-[#FEE500]'
        };
      case '네이버 블로그':
      case 'naver':
        return { 
          icon: 'N', 
          color: 'from-[#03C75A] to-[#00B04F]', 
          name: 'Naver Blog',
          textColor: 'text-white',
          bgColor: 'bg-[#03C75A]'
        };
      case '링크드인':
      case 'linkedin':
        return { 
          icon: 'in', 
          color: 'from-[#0077B5] to-[#005885]', 
          name: 'LinkedIn',
          textColor: 'text-white',
          bgColor: 'bg-[#0077B5]'
        };
      case '깃허브':
      case 'github':
        return { 
          icon: '⚡', 
          color: 'from-[#333] to-[#000]', 
          name: 'GitHub',
          textColor: 'text-white',
          bgColor: 'bg-[#333]'
        };
      default:
        return { 
          icon: '🌐', 
          color: 'from-gray-500 to-gray-600', 
          name: 'Other',
          textColor: 'text-white',
          bgColor: 'bg-gray-500'
        };
    }
  };

  const removeTag = (questionId: string, tagToRemove: string) => {
    const currentAnswer = findAnswerByQuestionId(editingAnswers, questionId);
    const currentTags = Array.isArray(currentAnswer?.answer) ? currentAnswer.answer : [];
    
    updateAnswer(questionId, currentTags.filter(tag => tag !== tagToRemove));
  };

  const renderQuestionInput = (question: ProfileQuestion) => {
    const currentAnswers = isEditing ? editingAnswers : answers;
    const currentAnswer = findAnswerByQuestionId(currentAnswers, question.id);
    
    console.log(`🎨 Rendering ${question.id}:`, { 
      isEditing, 
      currentAnswer,
      answerValue: currentAnswer?.answer,
      hasAnswers: currentAnswers.length > 0
    });

    if (!isEditing) {
      // 읽기 모드
      const answerValue = currentAnswer?.answer;
      
      if (!answerValue || (Array.isArray(answerValue) && answerValue.length === 0)) {
        return <span className="text-gray-400 italic text-sm">미입력</span>;
      }

      if (question.type === 'tags' && Array.isArray(answerValue)) {
        // SNS 항목인 경우 로고와 주소를 함께 표시
        if (question.id === 'sns') {
          return (
            <div className="space-y-3">
              {answerValue.map((tag, index) => {
                const [platform, ...accountParts] = tag.split(':');
                const account = accountParts.join(':'); // Handle URLs with multiple colons
                if (platform && account) {
                  const snsInfo = getSNSIcon(platform);
                  const fullUrl = getSNSUrl(platform, account);
                  return (
                    <a
                      key={index}
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      {/* 로고 영역 */}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r ${snsInfo.color} shadow-sm flex-shrink-0`}>
                        <span className={`text-lg font-bold ${snsInfo.textColor}`}>
                          {snsInfo.icon}
                        </span>
                      </div>
                      
                      {/* 정보 영역 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {snsInfo.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            @{account}
                          </span>
                        </div>
                        <div className="text-xs text-blue-600 truncate mt-0.5 group-hover:text-blue-700">
                          {fullUrl}
                        </div>
                      </div>
                      
                      {/* 외부 링크 아이콘 */}
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <ExternalLink className="w-4 h-4 text-gray-400" />
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
                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 rounded-full text-xs font-normal border border-slate-200 shadow-sm"
              >
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></div>
                {tag}
              </span>
            ))}
          </div>
        );
      }

      if (question.type === 'date' && typeof answerValue === 'string') {
        return (
          <span className="text-sm text-gray-700 font-medium">
            {new Date(answerValue).toLocaleDateString('ko-KR')}
          </span>
        );
      }

      if (question.type === 'textarea' && typeof answerValue === 'string') {
        return (
          <p className="whitespace-pre-wrap text-xs text-slate-600 leading-relaxed">
            {answerValue}
          </p>
        );
      }

      // 전화번호인 경우 특별 처리
      if (question.id === 'phone' && typeof answerValue === 'string') {
        return (
          <a
            href={`tel:${answerValue.replace(/[^0-9]/g, '')}`}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-800 rounded-lg border border-green-200 hover:bg-green-100 transition-colors group"
          >
            <span className="text-green-600">📞</span>
            <span className="text-sm font-medium">{answerValue}</span>
            <span className="text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
              전화걸기
            </span>
          </a>
        );
      }

      return <span className="text-xs text-slate-600 leading-relaxed">{answerValue}</span>;
    }

    // 편집 모드
    const answerValue = currentAnswer?.answer || '';

    switch (question.type) {
      case 'text':
        // 전화번호인 경우 특별 처리
        if (question.id === 'phone') {
          const phoneValue = typeof answerValue === 'string' ? answerValue : '';
          console.log('📱 Phone field rendering with value:', phoneValue);
          
          return (
            <div className="relative">
              <input
                type="text"
                value={phoneValue}
                onChange={(e) => {
                  const newValue = e.target.value;
                  console.log('📱 Phone input changed:', newValue);
                  updateAnswer(question.id, newValue);
                }}
                onFocus={() => console.log('📱 Phone input focused')}
                onBlur={() => console.log('📱 Phone input blurred')}
                placeholder={question.placeholder || '예: 010-1234-5678'}
                className="w-full px-4 py-3 pl-12 border-2 border-green-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/20 outline-none transition-all duration-200 bg-white"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-600 text-lg">
                📱
              </div>
            </div>
          );
        }
        
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
                  placeholder="학교명 입력 (예: 서정리, 한양대학교)"
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
        const selectValue = typeof answerValue === 'string' ? answerValue : '';
        console.log(`🩸 Select field rendering (${question.id}) with value:`, selectValue);
        console.log('🩸 Available options:', question.options);
        
        return (
          <select
            value={selectValue}
            onChange={(e) => {
              const newValue = e.target.value;
              console.log(`🩸 Select changed (${question.id}):`, newValue);
              updateAnswer(question.id, newValue);
            }}
            onFocus={() => console.log(`🩸 Select focused (${question.id})`)}
            className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-200 bg-white"
          >
            <option value="">선택해주세요</option>
            {question.options?.map((option, index) => {
              console.log(`🩸 Rendering option ${index}:`, option);
              return (
                <option key={option} value={option}>
                  {option}
                </option>
              );
            })}
          </select>
        );

      case 'tags':
        const tags = Array.isArray(answerValue) ? answerValue : [];
        
        // SNS 항목인 경우 특별한 입력 폼 제공
        if (question.id === 'sns') {
          const snsOptions = ['페이스북', '인스타그램', '유튜브', '틱톡', '트위터', '카카오스토리', '네이버 블로그', '링크드인', '깃허브', '기타'];
          
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                {tags.map((tag, index) => {
                  const [platform, ...accountParts] = tag.split(':');
                  const account = accountParts.join(':'); // Handle URLs with multiple colons
                  if (platform && account) {
                    const snsInfo = getSNSIcon(platform);
                    const fullUrl = getSNSUrl(platform, account);
                    return (
                      <div key={index} className="group flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        {/* 로고 영역 */}
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r ${snsInfo.color} shadow-sm flex-shrink-0`}>
                          <span className={`text-sm font-bold ${snsInfo.textColor}`}>
                            {snsInfo.icon}
                          </span>
                        </div>
                        
                        {/* 정보 영역 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {snsInfo.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              @{account}
                            </span>
                          </div>
                          <div className="text-xs text-blue-600 truncate mt-0.5">
                            {fullUrl}
                          </div>
                        </div>
                        
                        {/* 삭제 버튼 */}
                        <button
                          onClick={() => removeTag(question.id, tag)}
                          className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                          title="삭제"
                        >
                          <X className="w-3 h-3" />
                        </button>
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
                  className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 rounded-full text-xs font-normal border border-slate-200 shadow-sm"
                >
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></div>
                  {tag}
                  <button
                    onClick={() => removeTag(question.id, tag)}
                    className="ml-2 w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
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
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 bg-white hover:border-gray-300"
            />
            <p className="text-sm md:text-xs text-gray-500">Enter를 눌러서 태그를 추가하세요</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* 헤더 영역 */}
      <div className="relative bg-gradient-to-br from-slate-50 to-gray-50 p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md ring-2 ring-white">
                <Image 
                  src={`/${user.role === 'dad' ? 'dad' : user.role === 'eldest' ? 'eldest' : 'youngest'}-avatar.png`} 
                  alt={user.name} 
                  width={64} 
                  height={64} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white shadow-sm">
                <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-1"></div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-1">{user.name}</h2>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
                  {getRoleName(user.role)}
                </span>
                {findAnswerByQuestionId(answers, 'birthdate')?.answer && (
                  <span className="text-sm text-slate-600 font-medium">
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
                  onClick={handleEdit}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  편집
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                    ) : (
                      <Save className="w-4 h-4 mr-1" />
                    )}
                    {isSaving ? '저장 중...' : '저장'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4 mr-1" />
                    취소
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 컨텐츠 영역 - 카테고리별 구성 */}
      <div className="p-6 space-y-8">
        {profileCategories.map((category) => {
          const categoryQuestions = questions.filter(q => category.questions.includes(q.id));
          
          return (
            <div key={category.id} className="">
              {/* 카테고리 헤더 */}
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-r ${category.color}`}>
                    <span className="text-gray-900 text-lg">{category.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-700">{category.title}</h3>
                    <p className="text-xs text-slate-500">{category.description}</p>
                  </div>
                </div>
              </div>

              {/* 카테고리 내 질문들 */}
              <div className="grid gap-4 md:grid-cols-2">
                {categoryQuestions.map((question) => (
                  <div key={question.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-shadow">
                    {/* 질문 제목 */}
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-slate-700 mb-1.5">
                        {question.question}
                        {question.required && <span className="text-rose-400 ml-1">*</span>}
                      </h4>
                    </div>
                    
                    {/* 답변 내용 */}
                    <div className="">
                      {renderQuestionInput(question)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {/* 프로필 완성도 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-t border-blue-100 p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">✨</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">프로필 완성도</h3>
          <p className="text-sm text-slate-600">카테고리별로 정보를 입력해서 완성도를 높여보세요</p>
        </div>
        
        {/* 전체 완성도 */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-700 font-medium mb-2">
            <span>전체 진행률</span>
            <span>{Math.round((questions.filter(q => {
              const answer = findAnswerByQuestionId(answers, q.id);
              return answer && answer.answer && (
                typeof answer.answer === 'string' ? answer.answer.trim() : answer.answer.length > 0
              );
            }).length / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-white rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full shadow-sm transition-all duration-500"
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
        </div>

        {/* 카테고리별 완성도 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
              <div key={category.id} className="bg-white rounded-xl p-3 shadow-sm border border-white">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm">{category.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-700 text-xs truncate">{category.title}</h4>
                    <p className="text-xs text-slate-500">{completedCount}/{categoryQuestions.length}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${category.color} h-2 rounded-full transition-all duration-500 shadow-sm`}
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}