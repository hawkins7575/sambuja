'use client';

import { 
  User, 
  MessageCircle, 
  HelpCircle, 
  Calendar, 
  Target,
  Home
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    id: 'home',
    label: '홈',
    icon: Home,
    href: '/',
  },
  {
    id: 'profile',
    label: '프로필',
    icon: User,
    href: '/profile',
  },
  {
    id: 'communication',
    label: '소통',
    icon: MessageCircle,
    href: '/communication',
  },
  {
    id: 'help',
    label: '도와주세요',
    icon: HelpCircle,
    href: '/help',
  },
  {
    id: 'schedule',
    label: '일정',
    icon: Calendar,
    href: '/schedule',
  },
  {
    id: 'goals',
    label: '목표',
    icon: Target,
    href: '/goals',
  },
];

export default function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 pb-safe">
      <div className="flex justify-around py-2 px-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'nav-item',
                isActive && 'active'
              )}
            >
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}