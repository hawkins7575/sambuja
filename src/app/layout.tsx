import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Layout from '@/components/layout/Layout';
import FirebaseProvider from '@/components/providers/FirebaseProvider';

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
  themeColor: '#22c55e'
};

export const metadata: Metadata = {
  title: "삼부자 - 가족 소통 플랫폼",
  description: "아빠와 아들들을 위한 특별한 소통 공간",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }
    ],
    shortcut: '/icons/icon-192x192.png'
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
    "msapplication-TileColor": "#22c55e",
    "msapplication-TileImage": "/icons/icon-144x144.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Service Worker 임시 비활성화 */}
        {/*
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `
        }} />
        */}
      </head>
      <body className={`${notoSansKR.variable} font-sans antialiased min-h-screen-mobile`}>
        <FirebaseProvider>
          <Layout>
            {children}
          </Layout>
        </FirebaseProvider>
      </body>
    </html>
  );
}
