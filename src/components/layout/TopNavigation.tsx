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

export default function TopNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 hidden md:block">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-8">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex items-center space-x-2 py-4 px-3 text-sm font-medium transition-colors border-b-2 border-transparent',
                  isActive 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-600 hover:text-blue-600 hover:border-blue-300'
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}