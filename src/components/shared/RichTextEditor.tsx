'use client';

import { useState, useRef, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Image as ImageIcon, 
  Link, 
  List, 
  ListOrdered,
  Quote,
  Code,
  Eye,
  Edit3
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onImageUpload?: (files: File[]) => Promise<string[]>;
  className?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "내용을 입력하세요...",
  onImageUpload,
  className = "",
  minHeight = "300px"
}: RichTextEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 선택된 텍스트 범위를 기억
  const getSelection = useCallback(() => {
    if (!textareaRef.current) return { start: 0, end: 0 };
    return {
      start: textareaRef.current.selectionStart,
      end: textareaRef.current.selectionEnd
    };
  }, []);

  // 텍스트 삽입/감싸기
  const wrapText = useCallback((before: string, after: string = '') => {
    if (!textareaRef.current) return;
    
    const { start, end } = getSelection();
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // 커서 위치 복원
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          start + before.length + selectedText.length + after.length,
          start + before.length + selectedText.length + after.length
        );
      }
    }, 0);
  }, [value, onChange, getSelection]);

  // 줄 시작에 텍스트 삽입
  const insertAtLineStart = useCallback((prefix: string) => {
    if (!textareaRef.current) return;
    
    const { start } = getSelection();
    const lines = value.split('\n');
    let currentPos = 0;
    let lineIndex = 0;
    
    // 현재 커서가 있는 줄 찾기
    for (let i = 0; i < lines.length; i++) {
      if (currentPos + lines[i].length >= start) {
        lineIndex = i;
        break;
      }
      currentPos += lines[i].length + 1;
    }
    
    lines[lineIndex] = prefix + lines[lineIndex];
    const newText = lines.join('\n');
    onChange(newText);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + prefix.length, start + prefix.length);
      }
    }, 0);
  }, [value, onChange, getSelection]);

  // 이미지 압축 함수
  const compressImage = useCallback((file: File, maxWidth: number = 400, quality: number = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // 이미지 크기 계산 (비율 유지하면서 최대 너비 제한)
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 이미지 그리기
        ctx!.drawImage(img, 0, 0, width, height);
        
        // Base64로 변환 (JPEG 형식으로 압축)
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Base64 크기가 너무 크면 품질을 더 낮춰서 재압축
        let currentQuality = quality;
        while (compressedDataUrl.length > 50000 && currentQuality > 0.1) { // 50KB 제한
          currentQuality -= 0.1;
          compressedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        }
        
        resolve(compressedDataUrl);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // 이미지 업로드 처리
  const handleImageUpload = useCallback(async (files: File[]) => {
    if (!onImageUpload || files.length === 0) {
      console.log('No onImageUpload handler or no files:', { onImageUpload: !!onImageUpload, filesLength: files.length });
      return;
    }
    
    console.log('Starting image upload:', files.length, 'files');
    
    try {
      // 이미지 파일만 필터링하고 압축
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      if (imageFiles.length === 0) {
        alert('이미지 파일만 업로드할 수 있습니다.');
        return;
      }
      
      // 파일 크기 체크 (10MB 제한)
      const maxSize = 10 * 1024 * 1024; // 10MB
      const oversizedFiles = imageFiles.filter(file => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        alert('파일 크기는 10MB를 초과할 수 없습니다.');
        return;
      }
      
      // 이미지 압축
      const compressedImages = await Promise.all(
        imageFiles.map(file => compressImage(file))
      );
      
      console.log('Image compression successful, count:', compressedImages.length);
      
      const imageMarkdown = compressedImages.map((url, index) => `![이미지 ${index + 1}](${url})`).join('\n');
      
      const { start } = getSelection();
      const newText = value.substring(0, start) + '\n' + imageMarkdown + '\n' + value.substring(start);
      console.log('Updated text with images');
      onChange(newText);
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('이미지 업로드에 실패했습니다.');
    }
  }, [onImageUpload, value, onChange, getSelection, compressImage]);

  // 파일 드롭 처리
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      handleImageUpload(files);
    }
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  // 마크다운을 HTML로 변환 (간단한 구현)
  const renderMarkdown = useCallback((text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li>$1. $2</li>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-2 rounded-lg border border-gray-200" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br>');
  }, []);

  const toolbarButtons = [
    { icon: Bold, action: () => wrapText('**', '**'), title: '굵게 (Ctrl+B)' },
    { icon: Italic, action: () => wrapText('*', '*'), title: '기울임 (Ctrl+I)' },
    { icon: Underline, action: () => wrapText('__', '__'), title: '밑줄' },
    { icon: Code, action: () => wrapText('`', '`'), title: '코드' },
    { icon: Quote, action: () => insertAtLineStart('> '), title: '인용' },
    { icon: List, action: () => insertAtLineStart('- '), title: '목록' },
    { icon: ListOrdered, action: () => insertAtLineStart('1. '), title: '번호 목록' },
    { 
      icon: ImageIcon, 
      action: () => fileInputRef.current?.click(), 
      title: '이미지 업로드' 
    },
    { 
      icon: Link, 
      action: () => {
        const url = prompt('링크 URL을 입력하세요:');
        if (url) {
          const text = prompt('링크 텍스트를 입력하세요:', url) || url;
          wrapText(`[${text}](${url})`, '');
        }
      }, 
      title: '링크' 
    }
  ];

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* 툴바 */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {toolbarButtons.map((button, index) => {
            const IconComponent = button.icon;
            return (
              <button
                key={index}
                type="button"
                onClick={button.action}
                title={button.title}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
              >
                <IconComponent className="w-4 h-4 text-gray-600" />
              </button>
            );
          })}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`flex items-center space-x-1 px-3 py-1 rounded transition-colors ${
              isPreviewMode ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isPreviewMode ? (
              <>
                <Edit3 className="w-4 h-4" />
                <span className="text-sm">편집</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span className="text-sm">미리보기</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 에디터 영역 */}
      <div className="relative">
        {!isPreviewMode ? (
          <>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`w-full p-4 resize-none border-none outline-none font-mono text-sm leading-6 ${
                dragOver ? 'bg-blue-50 border-blue-300' : 'bg-white'
              }`}
              style={{ minHeight }}
            />
            
            {dragOver && (
              <div className="absolute inset-0 bg-blue-100 bg-opacity-80 flex items-center justify-center border-2 border-dashed border-blue-400">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                  <p className="text-blue-700 font-medium">이미지를 드롭하세요</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div 
            className="p-4 prose prose-sm max-w-none"
            style={{ minHeight }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
          />
        )}

        {/* 숨겨진 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            if (e.target.files) {
              handleImageUpload(Array.from(e.target.files));
              e.target.value = ''; // 같은 파일 재선택 가능하도록
            }
          }}
          className="hidden"
        />
      </div>

      {/* 도움말 */}
      <div className="bg-gray-50 border-t border-gray-300 p-2 text-xs text-gray-500">
        <p>
          <strong>마크다운 지원:</strong> 
          **굵게**, *기울임*, __밑줄__, `코드`, &gt; 인용, - 목록, 1. 번호목록, [링크](url)
        </p>
        <p>
          <strong>이미지 업로드:</strong> 
          드래그 앤 드롭 또는 버튼 클릭 (최대 10MB, 400px로 자동 압축)
        </p>
      </div>
    </div>
  );
}