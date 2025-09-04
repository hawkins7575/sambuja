'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, X, Users, Edit, Trash2 } from 'lucide-react';
import { useAuthStore, useAppStore } from '@/lib/store';
import { getRoleName, getRoleColor } from '@/lib/utils';
import CommentSection from '@/components/shared/CommentSection';
import { Comment, ScheduleEvent, Event } from '@/types';
import Avatar from '@/components/shared/Avatar';
import { NotificationService } from '@/lib/notifications';
import { updateEvent, deleteEvent, createEvent } from '@/lib/firebase/events';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '짱남 축구 경기',
    description: '학교 대표팀 축구 경기가 있어요. 응원 와주세요!',
    start_date: '2025-09-05T15:00:00Z',
    end_date: '2025-09-05T17:00:00Z',
    target_audience: 'all' as const,
    created_by: '2',
    creator: {
      id: '2',
      name: '짱남',
      role: 'eldest' as const,
      email: 'eldest@example.com',
      created_at: '2025-01-01',
    },
    created_at: '2025-09-02T10:00:00Z',
  },
  {
    id: '2',
    title: '막둥이 학부모 상담',
    description: '2학기 성적 및 학교생활 상담이 있습니다.',
    start_date: '2025-09-07T14:00:00Z',
    end_date: '2025-09-07T15:00:00Z',
    target_audience: 'youngest' as const,
    created_by: '1',
    creator: {
      id: '1',
      name: '아빠',
      role: 'dad' as const,
      email: 'dad@example.com',
      created_at: '2025-01-01',
    },
    created_at: '2025-09-01T09:30:00Z',
  },
  {
    id: '3',
    title: '가족 영화 관람',
    description: '주말에 온 가족이 함께 영화를 보러 가요!',
    start_date: '2025-09-08T19:30:00Z',
    end_date: '2025-09-08T22:00:00Z',
    target_audience: 'all' as const,
    created_by: '3',
    creator: {
      id: '3',
      name: '막뚱이',
      role: 'youngest' as const,
      email: 'youngest@example.com',
      created_at: '2025-01-01',
    },
    created_at: '2025-09-02T16:20:00Z',
  },
];

const daysInWeek = ['일', '월', '화', '수', '목', '금', '토'];

const mockComments: Comment[] = [
  {
    id: '1',
    content: '축구 경기 꼭 보러 갈게!',
    target_type: 'event',
    target_id: '1',
    author_id: '1',
    author: {
      id: '1',
      name: '아빠',
      role: 'dad',
      email: 'dad@example.com',
      created_at: '2025-01-01',
    },
    created_at: '2025-09-02T11:00:00Z',
  },
];

