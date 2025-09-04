'use client';

import { useState, useEffect } from 'react';
import { Plus, Target, CheckCircle, Clock, User as UserIcon, Trophy, Star, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useAuthStore, useAppStore } from '@/lib/store';
import { getRoleName, getRoleColor, getRelativeTime } from '@/lib/utils';
import CommentSection from '@/components/shared/CommentSection';
import { Comment, Goal } from '@/types';

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

const mockComments: Comment[] = [
  {
    id: '1',
    content: '운동 하나도 꽃꽃히 하시네요! 응원합니다!',
    target_type: 'goal',
    target_id: '1',
    author_id: '2',
    author: {
      id: '2',
      name: '짱남',
      role: 'eldest',
      email: 'eldest@example.com',
      created_at: '2025-01-01',
    },
    created_at: '2025-09-01T10:00:00Z',
  },
];

const mockGoals: Goal[] = [
  {
    id: '1',
    title: '매일 30분 운동하기',
    description: '건강한 몸을 만들기 위해 매일 30분씩 운동하기로 했어요. 푸시업, 윗몸일으키기, 조깅 등을 번갈아가며!',
    target_date: '2025-12-31',
    completed: false,
    owner_id: '1',
    owner: {
      id: '1',
      name: '아빠',
      role: 'dad' as const,
      email: 'dad@example.com',
      created_at: '2025-01-01',
    },
    progress: 65,
    created_at: '2025-09-01T09:00:00Z',
  },
  {
    id: '2',
    title: '수학 성적 90점 이상 받기',
    description: '이번 학기 수학 시험에서 90점 이상을 받는 것이 목표예요. 매일 복습하고 모르는 것은 질문할게요!',
    target_date: '2025-11-30',
    completed: false,
    owner_id: '2',
    owner: {
      id: '2',
      name: '짱남',
      role: 'eldest' as const,
      email: 'eldest@example.com',
      created_at: '2025-01-01',
    },
    progress: 80,
    created_at: '2025-08-15T14:20:00Z',
  },
  {
    id: '3',
    title: '책 한 달에 2권 읽기',
    description: '독서 습관을 기르기 위해 한 달에 최소 2권씩 책을 읽기로 했어요. 다양한 장르에 도전해볼 거예요!',
    target_date: '2025-12-31',
    completed: false,
    owner_id: '3',
    owner: {
      id: '3',
      name: '막뚱이',
      role: 'youngest' as const,
      email: 'youngest@example.com',
      created_at: '2025-01-01',
    },
    progress: 45,
    created_at: '2025-09-01T16:30:00Z',
  },
  {
    id: '4',
    title: '피아노 곡 하나 완주하기',
    description: '좋아하는 피아노 곡을 처음부터 끝까지 완벽하게 연주할 수 있도록 연습하기!',
    target_date: '2025-10-15',
    completed: true,
    owner_id: '2',
    owner: {
      id: '2',
      name: '짱남',
      role: 'eldest' as const,
      email: 'eldest@example.com',
      created_at: '2025-01-01',
    },
    progress: 100,
    created_at: '2025-07-20T10:00:00Z',
  },
];

