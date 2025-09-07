import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Layout from '@/components/layout/Layout';
import FirebaseProvider from '@/components/providers/FirebaseProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import PWAUpdater from '@/components/PWAUpdater';

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0ea5e9'
};

export const metadata: Metadata = {
  title: "삼부자 - 가족 소통 플랫폼",
  description: "아빠와 아들들을 위한 특별한 소통 공간",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/dad-avatar.png', sizes: '192x192', type: 'image/png' },
      { url: '/dad-avatar.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/dad-avatar.png', sizes: '152x152', type: 'image/png' },
      { url: '/dad-avatar.png', sizes: '192x192', type: 'image/png' }
    ],
    shortcut: '/dad-avatar.png'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "삼부자"
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "삼부자",
    "apple-mobile-web-app-title": "삼부자",
    "apple-mobile-web-app-status-bar-style": "default",
    "msapplication-TileColor": "#0ea5e9",
    "msapplication-TileImage": "/dad-avatar.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.variable} font-sans antialiased min-h-screen-mobile`}>
        <PWAUpdater />
        <ErrorBoundary>
          <ToastProvider>
            <FirebaseProvider>
              <Layout>
                {children}
              </Layout>
            </FirebaseProvider>
          </ToastProvider>
        </ErrorBoundary>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Mobile input text color fallback
              function fixMobileInputColors() {
                const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent);
                if (isMobile) {
                  const inputs = document.querySelectorAll('input, textarea, select');
                  inputs.forEach((input) => {
                    input.style.setProperty('color', '#111827', 'important');
                    input.style.setProperty('-webkit-text-fill-color', '#111827', 'important');
                    input.style.setProperty('background-color', '#ffffff', 'important');
                  });
                }
              }
              
              // Run on load and when new elements are added
              document.addEventListener('DOMContentLoaded', fixMobileInputColors);
              
              // Observer for dynamic content
              if (typeof MutationObserver !== 'undefined') {
                const observer = new MutationObserver((mutations) => {
                  mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                      setTimeout(fixMobileInputColors, 100);
                    }
                  });
                });
                
                observer.observe(document.body, {
                  childList: true,
                  subtree: true
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
