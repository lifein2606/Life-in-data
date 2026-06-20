'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMode } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Edit3, Eye, Lock, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { enterEditMode, enterViewMode } = useMode();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 点击编辑模式
  const handleEditMode = () => {
    setShowPasswordDialog(true);
    setPassword('');
    setPasswordError('');
  };

  // 点击查阅模式
  const handleViewMode = () => {
    enterViewMode();
    router.push('/products');
  };

  // 密码验证（异步）
  const handlePasswordSubmit = async () => {
    try {
      const success = await enterEditMode(password);
      if (success) {
        setShowPasswordDialog(false);
        setPassword('');
        setPasswordError('');
        router.push('/products');
      } else {
        setPasswordError('密码错误，请重新输入');
      }
    } catch (error) {
      console.error('进入编辑模式失败:', error);
      setPasswordError('系统错误，请稍后重试');
    }
  };

  return (
    <>
      {/* 首页 - 无底部导航栏 */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--background)]">
        {/* Logo区域 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--copper)] mb-6 shadow-lg">
            <span className="text-3xl font-bold text-[var(--primary-foreground)]">Li</span>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-[var(--foreground)]">Life in 鸡尾酒配方管理</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            配方 / 成本 / 库存管理工具
          </p>
        </div>

        {/* 模式选择按钮 */}
        <div className="w-full max-w-md space-y-4">
          {/* 编辑模式按钮 */}
          <Card
            className="glass-card cursor-pointer transition-all duration-300 hover:border-[var(--primary)] hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleEditMode}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--copper)] flex items-center justify-center">
                    <Edit3 className="h-6 w-6 text-[var(--primary-foreground)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">编辑模式</h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      需密码验证 · 可编辑配方
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-[var(--muted-foreground)]" />
              </div>
            </CardContent>
          </Card>

          {/* 查阅模式按钮 */}
          <Card
            className="glass-card cursor-pointer transition-all duration-300 hover:border-[var(--info)] hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleViewMode}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--muted)] flex items-center justify-center border border-[var(--border)]">
                    <Eye className="h-6 w-6 text-[var(--info)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">查阅模式</h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      无需密码 · 查看配方管理库存
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-[var(--muted-foreground)]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 底部提示 */}
        <div className="text-center mt-8 text-xs text-[var(--muted-foreground)]">
          <Lock className="h-3 w-3 inline-block mr-1 opacity-60" />
          编辑模式需全局密码验证
        </div>
      </div>

      {/* 密码验证弹窗 */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[320px] bg-[var(--popover)] border-[var(--border)]">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <Lock className="h-5 w-5 text-[var(--primary)]" />
              进入编辑模式
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="请输入管理密码"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              className="bg-[var(--input)]"
            />
            {passwordError && (
              <p className="text-sm text-[var(--destructive)] mt-2">{passwordError}</p>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              className="flex-1 bg-[var(--primary)] text-[var(--primary-foreground)]"
            >
              确认进入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}