'use client';

import { useState } from 'react';
import { Edit, Save, X, Camera, ExternalLink } from 'lucide-react';
import { User } from '@/types';
import { getRoleName, getRoleColor } from '@/lib/utils';
import { ProfileQuestion, ProfileAnswer, findAnswerByQuestionId } from '@/lib/profileTemplate';
import Image from 'next/image';

interface ProfileCardProps {
  user: User;
  questions: ProfileQuestion[];
  answers: ProfileAnswer[];
  onUpdateAnswers: (answers: ProfileAnswer[]) => void;
  isOwner: boolean;
}

export default function ProfileCard({ 
  user, 
  questions, 
  answers, 
  onUpdateAnswers, 
  isOwner 
}: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingAnswers, setEditingAnswers] = useState<ProfileAnswer[]>(answers);
  
  // SNS 입력 상태
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [accountInput, setAccountInput] = useState('');
  
  // 학력 입력 상태
  const [selectedLevel, setSelectedLevel] = useState('');
  const [schoolInput, setSchoolInput] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleSave = () => {
    onUpdateAnswers(editingAnswers);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditingAnswers(answers);
    setIsEditing(false);
  };

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
        return <span className="text-gray-400 italic">미입력</span>;
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 bg-white hover:border-gray-300"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={typeof answerValue === 'string' ? answerValue : ''}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 bg-white hover:border-gray-300"
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
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 bg-white hover:border-gray-300"
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
                  className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 rounded-full text-sm font-medium border border-blue-200 shadow-sm"
                >
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                  {tag}
                  <button
                    onClick={() => removeTag(question.id, tag)}
                    className="ml-2 w-5 h-5 flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full transition-colors"
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 bg-white hover:border-gray-300"
            />
            <p className="text-xs text-gray-500">Enter를 눌러서 태그를 추가하세요</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* 헤더 영역 - 그라데이션 배경 */}
      <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-8 py-6">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl border-4 border-white/30 backdrop-blur-sm">
                <Image 
                  src={`/${user.role === 'dad' ? 'dad' : user.role === 'eldest' ? 'eldest' : 'youngest'}-avatar.png`} 
                  alt={user.name} 
                  width={80} 
                  height={80} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-md">
                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1"></div>
              </div>
            </div>
            
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                  {getRoleName(user.role)}
                </span>
                {findAnswerByQuestionId(answers, 'birthdate')?.answer && (
                  <span className="text-sm opacity-90">
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
                  className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30"
                >
                  <Edit className="w-4 h-4" />
                  <span className="font-medium">편집</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500/90 backdrop-blur-sm text-white rounded-xl hover:bg-green-600 transition-all duration-200"
                  >
                    <Save className="w-4 h-4" />
                    <span className="font-medium">저장</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                    <span className="font-medium">취소</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* 질문/답변 목록 - 카드 격자 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {questions.map((question, index) => (
            <div 
              key={question.id} 
              className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group"
            >
              {/* 질문 헤더 */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-50 px-5 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{question.question}</h3>
                    {question.required && <span className="text-red-500 text-xs">*</span>}
                  </div>
                </div>
              </div>
              
              {/* 답변 내용 */}
              <div className="p-5">
                {renderQuestionInput(question)}
              </div>
            </div>
          ))}
        </div>
        
        {/* 추가 정보 카드 */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-blue-100">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-xl">✨</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">프로필 완성도</h3>
            <p className="text-gray-600 text-sm mb-4">
              더 많은 정보를 입력할수록 가족이 서로를 더 잘 알 수 있어요!
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
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
            <p className="text-xs text-gray-500 mt-2">
              {questions.filter(q => {
                const answer = findAnswerByQuestionId(answers, q.id);
                return answer && answer.answer && (
                  typeof answer.answer === 'string' ? answer.answer.trim() : answer.answer.length > 0
                );
              }).length} / {questions.length} 완료
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}