'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter, Search, MessageCircle, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useAuthStore, useAppStore } from '@/lib/store';
import { Comment } from '@/types';
import { getRoleName, getRoleColor, getRelativeTime } from '@/lib/utils';
import CommentSection from '@/components/shared/CommentSection';
import Avatar from '@/components/shared/Avatar';
import { NotificationService } from '@/lib/notifications';


export default function CommunicationPage() {
  const { user, users } = useAuthStore();
  const { posts, setPosts, selectedAuthor, setSelectedAuthor, loadAllData } = useAppStore();
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPost, setNewPost] = useState({ title: '', content: '', target_audience: 'all', author_id: '' });
  const [comments, setComments] = useState<Comment[]>([]);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);


  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(null);
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

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
    
    const selectedAuthor = users.find(member => member.id === newPost.author_id) || user;
    
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
    const selectedAuthor = users.find(member => member.id === authorId);
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

  const handleEditPost = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    setNewPost({
      title: post.title,
      content: post.content,
      target_audience: post.target_audience,
      author_id: post.author_id
    });
    setEditingPost(postId);
    setShowWriteForm(true);
    setShowDropdown(null);
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('정말 이 글을 삭제하시겠습니까?')) {
      setPosts(posts.filter(p => p.id !== postId));
      setShowDropdown(null);
    }
  };

  const handleUpdatePost = async () => {
    if (!user || !newPost.title.trim() || !newPost.content.trim() || !editingPost) return;
    
    const updatedPosts = posts.map(post => 
      post.id === editingPost 
        ? {
            ...post,
            title: newPost.title,
            content: newPost.content,
            target_audience: newPost.target_audience,
            updated_at: new Date().toISOString()
          }
        : post
    );
    
    setPosts(updatedPosts);
    setNewPost({ title: '', content: '', target_audience: 'all', author_id: '' });
    setShowWriteForm(false);
    setEditingPost(null);
  };

  const canEditPost = (post: any) => {
    return user && (user.role === 'dad' || user.id === post.author_id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowWriteForm(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-all duration-200 font-semibold text-sm min-h-[40px] shadow-md"
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
        
        <div className="space-y-4">
          {/* 작성자 필터 */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">작성자</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: '전체' },
                { key: 'dad', label: '아빠' },
                { key: 'eldest', label: '장남' },
                { key: 'youngest', label: '막둥이' },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedAuthor(filter.key as 'dad' | 'eldest' | 'youngest' | 'all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 min-h-[32px] ${
                    selectedAuthor === filter.key
                      ? 'bg-blue-500 text-white shadow-md transform scale-105'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 active:scale-95'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 대상별 필터 */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">대상별</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: '전체' },
                { key: 'to_me', label: '나에게' },
                { key: 'my_posts', label: '내가 쓴 글' },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => {
                    // 추후 구현 예정
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 min-h-[32px] bg-gray-50 text-gray-700 hover:bg-gray-100 active:scale-95"
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
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            {editingPost ? '글 수정' : '새 글 작성'}
          </h3>
          <div className="space-y-4">
            {/* 작성자 선택 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">작성자</label>
              <div className="flex flex-wrap gap-2">
                {users.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setNewPost({ ...newPost, author_id: member.id, target_audience: 'all' });
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 min-h-[36px] ${
                      newPost.author_id === member.id
                        ? 'bg-blue-500 text-white shadow-md transform scale-105'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 active:scale-95'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      newPost.author_id === member.id
                        ? 'bg-white text-blue-500'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {member.name.charAt(0)}
                    </div>
                    <span className="whitespace-nowrap">{member.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 대상 선택 */}
            {newPost.author_id && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">대상</label>
                <div className="flex flex-wrap gap-2">
                  {getTargetAudienceOptions(newPost.author_id).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setNewPost({ ...newPost, target_audience: option.value })}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 min-h-[36px] whitespace-nowrap ${
                        newPost.target_audience === option.value
                          ? 'bg-green-500 text-white shadow-md transform scale-105'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 active:scale-95'
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
            <div className="flex gap-2 pt-2">
              <button
                onClick={editingPost ? handleUpdatePost : handleSubmitPost}
                className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-all duration-200 font-semibold text-sm min-h-[40px]"
              >
                {editingPost ? '수정하기' : '게시하기'}
              </button>
              <button
                onClick={() => {
                  setShowWriteForm(false);
                  setNewPost({ title: '', content: '', target_audience: 'all', author_id: '' });
                  setEditingPost(null);
                }}
                className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:scale-95 transition-all duration-200 font-semibold text-sm min-h-[40px]"
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
                      <h3 className="text-sm font-semibold text-gray-900">{post.author.name}</h3>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getRoleColor(post.author.role)}`}>
                        {getRoleName(post.author.role)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{getRelativeTime(post.created_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
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

                  {/* 수정/삭제 메뉴 */}
                  {canEditPost(post) && (
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDropdown(showDropdown === post.id ? null : post.id);
                        }}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      
                      {showDropdown === post.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                          <button
                            onClick={() => handleEditPost(post.id)}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>수정</span>
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
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
              
              <h2 className="text-base font-semibold text-gray-900 mb-2">{post.title}</h2>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">{post.content}</p>
              
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