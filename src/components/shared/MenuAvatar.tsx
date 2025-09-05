'use client';

import Image from 'next/image';

interface MenuAvatarProps {
  menuId: string;
  className?: string;
}

const getMenuAvatar = (menuId: string) => {
  switch (menuId) {
    case 'home':
      // 홈 - 세 명 모두 (작게)
      return (
        <div className="flex -space-x-1">
          <div className="w-3 h-3 rounded-full overflow-hidden border border-white">
            <Image src="/dad-avatar.png" alt="아빠" width={12} height={12} className="w-full h-full object-cover" />
          </div>
          <div className="w-3 h-3 rounded-full overflow-hidden border border-white">
            <Image src="/eldest-avatar.png" alt="짱남" width={12} height={12} className="w-full h-full object-cover" />
          </div>
          <div className="w-3 h-3 rounded-full overflow-hidden border border-white">
            <Image src="/youngest-avatar.png" alt="막둥이" width={12} height={12} className="w-full h-full object-cover" />
          </div>
        </div>
      );
    case 'profile':
      // 나에대해 - 세 명 모두
      return (
        <div className="flex -space-x-0.5">
          <div className="w-2.5 h-2.5 rounded-full overflow-hidden">
            <Image src="/dad-avatar.png" alt="아빠" width={10} height={10} className="w-full h-full object-cover" />
          </div>
          <div className="w-2.5 h-2.5 rounded-full overflow-hidden">
            <Image src="/eldest-avatar.png" alt="짱남" width={10} height={10} className="w-full h-full object-cover" />
          </div>
          <div className="w-2.5 h-2.5 rounded-full overflow-hidden">
            <Image src="/youngest-avatar.png" alt="막둥이" width={10} height={10} className="w-full h-full object-cover" />
          </div>
        </div>
      );
    case 'communication':
      // 소통 - 아빠 (주로 아빠가 소통을 리드)
      return (
        <div className="w-4 h-4 rounded-full overflow-hidden">
          <Image src="/dad-avatar.png" alt="아빠" width={16} height={16} className="w-full h-full object-cover" />
        </div>
      );
    case 'help':
      // SOS - 막둥이 (주로 도움 요청)
      return (
        <div className="w-4 h-4 rounded-full overflow-hidden">
          <Image src="/youngest-avatar.png" alt="막둥이" width={16} height={16} className="w-full h-full object-cover" />
        </div>
      );
    case 'schedule':
      // 일정 - 짱남 (학업, 일정 관리)
      return (
        <div className="w-4 h-4 rounded-full overflow-hidden">
          <Image src="/eldest-avatar.png" alt="짱남" width={16} height={16} className="w-full h-full object-cover" />
        </div>
      );
    case 'goals':
      // 목표 - 아빠 (목표 설정과 달성)
      return (
        <div className="w-4 h-4 rounded-full overflow-hidden">
          <Image src="/dad-avatar.png" alt="아빠" width={16} height={16} className="w-full h-full object-cover" />
        </div>
      );
    default:
      return (
        <div className="w-4 h-4 rounded-full overflow-hidden">
          <Image src="/dad-avatar.png" alt="가족" width={16} height={16} className="w-full h-full object-cover" />
        </div>
      );
  }
};

export default function MenuAvatar({ menuId, className = '' }: MenuAvatarProps) {
  return (
    <div className={className}>
      {getMenuAvatar(menuId)}
    </div>
  );
}