'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Wine, Beaker, Edit3, Eye, ClipboardList, Package } from 'lucide-react';
import { useMode } from '@/hooks/use-app';

export function BottomNav() {
  const pathname = usePathname();
  const { mode } = useMode();

  const navItems = [
    {
      path: '/products',
      label: '产品库',
      icon: Wine,
    },
    {
      path: '/ingredients',
      label: '原料库',
      icon: Beaker,
    },
    {
      path: '/tasks',
      label: '任务',
      icon: ClipboardList,
    },
    {
      path: '/batches',
      label: '批次',
      icon: Package,
    },
  ];

  // 判断是否显示底部导航：
  // 1. 首页不显示
  // 2. 编辑页/新建页/管理页不显示
  // 3. 只有进入模式后才显示（mode 存在）
  const isHomePage = pathname === '/';
  const isEditPage = pathname.includes('/edit') || pathname.includes('/new');
  const isAdminPage = pathname.includes('/admin');
  const shouldShowNav = !isHomePage && !isEditPage && !isAdminPage && mode;

  if (!shouldShowNav) return null;

  // 获取模式显示
  const getModeDisplay = () => {
    if (mode === 'edit') {
      return {
        text: '编辑模式',
        color: 'text-[var(--primary)]',
        icon: Edit3,
      };
    }
    if (mode === 'view') {
      return {
        text: '查阅模式',
        color: 'text-[var(--info)]',
        icon: Eye,
      };
    }
    return null;
  };

  const currentMode = getModeDisplay();

  return (
    <div className="mobile-nav flex items-center justify-between px-6">
      {/* 导航按钮 */}
      <div className="flex items-center gap-8">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'flex flex-col items-center gap-1 py-2 transition-colors',
                isActive
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--muted-foreground)]'
              )}
            >
              <Icon className={cn(
                'h-5 w-5',
                isActive && 'text-[var(--primary)]'
              )} />
              <span className={cn(
                'text-xs',
                isActive && 'font-medium text-[var(--primary)]'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* 当前模式状态 */}
      {currentMode && (
        <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--muted)]', currentMode.color)}>
          <currentMode.icon className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{currentMode.text}</span>
        </div>
      )}
    </div>
  );
}