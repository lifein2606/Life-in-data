'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePasswordAuth } from '@/hooks/use-app';

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  title?: string;
}

export function PasswordDialog({
  open,
  onOpenChange,
  onSuccess,
  title = '请输入密码',
}: PasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { authenticate } = usePasswordAuth();

  const handleSubmit = async () => {
    const success = await authenticate(password);
    if (success) {
      setPassword('');
      setError('');
      onSuccess();
    } else {
      setError('密码错误，请重新输入');
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[300px] bg-[var(--popover)] border-[var(--border)]">
        <DialogHeader>
          <DialogTitle className="text-center">{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            type="password"
            placeholder="请输入管理密码"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            className="bg-[var(--input)]"
          />
          {error && <p className="text-sm text-[var(--destructive)] mt-2">{error}</p>}
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-[var(--primary)] text-[var(--primary-foreground)]"
          >
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 密码验证包装组件
interface WithPasswordProps {
  children: (onOpen: () => void) => React.ReactNode;
  onSuccess: () => void;
}

export function WithPassword({ children, onSuccess }: WithPasswordProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { isAuthenticated } = usePasswordAuth();

  const handleClick = () => {
    if (isAuthenticated) {
      onSuccess();
    } else {
      setDialogOpen(true);
    }
  };

  return (
    <>
      {children(handleClick)}
      <PasswordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          setDialogOpen(false);
          onSuccess();
        }}
      />
    </>
  );
}