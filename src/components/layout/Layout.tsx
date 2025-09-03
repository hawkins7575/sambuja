'use client';

import { ReactNode } from 'react';
import Header from './Header';
import MobileNavigation from './MobileNavigation';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-28 md:pt-32 pb-20 md:pb-4">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      
      <MobileNavigation />
    </div>
  );
}