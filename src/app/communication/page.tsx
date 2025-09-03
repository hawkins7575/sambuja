'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter, Search, MessageCircle, Heart, Reply } from 'lucide-react';
import { useAuthStore, useAppStore } from '@/lib/store';
import { Comment } from '@/types';
import { getRoleName, getRoleColor, getRelativeTime } from '@/lib/utils';
import CommentSection from '@/components/shared/CommentSection';
import Avatar from '@/components/shared/Avatar';
import { NotificationService } from '@/lib/notifications';

const mockPosts = [
  {
    id: '1',
    title: '오늘 회사에서 있었던 일',
    content: '오늘 회사에서 프레젠테이션을 성공적으로 마쳤어요! 여러분이 응원해줘서 용기가 났답니다. 감사해요 😊',
    author_id: '1',
    author: {
      id: '1',
      name: '아빠',
      role: 'dad' as const,
      email: 'dad@example.com',
      created_at: '2025-01-01',
    },
    target_audience: 'all' as const,
    category: 'communication' as const,
    created_at: '2025-09-02T10:30:00Z',
    updated_at: '2025-09-02T10:30:00Z',
  },
  {
    id: '2',
    title: '아빠, 축구 가르쳐줘서 고마워요!',
    content: '오늘 체육시간에 축구를 했는데 우리 팀이 이겼어요! 골도 한 개 넣었답니다. 아빠가 알려준 슈팅 방법이 도움이 됐어요!',
    author_id: '2',
    author: {
      id: '2',
      name: '짱남',
      role: 'eldest' as const,
      email: 'eldest@example.com',
      created_at: '2025-01-01',
    },
    target_audience: 'dad' as const,
    category: 'communication' as const,
    created_at: '2025-09-02T14:15:00Z',
    updated_at: '2025-09-02T14:15:00Z',
  },
  {
    id: '3',
    title: '형아, 같이 책 읽을래?',
    content: '도서관에서 재미있어 보이는 모험 소설을 빌려왔어요. 주인공이 용감해서 좋아요! 형아도 같이 읽으면 좋을 것 같아요.',
    author_id: '3',
    author: {
      id: '3',
      name: '막뚱이',
      role: 'youngest' as const,
      email: 'youngest@example.com',
      created_at: '2025-01-01',
    },
    target_audience: 'eldest' as const,
    category: 'communication' as const,
    created_at: '2025-09-02T16:45:00Z',
    updated_at: '2025-09-02T16:45:00Z',
  },
  {
    id: '4',
    title: '막둥아, 오늘 하루 어땠어?',
    content: '학교에서 재미있는 일 있었니? 새로 사귄 친구는 어떤 아이인지 궁금해. 저녁에 같이 이야기하자!',
    author_id: '1',
    author: {
      id: '1',
      name: '아빠',
      role: 'dad' as const,
      email: 'dad@example.com',
      created_at: '2025-01-01',
    },
    target_audience: 'youngest' as const,
    category: 'communication' as const,
    created_at: '2025-09-02T18:20:00Z',
    updated_at: '2025-09-02T18:20:00Z',
  },
];

const mockComments: Comment[] = [
  {
    id: '1',
    content: '오늘 정말 수고하셨어요! 축하해요 아빠!',
    target_type: 'post',
    target_id: '1',
    author_id: '2',
    author: {
      id: '2',
      name: '짱남',
      role: 'eldest' as const,
      email: 'eldest@example.com',
      created_at: '2025-01-01',
    },
    created_at: '2025-09-02T11:00:00Z',
  },
  {
    id: '2',
    content: '저도 같이 책 읽고 싶어요!',
    target_type: 'post',
    target_id: '3',
    author_id: '1',
    author: {
      id: '1',
      name: '아빠',
      role: 'dad' as const,
      email: 'dad@example.com',
      created_at: '2025-01-01',
    },
    created_at: '2025-09-02T17:00:00Z',
  },
];

