import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/hooks/use-app';
import { BottomNav } from '@/components/bottom-nav';

export const metadata: Metadata = {
  title: {
    default: 'Life in 鸡尾酒配方管理',
    template: '%s | Life in',
  },
  description: '鸡尾酒配方管理系统，专业的配方、成本、库存管理工具',
  keywords: ['鸡尾酒', '配方管理', '成本计算', '库存管理', 'Life in'],
  authors: [{ name: 'Life in' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased safe-top safe-bottom">
        <AppProvider>
          {children}
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}