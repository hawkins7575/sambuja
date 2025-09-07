'use client';

import { useState, useRef } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  MapPin, 
  Calendar, 
  Tag,
  Smile,
  Hash,
  Camera,
  Upload,
  Palette
} from 'lucide-react';
import { User } from '@/types';
import Avatar from '@/components/shared/Avatar';
import RichTextEditor from '@/components/shared/RichTextEditor';
import { uploadSharePostImages } from '@/lib/firebase/sharePosts';

interface CreatePostFormProps {
  user: User;
  onClose: () => void;
  onSubmit: (postData: PostFormData) => void;
  initialData?: Partial<PostFormData>;
}

export interface PostFormData {
  title: string;
  content: string;
  type: 'general' | 'photo' | 'video' | 'document' | 'event' | 'location';
  tags: string[];
  location?: string;
  eventDate?: string;
  eventTime?: string;
  images?: File[];
  backgroundColor?: string;
  targetAudience: 'all' | 'dad' | 'eldest' | 'youngest';
  allowComments: boolean;
  isPinned: boolean;
}

const postTypes = [
  { id: 'general', label: '일반 게시물', icon: FileText, color: 'text-blue-600' },
  { id: 'photo', label: '사진', icon: ImageIcon, color: 'text-green-600' },
  { id: 'video', label: '동영상', icon: Video, color: 'text-purple-600' },
  { id: 'event', label: '이벤트', icon: Calendar, color: 'text-orange-600' },
  { id: 'location', label: '위치', icon: MapPin, color: 'text-red-600' }
];

const backgroundColors = [
  { id: 'default', label: '기본', color: 'bg-white' },
  { id: 'blue', label: '파랑', color: 'bg-blue-50 border-blue-200' },
  { id: 'green', label: '초록', color: 'bg-green-50 border-green-200' },
  { id: 'yellow', label: '노랑', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'pink', label: '분홍', color: 'bg-pink-50 border-pink-200' },
  { id: 'purple', label: '보라', color: 'bg-purple-50 border-purple-200' }
];

const emojis = ['😊', '😂', '🥰', '😍', '🤗', '👍', '❤️', '🎉', '🌟', '🔥', '💡', '🎈'];

export default function CreatePostForm({ user, onClose, onSubmit, initialData }: CreatePostFormProps) {
  const [formData, setFormData] = useState<PostFormData>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    type: initialData?.type || 'general',
    tags: initialData?.tags || [],
    location: initialData?.location,
    eventDate: initialData?.eventDate,
    eventTime: initialData?.eventTime,
    backgroundColor: initialData?.backgroundColor,
    targetAudience: initialData?.targetAudience || 'all',
    allowComments: initialData?.allowComments ?? true,
    isPinned: initialData?.isPinned ?? false
  });

  const [newTag, setNewTag] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (field: keyof PostFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newTag.trim()) {
        handleAddTag();
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const imageUrls = files.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...imageUrls]);
      handleInputChange('images', [...(formData.images || []), ...files]);
      
      if (formData.type === 'general') {
        handleInputChange('type', 'photo');
      }
    }
  };

  const handleRichEditorImageUpload = async (files: File[]): Promise<string[]> => {
    console.log('Rich editor image upload called with files:', files.length);
    
    // 임시로 Base64로 변환 (CORS 문제 해결 전까지)
    const base64Urls = await Promise.all(
      files.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      })
    );
    
    console.log('Images converted to base64, count:', base64Urls.length);
    return base64Urls;
    
    // Firebase Storage 업로드는 CORS 문제 해결 후 다시 활성화
    // try {
    //   console.log('Calling uploadSharePostImages...');
    //   const imageUrls = await uploadSharePostImages(files, `temp-${Date.now()}`);
    //   console.log('Upload successful, URLs:', imageUrls);
    //   return imageUrls;
    // } catch (error) {
    //   console.error('Image upload failed:', error);
    //   throw new Error('이미지 업로드에 실패했습니다.');
    // }
  };

  const handleRemoveImage = (index: number) => {
    const newPreviews = previewImages.filter((_, i) => i !== index);
    const newImages = (formData.images || []).filter((_, i) => i !== index);
    setPreviewImages(newPreviews);
    handleInputChange('images', newImages);

    if (newImages.length === 0 && formData.type === 'photo') {
      handleInputChange('type', 'general');
    }
  };

  const insertEmoji = (emoji: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent = formData.content.substring(0, start) + emoji + formData.content.substring(end);
      handleInputChange('content', newContent);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + emoji.length;
          textareaRef.current.focus();
        }
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    
    console.log('Calling onSubmit with formData');
    onSubmit(formData);
    console.log('onSubmit completed, not closing form here - parent will handle');
    // onClose는 상위 컴포넌트에서 처리
  };

  const selectedPostType = postTypes.find(type => type.id === formData.type);
  const selectedBgColor = backgroundColors.find(bg => bg.id === formData.backgroundColor) || backgroundColors[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar user={user} size="md" />
              <div>
                <h2 className="text-lg font-bold text-gray-900">새 게시물 작성</h2>
                <p className="text-sm text-gray-500">{user.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 폼 콘텐츠 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* 게시물 타입 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">게시물 유형</label>
              <div className="flex flex-wrap gap-2">
                {postTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleInputChange('type', type.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all ${
                        formData.type === type.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <IconComponent className={`w-4 h-4 ${formData.type === type.id ? 'text-blue-600' : type.color}`} />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 대상 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">공개 대상</label>
              <select
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">모든 가족구성원</option>
                <option value="dad">아빠</option>
                <option value="eldest">첫째</option>
                <option value="youngest">막내</option>
              </select>
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* 내용 - 리치 텍스트 에디터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => handleInputChange('content', value)}
                placeholder="내용을 입력하세요... 마크다운 문법을 지원합니다!"
                onImageUpload={handleRichEditorImageUpload}
                className="border-gray-300"
                minHeight="300px"
              />
            </div>

            {/* 이미지 미리보기 */}
            {previewImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">첨부 이미지</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {previewImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 이벤트 날짜/시간 (이벤트 타입일 때) */}
            {formData.type === 'event' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
                  <input
                    type="date"
                    value={formData.eventDate || ''}
                    onChange={(e) => handleInputChange('eventDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">시간</label>
                  <input
                    type="time"
                    value={formData.eventTime || ''}
                    onChange={(e) => handleInputChange('eventTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* 위치 (위치 타입일 때) */}
            {formData.type === 'location' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">위치</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="위치를 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* 태그 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">태그</label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="태그 입력 후 Enter"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Hash className="w-4 h-4" />
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 추가 옵션 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowComments"
                  checked={formData.allowComments}
                  onChange={(e) => handleInputChange('allowComments', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="allowComments" className="text-sm text-gray-700">
                  댓글 허용
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={formData.isPinned}
                  onChange={(e) => handleInputChange('isPinned', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPinned" className="text-sm text-gray-700">
                  상단 고정
                </label>
              </div>
            </div>
          </div>

          {/* 푸터 - 하단 메뉴와 겹치지 않도록 여백 추가 */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center mb-safe pb-safe">
            <div className="text-sm text-gray-500">
              {formData.content.length > 0 && `${formData.content.length}자`}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={!formData.title.trim() || !formData.content.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                게시하기
              </button>
            </div>
          </div>
          {/* 모바일 하단 네비게이션을 위한 추가 여백 */}
          <div className="h-20 md:hidden"></div>
        </form>

        {/* 숨겨진 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}