export default function SchedulePage() {
  const { user, users, loadUsers } = useAuthStore();
  const { events, loadAllData } = useAppStore();
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [scheduleFilter, setScheduleFilter] = useState<'my' | 'our'>('our');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);

  useEffect(() => {
    // 데이터 로드
    loadAllData();
    loadUsers();
  }, []);
  
  // 목록 뷰 필터 상태
  const [listFilters, setListFilters] = useState({
    dateRange: 'all', // all, today, thisWeek, thisMonth, upcoming
    creator: 'all', // all, dad, eldest, youngest
    targetAudience: 'all', // all, dad, eldest, youngest, allFamily
  });
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    target_audience: 'all',
    isAllDay: false,
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const days = [];
    
    // 이전 달의 마지막 며칠
    for (let i = startDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // 현재 달
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true });
    }
    
    // 다음 달의 첫 며칠
    const remainingDays = 42 - days.length; // 6주 * 7일
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFilteredEvents = () => {
    if (!user) return events;
    
    let filteredEvents = events;

    // 기본 내/우리 일정 필터
    if (scheduleFilter === 'my') {
      filteredEvents = filteredEvents.filter(event => 
        event.created_by === user.id || 
        event.target_audience === user.role || 
        event.target_audience === 'all'
      );
    }

    // 목록 뷰에서만 추가 필터 적용
    if (viewMode === 'list') {
      // 날짜 범위 필터
      if (listFilters.dateRange !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        filteredEvents = filteredEvents.filter(event => {
          const eventDate = new Date(event.start_date);
          eventDate.setHours(0, 0, 0, 0);
          
          switch (listFilters.dateRange) {
            case 'today':
              return eventDate.getTime() === today.getTime();
            case 'thisWeek':
              const weekStart = new Date(today);
              weekStart.setDate(today.getDate() - today.getDay());
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekStart.getDate() + 6);
              return eventDate >= weekStart && eventDate <= weekEnd;
            case 'thisMonth':
              return eventDate.getMonth() === today.getMonth() && 
                     eventDate.getFullYear() === today.getFullYear();
            case 'upcoming':
              return eventDate >= today;
            default:
              return true;
          }
        });
      }

      // 작성자 필터
      if (listFilters.creator !== 'all') {
        const creatorRoleMap: { [key: string]: string } = {
          'dad': '1',
          'eldest': '2', 
          'youngest': '3'
        };
        filteredEvents = filteredEvents.filter(event => 
          event.created_by === creatorRoleMap[listFilters.creator]
        );
      }

      // 대상자 필터
      if (listFilters.targetAudience !== 'all') {
        if (listFilters.targetAudience === 'allFamily') {
          filteredEvents = filteredEvents.filter(event => event.target_audience === 'all');
        } else {
          filteredEvents = filteredEvents.filter(event => 
            event.target_audience === listFilters.targetAudience
          );
        }
      }
    }

    return filteredEvents;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    const filteredEvents = getFilteredEvents();
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.start_date).toDateString();
      return eventDate === dateStr;
    });
  };

  const handleSubmitEvent = async () => {
    if (!user || !newEvent.title.trim() || !newEvent.start_date || (!newEvent.isAllDay && !newEvent.start_time)) return;
    
    try {
      let startDateTime, endDateTime;
      
      if (newEvent.isAllDay) {
        // 종일 이벤트인 경우
        startDateTime = new Date(`${newEvent.start_date}T00:00:00`);
        endDateTime = new Date(`${newEvent.start_date}T23:59:59`);
      } else {
        // 시간 지정 이벤트인 경우
        startDateTime = new Date(`${newEvent.start_date}T${newEvent.start_time}:00`);
        endDateTime = newEvent.end_time 
          ? new Date(`${newEvent.end_date || newEvent.start_date}T${newEvent.end_time}:00`)
          : new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1시간 후
      }

      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        target_audience: newEvent.target_audience,
        created_by: user.id,
        creator: user,
      };

      await createEvent(eventData);
      
      // 데이터 새로고침
      await loadAllData();
      
      setNewEvent({
        title: '',
        description: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        target_audience: 'all',
        isAllDay: false,
      });
      setShowForm(false);

      // 푸시 알림 발송
      const notificationService = NotificationService.getInstance();
      await notificationService.notifyNewSchedule(
        user.name,
        newEvent.title,
        newEvent.start_date
      );
    } catch (error) {
      alert('일정 생성에 실패했습니다.');
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    const startDate = new Date(event.start_date);
    setNewEvent({
      title: event.title,
      description: event.description || '',
      start_date: startDate.toISOString().split('T')[0],
      start_time: startDate.toTimeString().split(' ')[0].slice(0, 5),
      end_date: '',
      end_time: '',
      target_audience: event.target_audience,
    });
    setShowEditForm(true);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent || !user || !newEvent.title.trim()) return;
    
    try {
      let startDateTime, endDateTime;
      
      if (newEvent.isAllDay) {
        // 종일 이벤트인 경우
        startDateTime = new Date(`${newEvent.start_date}T00:00:00`);
        endDateTime = new Date(`${newEvent.start_date}T23:59:59`);
      } else {
        // 시간 지정 이벤트인 경우
        startDateTime = new Date(`${newEvent.start_date}T${newEvent.start_time}:00`);
        endDateTime = newEvent.end_time 
          ? new Date(`${newEvent.end_date || newEvent.start_date}T${newEvent.end_time}:00`)
          : new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1시간 후
      }

      const updateData = {
        title: newEvent.title,
        description: newEvent.description,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        target_audience: newEvent.target_audience,
      };

      await updateEvent(editingEvent.id, updateData);
      
      // 데이터 새로고침
      await loadAllData();
      
      setEditingEvent(null);
      setShowEditForm(false);
      setNewEvent({
        title: '',
        description: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        target_audience: 'all',
        isAllDay: false,
      });
    } catch (error) {
      alert('일정 수정에 실패했습니다.');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('정말 이 일정을 삭제하시겠습니까?')) return;
    
    try {
      await deleteEvent(eventId);
      
      // 데이터 새로고침
      await loadAllData();
    } catch (error) {
      alert('일정 삭제에 실패했습니다.');
    }
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const getTargetAudienceOptions = () => {
    if (!user) return [];
    
    const options = [{ value: 'all', label: '모두에게' }];
    
    if (user.role === 'dad') {
      options.push(
        { value: 'eldest', label: '짱남에게' },
        { value: 'youngest', label: '막뚱이에게' }
      );
    } else if (user.role === 'eldest') {
      options.push(
        { value: 'dad', label: '아빠에게' },
        { value: 'youngest', label: '막뚱이에게' }
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
      'eldest': '짱남',
      'youngest': '막뚱이'
    };
    return options[targetAudience as keyof typeof options] || '모두';
  };

  const handleAddComment = (content: string, targetId: string) => {
    if (!user) return;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      content,
      target_type: 'event',
      target_id: targetId,
      author_id: user.id,
      author: user,
      created_at: new Date().toISOString(),
    };
    
    setComments(prev => [...prev, newComment]);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  };

  const handleDateClick = (date: Date) => {
    const dateEvents = getEventsForDate(date);
    if (dateEvents.length === 1) {
      handleEventClick(dateEvents[0]);
    } else if (dateEvents.length > 1) {
      setSelectedDate(date);
      setViewMode('list');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {/* 내 일정 / 우리 일정 선택 */}
          {user && (
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { key: 'our', label: '우리 일정' },
                { key: 'my', label: '내 일정' },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setScheduleFilter(filter.key as 'my' | 'our')}
                  className={`flex-1 sm:flex-none px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    scheduleFilter === filter.key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'month', label: '월' },
              { key: 'week', label: '주' },
              { key: 'list', label: '목록' },
            ].map((mode) => (
              <button
                key={mode.key}
                onClick={() => setViewMode(mode.key as 'month' | 'week' | 'list')}
                className={`flex-1 sm:flex-none px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">일정 추가</span>
            <span className="sm:hidden">추가</span>
          </button>
        </div>
      </div>

      {/* 일정 추가 폼 */}
      {showForm && (
        <div className="family-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">새 일정 추가</h3>
          <div className="space-y-4">
            {/* 대상 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">누구에게 일정을 알려드릴까요?</label>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                {getTargetAudienceOptions().map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setNewEvent({ ...newEvent, target_audience: option.value })}
                    className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      newEvent.target_audience === option.value
                        ? 'bg-green-500 text-white'
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
              placeholder="일정 제목"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 outline-none"
            />
            <textarea
              placeholder="일정 설명"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 outline-none resize-none"
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                <input
                  type="date"
                  value={newEvent.start_date}
                  onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 outline-none text-sm sm:text-base"
                />
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="isAllDay"
                    checked={newEvent.isAllDay}
                    onChange={(e) => setNewEvent({ ...newEvent, isAllDay: e.target.checked, start_time: e.target.checked ? '' : newEvent.start_time, end_time: e.target.checked ? '' : newEvent.end_time })}
                    className="mr-2 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="isAllDay" className="text-sm font-medium text-gray-700">
                    종일
                  </label>
                </div>
                {!newEvent.isAllDay && (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
                    <input
                      type="time"
                      value={newEvent.start_time}
                      onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 outline-none text-sm sm:text-base"
                    />
                  </>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">종료일 (선택)</label>
                <input
                  type="date"
                  value={newEvent.end_date}
                  onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 outline-none text-sm sm:text-base"
                />
              </div>
              {!newEvent.isAllDay && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간 (선택)</label>
                  <input
                    type="time"
                    value={newEvent.end_time}
                    onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 outline-none text-sm sm:text-base"
                  />
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={handleSubmitEvent}
                className="flex-1 sm:flex-none px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                추가하기
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setNewEvent({
                    title: '',
                    description: '',
                    start_date: '',
                    start_time: '',
                    end_date: '',
                    end_time: '',
                    target_audience: 'all',
                  });
                }}
                className="flex-1 sm:flex-none px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 일정 수정 폼 */}
      {showEditForm && editingEvent && (
        <div className="family-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">일정 수정</h3>
          <div className="space-y-4">
            {/* 대상 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">누구에게 일정을 알려드릴까요?</label>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                {getTargetAudienceOptions().map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setNewEvent({ ...newEvent, target_audience: option.value })}
                    className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      newEvent.target_audience === option.value
                        ? 'bg-green-500 text-white'
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
              placeholder="일정 제목"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 outline-none"
            />
            <textarea
              placeholder="일정 설명"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 outline-none resize-none"
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                <input
                  type="date"
                  value={newEvent.start_date}
                  onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 outline-none text-sm sm:text-base"
                />
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="editIsAllDay"
                    checked={newEvent.isAllDay}
                    onChange={(e) => setNewEvent({ ...newEvent, isAllDay: e.target.checked, start_time: e.target.checked ? '' : newEvent.start_time })}
                    className="mr-2 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="editIsAllDay" className="text-sm font-medium text-gray-700">
                    종일
                  </label>
                </div>
                {!newEvent.isAllDay && (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-1">시간</label>
                    <input
                      type="time"
                      value={newEvent.start_time}
                      onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 outline-none text-sm sm:text-base"
                    />
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={handleUpdateEvent}
                className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                수정하기
              </button>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditingEvent(null);
                  setNewEvent({
                    title: '',
                    description: '',
                    start_date: '',
                    start_time: '',
                    end_date: '',
                    end_time: '',
                    target_audience: 'all',
                  });
                }}
                className="flex-1 sm:flex-none px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'month' && (
        <div className="family-card p-4 sm:p-6">
          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {formatDate(currentDate)}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* 캘린더 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {daysInWeek.map((day) => (
              <div key={day} className="p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-gray-500 bg-gray-50">
                {day}
              </div>
            ))}
            
            {getDaysInMonth(currentDate).map(({ date, isCurrentMonth }, index) => {
              const dayEvents = getEventsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
                  onClick={() => handleDateClick(date)}
                >
                  <div className={`text-xs sm:text-sm font-medium mb-1 ${
                    isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  } ${isToday ? 'text-blue-600' : ''}`}>
                    {date.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 1).map((event) => (
                      <div
                        key={event.id}
                        className="text-xs px-1 py-0.5 bg-green-100 text-green-800 rounded truncate"
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 1 && (
                      <div className="text-xs text-gray-500 hidden sm:block">
                        +{dayEvents.length - 1}개 더
                      </div>
                    )}
                    {dayEvents.length > 1 && (
                      <div className="text-xs text-gray-500 sm:hidden text-center">
                        +{dayEvents.length - 1}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'week' && (
        <div className="family-card p-4 sm:p-6">
          {/* 주 네비게이션 */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(newDate.getDate() - 7);
                setCurrentDate(newDate);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <h2 className="text-base sm:text-xl font-semibold text-gray-900">
              {currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} 주
            </h2>
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(newDate.getDate() + 7);
                setCurrentDate(newDate);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* 주간 캘린더 세로 레이아웃 */}
          <div className="space-y-3">
            {(() => {
              const weekStart = new Date(currentDate);
              const dayOfWeek = weekStart.getDay();
              weekStart.setDate(weekStart.getDate() - dayOfWeek);
              
              const weekDays = [];
              for (let i = 0; i < 7; i++) {
                const date = new Date(weekStart);
                date.setDate(weekStart.getDate() + i);
                weekDays.push(date);
              }
              
              return weekDays.map((date, index) => {
                const dayEvents = getEventsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const dayName = daysInWeek[index];
                
                return (
                  <div
                    key={index}
                    className={`bg-white border rounded-lg overflow-hidden ${
                      isToday ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'
                    }`}
                  >
                    {/* 날짜 헤더 */}
                    <div className={`px-4 py-3 border-b flex items-center justify-between ${
                      isToday 
                        ? 'bg-blue-100 border-blue-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`text-lg font-bold ${
                          isToday ? 'text-blue-700' : 'text-gray-900'
                        }`}>
                          {date.getDate()}
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${
                            isToday ? 'text-blue-700' : 'text-gray-900'
                          }`}>
                            {dayName}요일
                          </div>
                          <div className="text-xs text-gray-500">
                            {date.toLocaleDateString('ko-KR', { month: 'long' })}
                          </div>
                        </div>
                      </div>
                      {isToday && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
                          오늘
                        </span>
                      )}
                    </div>
                    
                    {/* 일정 목록 */}
                    <div className="p-4">
                      {dayEvents.length === 0 ? (
                        <p className="text-sm text-gray-400 italic py-2">일정이 없습니다</p>
                      ) : (
                        <div className="space-y-2">
                          {dayEvents.map((event) => (
                            <div
                              key={event.id}
                              className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 cursor-pointer transition-colors"
                              onClick={() => handleEventClick(event)}
                            >
                              <div className="flex-shrink-0">
                                <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                                      {event.title}
                                    </h4>
                                    <div className="text-xs text-green-700 font-medium">
                                      {formatTime(event.start_date)} - {formatTime(event.end_date)}
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0 ml-2">
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                      event.target_audience === 'all'
                                        ? 'bg-gray-100 text-gray-700'
                                        : event.target_audience === 'dad'
                                        ? 'bg-blue-100 text-blue-700'
                                        : event.target_audience === 'eldest'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-purple-100 text-purple-700'
                                    }`}>
                                      {event.target_audience === 'all' ? '모두' :
                                       event.target_audience === 'dad' ? '아빠' :
                                       event.target_audience === 'eldest' ? '짱남' : '막둥이'}
                                    </span>
                                  </div>
                                </div>
                                {event.description && (
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {event.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* 목록 뷰 필터 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-4">필터</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* 날짜 범위 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">날짜 범위</label>
                <select
                  value={listFilters.dateRange}
                  onChange={(e) => setListFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm sm:text-base"
                >
                  <option value="all">모든 날짜</option>
                  <option value="today">오늘</option>
                  <option value="thisWeek">이번 주</option>
                  <option value="thisMonth">이번 달</option>
                  <option value="upcoming">다가오는 일정</option>
                </select>
              </div>

              {/* 작성자 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">작성자</label>
                <select
                  value={listFilters.creator}
                  onChange={(e) => setListFilters(prev => ({ ...prev, creator: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm sm:text-base"
                >
                  <option value="all">모든 작성자</option>
                  <option value="dad">아빠</option>
                  <option value="eldest">짱남</option>
                  <option value="youngest">막둥이</option>
                </select>
              </div>

              {/* 대상자 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">대상자</label>
                <select
                  value={listFilters.targetAudience}
                  onChange={(e) => setListFilters(prev => ({ ...prev, targetAudience: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm sm:text-base"
                >
                  <option value="all">모든 대상자</option>
                  <option value="allFamily">온 가족</option>
                  <option value="dad">아빠</option>
                  <option value="eldest">짱남</option>
                  <option value="youngest">막둥이</option>
                </select>
              </div>
            </div>

            {/* 필터 초기화 버튼 */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setListFilters({
                  dateRange: 'all',
                  creator: 'all',
                  targetAudience: 'all'
                })}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                필터 초기화
              </button>
            </div>
          </div>

          {/* 활성 필터 태그 */}
          {(listFilters.dateRange !== 'all' || listFilters.creator !== 'all' || listFilters.targetAudience !== 'all') && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">활성 필터:</span>
              {listFilters.dateRange !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {listFilters.dateRange === 'today' ? '오늘' :
                   listFilters.dateRange === 'thisWeek' ? '이번 주' :
                   listFilters.dateRange === 'thisMonth' ? '이번 달' : '다가오는 일정'}
                  <button
                    onClick={() => setListFilters(prev => ({ ...prev, dateRange: 'all' }))}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {listFilters.creator !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  작성자: {listFilters.creator === 'dad' ? '아빠' : 
                          listFilters.creator === 'eldest' ? '짱남' : '막둥이'}
                  <button
                    onClick={() => setListFilters(prev => ({ ...prev, creator: 'all' }))}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {listFilters.targetAudience !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  대상: {listFilters.targetAudience === 'allFamily' ? '온 가족' :
                        listFilters.targetAudience === 'dad' ? '아빠' :
                        listFilters.targetAudience === 'eldest' ? '짱남' : '막둥이'}
                  <button
                    onClick={() => setListFilters(prev => ({ ...prev, targetAudience: 'all' }))}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}

          {getFilteredEvents().length === 0 ? (
            <div className="family-card text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">
                {listFilters.dateRange === 'all' && listFilters.creator === 'all' && listFilters.targetAudience === 'all' 
                  ? '예정된 일정이 없습니다' 
                  : '필터 조건에 맞는 일정이 없습니다'
                }
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {listFilters.dateRange === 'all' && listFilters.creator === 'all' && listFilters.targetAudience === 'all' 
                  ? '새로운 일정을 추가해보세요!' 
                  : '다른 필터 조건을 시도해보세요!'
                }
              </p>
            </div>
          ) : (
            getFilteredEvents().map((event) => (
              <div 
                key={event.id} 
                className="family-card p-4 sm:p-6 cursor-pointer hover:shadow-md transition-all duration-200"
                onClick={() => handleEventClick(event)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <Avatar user={event.creator} size="sm" />
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base">{event.creator.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${getRoleColor(event.creator.role)}`}>
                          {getRoleName(event.creator.role)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 수정/삭제 버튼 - 작성자만 볼 수 있음 */}
                  {user && event.created_by === user.id && (
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEvent(event);
                        }}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event.id);
                        }}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">
                      {new Date(event.start_date).toLocaleDateString('ko-KR')} {formatTime(event.start_date)}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 space-y-2 sm:space-y-0">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">{event.title}</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 hidden sm:inline">→</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${
                      event.target_audience === 'all' 
                        ? 'bg-gray-100 text-gray-700'
                        : event.target_audience === 'dad' 
                        ? 'bg-blue-100 text-blue-700'
                        : event.target_audience === 'eldest'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {getTargetAudienceLabel(event.target_audience)}
                    </span>
                  </div>
                </div>
                {event.description && (
                  <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">{event.description}</p>
                )}
                
                <CommentSection
                  targetType="event"
                  targetId={event.id}
                  comments={comments}
                  onAddComment={(content) => handleAddComment(content, event.id)}
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* 일정 상세보기 모달 */}
      {showEventDetail && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-4 sm:px-6 py-3 sm:py-4 text-white rounded-t-2xl sm:rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar user={selectedEvent.creator} size="sm" />
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">{selectedEvent.creator.name}</h3>
                    <p className="text-xs sm:text-sm opacity-90">{getRoleName(selectedEvent.creator.role)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEventDetail(false)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 모달 내용 */}
            <div className="p-4 sm:p-6">
              {/* 일정 제목 */}
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">{selectedEvent.title}</h2>
              
              {/* 일정 정보 */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start sm:items-center space-x-3 text-gray-600">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 mt-1 sm:mt-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">
                      {new Date(selectedEvent.start_date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </p>
                    <p className="text-sm">
                      {formatTime(selectedEvent.start_date)} - {formatTime(selectedEvent.end_date)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-600">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedEvent.target_audience === 'all'
                      ? 'bg-gray-100 text-gray-700'
                      : selectedEvent.target_audience === 'dad'
                      ? 'bg-blue-100 text-blue-700'
                      : selectedEvent.target_audience === 'eldest'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {getTargetAudienceLabel(selectedEvent.target_audience)}
                  </span>
                </div>
              </div>

              {/* 일정 설명 */}
              {selectedEvent.description && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">상세 내용</h4>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-2xl p-3 sm:p-4 text-sm sm:text-base">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              {/* 댓글 섹션 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">댓글</h4>
                <CommentSection
                  targetType="event"
                  targetId={selectedEvent.id}
                  comments={comments}
                  onAddComment={(content) => handleAddComment(content, selectedEvent.id)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}