export default function CommunicationPage() {
  const { user } = useAuthStore();
  const { posts, setPosts, selectedAuthor, setSelectedAuthor } = useAppStore();
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPost, setNewPost] = useState({ title: '', content: '', target_audience: 'all', author_id: '' });
  const [comments, setComments] = useState<Comment[]>(mockComments);

  const familyMembers = [
    {
      id: '1',
      name: '아빠',
      role: 'dad' as const,
      email: 'dad@example.com',
      created_at: '2025-01-01',
    },
    {
      id: '2',
      name: '짱남',
      role: 'eldest' as const,
      email: 'eldest@example.com',
      created_at: '2025-01-01',
    },
    {
      id: '3',
      name: '막뚱이',
      role: 'youngest' as const,
      email: 'youngest@example.com',
      created_at: '2025-01-01',
    },
  ];

  useEffect(() => {
    setPosts(mockPosts);
  }, [setPosts]);

  const filteredPosts = posts.filter(post => {
    const matchesAuthor = selectedAuthor === 'all' || 
      (selectedAuthor === 'dad' && post.author.role === 'dad') ||
      (selectedAuthor === 'eldest' && post.author.role === 'eldest') ||
      (selectedAuthor === 'youngest' && post.author.role === 'youngest');
    
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesAuthor && matchesSearch;
  });

  const handleSubmitPost = async () => {
    if (!user || !newPost.title.trim() || !newPost.content.trim() || !newPost.author_id) return;
    
    const selectedAuthor = familyMembers.find(member => member.id === newPost.author_id) || user;
    
    const post = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      author_id: newPost.author_id,
      author: selectedAuthor,
      target_audience: newPost.target_audience,
      category: 'communication' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setPosts([post, ...posts]);
    setNewPost({ title: '', content: '', target_audience: 'all', author_id: '' });
    setShowWriteForm(false);

    // 푸시 알림 발송
    const notificationService = NotificationService.getInstance();
    await notificationService.notifyNewPost(
      selectedAuthor.name,
      newPost.title,
      newPost.target_audience
    );
  };

  const getTargetAudienceOptions = (authorId: string) => {
    const selectedAuthor = familyMembers.find(member => member.id === authorId);
    if (!selectedAuthor) return [{ value: 'all', label: '모두에게' }];
    
    const options = [{ value: 'all', label: '모두에게' }];
    
    if (selectedAuthor.role === 'dad') {
      options.push(
        { value: 'eldest', label: '짱남에게' },
        { value: 'youngest', label: '막뚱이에게' }
      );
    } else if (selectedAuthor.role === 'eldest') {
      options.push(
        { value: 'dad', label: '아빠에게' },
        { value: 'youngest', label: '막뚱이에게' }
      );
    } else if (selectedAuthor.role === 'youngest') {
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
      'eldest': '장남',
      'youngest': '막둥이'
    };
    return options[targetAudience as keyof typeof options] || '모두';
  };

  const handleAddComment = (postId: string, content: string) => {
    if (!user) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      content,
      target_type: 'post',
      target_id: postId,
      author_id: user.id,
      author: user,
      created_at: new Date().toISOString(),
    };
    
    setComments(prev => [...prev, comment]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowWriteForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>글쓰기</span>
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="글 제목이나 내용을 검색하세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">작성자로 보기:</span>
            <div className="flex space-x-2">
              {[
                { key: 'all', label: '전체' },
                { key: 'dad', label: '아빠' },
                { key: 'eldest', label: '장남' },
                { key: 'youngest', label: '막둥이' },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedAuthor(filter.key as any)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedAuthor === filter.key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">대상별로 보기:</span>
            <div className="flex space-x-2">
              {[
                { key: 'all', label: '전체' },
                { key: 'to_me', label: '나에게 온 글' },
                { key: 'my_posts', label: '내가 쓴 글' },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => {
                    // 추후 구현 예정
                  }}
                  className="px-3 py-1 rounded-full text-sm font-medium transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 글쓰기 폼 */}
      {showWriteForm && (
        <div className="family-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">새 글 작성</h3>
          <div className="space-y-4">
            {/* 작성자 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">누가 작성하는 글인가요?</label>
              <div className="flex flex-wrap gap-2">
                {familyMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setNewPost({ ...newPost, author_id: member.id, target_audience: 'all' });
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      newPost.author_id === member.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      newPost.author_id === member.id
                        ? 'bg-white text-blue-500'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {member.name.charAt(0)}
                    </div>
                    <span>{member.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 대상 선택 */}
            {newPost.author_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">글을 누구에게 보낼까요?</label>
                <div className="flex flex-wrap gap-2">
                  {getTargetAudienceOptions(newPost.author_id).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setNewPost({ ...newPost, target_audience: option.value })}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        newPost.target_audience === option.value
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
            />
            <textarea
              placeholder="내용을 입력하세요"
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none resize-none"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSubmitPost}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                게시하기
              </button>
              <button
                onClick={() => {
                  setShowWriteForm(false);
                  setNewPost({ title: '', content: '', target_audience: 'all', author_id: '' });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 게시글 목록 */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="family-card text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchTerm ? '검색 결과가 없습니다' : '아직 작성된 글이 없습니다'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              가족과 첫 대화를 시작해보세요!
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="family-card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Avatar user={post.author} size="md" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{post.author.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(post.author.role)}`}>
                        {getRoleName(post.author.role)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{getRelativeTime(post.created_at)}</p>
                  </div>
                </div>
                
                {/* 대상 표시 */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">→</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    post.target_audience === 'all' 
                      ? 'bg-gray-100 text-gray-700'
                      : post.target_audience === 'dad' 
                      ? 'bg-blue-100 text-blue-700'
                      : post.target_audience === 'eldest'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {getTargetAudienceLabel(post.target_audience)}
                  </span>
                </div>
              </div>
              
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>
              
              <CommentSection
                targetType="post"
                targetId={post.id}
                comments={comments}
                onAddComment={(content) => handleAddComment(post.id, content)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}