export default function GoalsPage() {
  const { user, users, loadUsers } = useAuthStore();
  const { goals, setGoals, loadAllData } = useAppStore();
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [showForm, setShowForm] = useState(false);
  const [filterBy, setFilterBy] = useState<'all' | 'my' | 'completed' | 'pending'>('all');
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target_date: '',
    owner_id: '',
  });
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  useEffect(() => {
    // 데이터 로드
    loadAllData();
    loadUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(null);
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  // Firebase에서 로드된 실제 사용자 데이터 사용
  const familyMembers = users;

  const filteredGoals = goals.filter(goal => {
    if (filterBy === 'my' && user) {
      return goal.owner_id === user.id;
    }
    if (filterBy === 'completed') {
      return goal.completed;
    }
    if (filterBy === 'pending') {
      return !goal.completed;
    }
    return true;
  });


  const handleSubmitGoal = () => {
    if (!user || !newGoal.title.trim() || !newGoal.owner_id) return;
    
    const selectedOwner = familyMembers.find(member => member.id === newGoal.owner_id) || user;
    
    const goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      target_date: newGoal.target_date,
      completed: false,
      owner_id: newGoal.owner_id,
      owner: selectedOwner,
      progress: 0,
      created_at: new Date().toISOString(),
    };
    
    setGoals([goal, ...goals]);
    setNewGoal({ title: '', description: '', target_date: '', owner_id: '' });
    setShowForm(false);
  };

  // const toggleGoalCompletion = (goalId: string) => {
  //   setGoals(prev => prev.map(goal => 
  //     goal.id === goalId 
  //       ? { 
  //           ...goal, 
  //           completed: !goal.completed,
  //           progress: !goal.completed ? 100 : goal.progress
  //         }
  //       : goal
  //   ));
  // };

  const updateProgress = async (goalId: string, progress: number) => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalId 
        ? { 
            ...goal, 
            progress: Math.max(0, Math.min(100, progress)),
            completed: progress >= 100
          }
        : goal
    );

    setGoals(updatedGoals);

    // 목표 달성 알림 (100%가 되었을 때)
    if (progress >= 100) {
      const achievedGoal = updatedGoals.find(goal => goal.id === goalId);
      if (achievedGoal) {
        const notificationService = NotificationService.getInstance();
        await notificationService.notifyGoalAchieved(
          achievedGoal.owner.name,
          achievedGoal.title
        );
      }
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDaysUntilTarget = (targetDate: string) => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleAddComment = (content: string, targetId: string) => {
    if (!user) return;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      content,
      target_type: 'goal',
      target_id: targetId,
      author_id: user.id,
      author: user,
      created_at: new Date().toISOString(),
    };
    
    setComments(prev => [...prev, newComment]);
  };

  const handleEditGoal = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    setNewGoal({
      title: goal.title,
      description: goal.description,
      target_date: goal.target_date,
      owner_id: goal.owner_id
    });
    setEditingGoal(goalId);
    setShowForm(true);
    setShowDropdown(null);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (window.confirm('정말 이 목표를 삭제하시겠습니까?')) {
      setGoals(goals.filter(g => g.id !== goalId));
      setShowDropdown(null);
    }
  };

  const handleUpdateGoal = () => {
    if (!user || !newGoal.title.trim() || !editingGoal) return;
    
    const updatedGoals = goals.map(goal => 
      goal.id === editingGoal 
        ? {
            ...goal,
            title: newGoal.title,
            description: newGoal.description,
            target_date: newGoal.target_date,
            updated_at: new Date().toISOString()
          }
        : goal
    );
    
    setGoals(updatedGoals);
    setNewGoal({ title: '', description: '', target_date: '', owner_id: '' });
    setShowForm(false);
    setEditingGoal(null);
  };

  const canEditGoal = (goal: { owner_id: string }) => {
    return user && (user.role === 'dad' || user.id === goal.owner_id);
  };

  const stats = {
    total: goals.length,
    completed: goals.filter(g => g.completed).length,
    myGoals: user ? goals.filter(g => g.owner_id === user.id).length : 0,
    myCompleted: user ? goals.filter(g => g.owner_id === user.id && g.completed).length : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>목표 설정</span>
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="family-card text-center">
          <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-600">전체 목표</div>
        </div>
        <div className="family-card text-center">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-xl font-bold text-gray-900">{stats.completed}</div>
          <div className="text-xs text-gray-600">달성 완료</div>
        </div>
        <div className="family-card text-center">
          <UserIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-xl font-bold text-gray-900">{stats.myGoals}</div>
          <div className="text-xs text-gray-600">내 목표</div>
        </div>
        <div className="family-card text-center">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-xl font-bold text-gray-900">{stats.myCompleted}</div>
          <div className="text-xs text-gray-600">내 달성</div>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">보기:</span>
        {[
          { key: 'all', label: '전체' },
          { key: 'my', label: '내 목표' },
          { key: 'pending', label: '진행 중' },
          { key: 'completed', label: '완료됨' },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setFilterBy(filter.key as 'all' | 'my' | 'pending' | 'completed')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filterBy === filter.key
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* 목표 추가 폼 */}
      {showForm && (
        <div className="family-card">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            {editingGoal ? '목표 수정' : '새 목표 설정'}
          </h3>
          <div className="space-y-4">
            {/* 목표 대상자 선택 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">대상</label>
              <div className="flex flex-wrap gap-2">
                {familyMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setNewGoal({ ...newGoal, owner_id: member.id })}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      newGoal.owner_id === member.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <Avatar user={member} size="xs" />
                    </div>
                    <span>{member.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              placeholder="목표 제목"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 outline-none"
            />
            <textarea
              placeholder="목표 설명 (선택사항)"
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 outline-none resize-none"
            />
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">달성 목표일</label>
              <input
                type="date"
                value={newGoal.target_date}
                onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 outline-none"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={editingGoal ? handleUpdateGoal : handleSubmitGoal}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                {editingGoal ? '수정하기' : '설정하기'}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setNewGoal({ title: '', description: '', target_date: '', owner_id: '' });
                  setEditingGoal(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 목표 목록 */}
      <div className="space-y-4">
        {filteredGoals.length === 0 ? (
          <div className="family-card text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">
              {filterBy === 'all' ? '설정된 목표가 없습니다' : 
               filterBy === 'my' ? '내 목표가 없습니다' :
               filterBy === 'completed' ? '완료된 목표가 없습니다' :
               '진행 중인 목표가 없습니다'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              새로운 목표를 설정해보세요!
            </p>
          </div>
        ) : (
          filteredGoals.map((goal) => {
            const daysLeft = goal.target_date ? getDaysUntilTarget(goal.target_date) : null;
            const isOverdue = daysLeft !== null && daysLeft < 0;
            const isOwner = user && user.id === goal.owner_id;
            
            return (
              <div key={goal.id} className={`family-card ${goal.completed ? 'bg-green-50 border-green-200' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar user={goal.owner} size="sm" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{goal.owner.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(goal.owner.role)}`}>
                          {getRoleName(goal.owner.role)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{getRelativeTime(goal.created_at)}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ml-2 ${
                      goal.completed ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}>
                      {goal.completed ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <Target className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {goal.completed && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">달성!</span>
                      </div>
                    )}

                    {/* 수정/삭제 메뉴 */}
                    {canEditGoal(goal) && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDropdown(showDropdown === goal.id ? null : goal.id);
                          }}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                        
                        {showDropdown === goal.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                            <button
                              onClick={() => handleEditGoal(goal.id)}
                              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span>수정</span>
                            </button>
                            <button
                              onClick={() => handleDeleteGoal(goal.id)}
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
                
                <h2 className={`text-base font-semibold mb-2 ${goal.completed ? 'text-green-800' : 'text-gray-900'}`}>
                  {goal.title}
                </h2>
                
                {goal.description && (
                  <p className="text-gray-700 mb-4 leading-relaxed">{goal.description}</p>
                )}
                
                {/* 진행률 바 */}
                {!goal.completed && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">진행률</span>
                      <span className="text-sm font-medium text-gray-900">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(goal.progress)}`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    
                    {isOwner && (
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => updateProgress(goal.id, goal.progress - 10)}
                          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                        >
                          -10%
                        </button>
                        <button
                          onClick={() => updateProgress(goal.id, goal.progress + 10)}
                          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          +10%
                        </button>
                        <button
                          onClick={() => updateProgress(goal.id, 100)}
                          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                          완료
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* 목표일 */}
                {goal.target_date && (
                  <div className="flex items-center space-x-2 text-sm mb-4">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">목표일:</span>
                    <span className={`font-medium ${
                      goal.completed ? 'text-green-600' :
                      isOverdue ? 'text-red-600' : 
                      daysLeft !== null && daysLeft <= 7 ? 'text-yellow-600' : 'text-gray-900'
                    }`}>
                      {new Date(goal.target_date).toLocaleDateString('ko-KR')}
                      {daysLeft !== null && !goal.completed && (
                        <span className="ml-1">
                          ({isOverdue ? `${Math.abs(daysLeft)}일 지남` : 
                            daysLeft === 0 ? '오늘' : `${daysLeft}일 남음`})
                        </span>
                      )}
                    </span>
                  </div>
                )}
                
                <CommentSection
                  targetType="goal"
                  targetId={goal.id}
                  comments={comments}
                  onAddComment={(content) => handleAddComment(content, goal.id)}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}