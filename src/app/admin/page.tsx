'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/hooks/use-app';
import { PasswordDialog } from '@/components/password-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { GlobalConfig, PackageSpec, Brand, Category, Method } from '@/types';
import { generateId } from '@/lib/storage';

export default function AdminPage() {
  const router = useRouter();
  const { config, updateConfig, isAuthenticated } = useApp();
  const [showPasswordDialog, setShowPasswordDialog] = useState(!isAuthenticated);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  // 成功验证后刷新
  const handleAuthSuccess = () => {
    setShowPasswordDialog(false);
  };

  // 更新密码（异步）
  const handlePasswordChange = async () => {
    if (newPassword.trim()) {
      const newConfig = { ...config, password: newPassword.trim() };
      await updateConfig(newConfig);
      setNewPassword('');
      setShowPasswordChange(false);
    }
  };

  // 更新包装规格（异步）
  const updatePackageSpec = async (id: string, updates: Partial<PackageSpec>) => {
    const newSpecs = config.packageSpecs.map((spec) =>
      spec.id === id ? { ...spec, ...updates } : spec
    );
    await updateConfig({ ...config, packageSpecs: newSpecs });
  };

  const addPackageSpec = async () => {
    const newSpec: PackageSpec = {
      id: generateId(),
      name: '新规格',
      volume: 0,
      enabled: true,
    };
    await updateConfig({ ...config, packageSpecs: [...config.packageSpecs, newSpec] });
    setEditingItem(newSpec.id);
    setEditValue('新规格');
  };

  const deletePackageSpec = async (id: string) => {
    const newSpecs = config.packageSpecs.filter((spec) => spec.id !== id);
    await updateConfig({ ...config, packageSpecs: newSpecs });
  };

  // 更新品牌（异步）
  const updateBrand = async (id: string, updates: Partial<Brand>) => {
    const newBrands = config.brands.map((brand) =>
      brand.id === id ? { ...brand, ...updates } : brand
    );
    await updateConfig({ ...config, brands: newBrands });
  };

  const addBrand = async () => {
    const newBrand: Brand = {
      id: generateId(),
      name: '新品牌',
      enabled: true,
    };
    await updateConfig({ ...config, brands: [...config.brands, newBrand] });
    setEditingItem(newBrand.id);
    setEditValue('新品牌');
  };

  const deleteBrand = async (id: string) => {
    const newBrands = config.brands.filter((brand) => brand.id !== id);
    await updateConfig({ ...config, brands: newBrands });
  };

  // 更新分类（异步）
  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const newCategories = config.categories.map((cat) =>
      cat.id === id ? { ...cat, ...updates } : cat
    );
    await updateConfig({ ...config, categories: newCategories });
  };

  const addCategory = async () => {
    const newCategory: Category = {
      id: generateId(),
      name: '新分类',
      enabled: true,
    };
    await updateConfig({ ...config, categories: [...config.categories, newCategory] });
    setEditingItem(newCategory.id);
    setEditValue('新分类');
  };

  const deleteCategory = async (id: string) => {
    const newCategories = config.categories.filter((cat) => cat.id !== id);
    await updateConfig({ ...config, categories: newCategories });
  };

  // 更新制作方法（异步）
  const updateMethod = async (id: string, updates: Partial<Method>) => {
    const newMethods = config.methods.map((method) =>
      method.id === id ? { ...method, ...updates } : method
    );
    await updateConfig({ ...config, methods: newMethods });
  };

  const addMethod = async (hasLoss: boolean) => {
    const newMethod: Method = {
      id: generateId(),
      name: '新方法',
      hasLoss,
      enabled: true,
    };
    await updateConfig({ ...config, methods: [...config.methods, newMethod] });
    setEditingItem(newMethod.id);
    setEditValue('新方法');
  };

  const deleteMethod = async (id: string) => {
    const newMethods = config.methods.filter((method) => method.id !== id);
    await updateConfig({ ...config, methods: newMethods });
  };

  // 保存编辑（异步）
  const handleSaveEdit = async (type: 'spec' | 'brand' | 'category' | 'method') => {
    if (!editingItem || !editValue.trim()) return;

    switch (type) {
      case 'spec':
        await updatePackageSpec(editingItem, { name: editValue.trim() });
        break;
      case 'brand':
        await updateBrand(editingItem, { name: editValue.trim() });
        break;
      case 'category':
        await updateCategory(editingItem, { name: editValue.trim() });
        break;
      case 'method':
        await updateMethod(editingItem, { name: editValue.trim() });
        break;
    }
    setEditingItem(null);
    setEditValue('');
  };

  // 通用列表项渲染
  const renderListItem = (
    item: { id: string; name: string; enabled: boolean },
    type: 'spec' | 'brand' | 'category' | 'method',
    extra?: React.ReactNode
  ) => (
    <div
      key={item.id}
      className="flex items-center justify-between py-3 px-4 rounded-lg bg-[var(--muted)] group"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {editingItem === item.id ? (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="bg-[var(--input)] h-8 text-sm"
          />
        ) : (
          <span className="text-sm truncate">{item.name}</span>
        )}
        {extra}
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={item.enabled}
          onCheckedChange={(checked) => {
            switch (type) {
              case 'spec':
                updatePackageSpec(item.id, { enabled: checked });
                break;
              case 'brand':
                updateBrand(item.id, { enabled: checked });
                break;
              case 'category':
                updateCategory(item.id, { enabled: checked });
                break;
              case 'method':
                updateMethod(item.id, { enabled: checked });
                break;
            }
          }}
        />
        {editingItem === item.id ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleSaveEdit(type)}
            >
              <Check className="h-4 w-4 text-[var(--success)]" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setEditingItem(null);
                setEditValue('');
              }}
            >
              <X className="h-4 w-4 text-[var(--destructive)]" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100"
              onClick={() => {
                setEditingItem(item.id);
                setEditValue(item.name);
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100"
              onClick={() => {
                switch (type) {
                  case 'spec':
                    deletePackageSpec(item.id);
                    break;
                  case 'brand':
                    deleteBrand(item.id);
                    break;
                  case 'category':
                    deleteCategory(item.id);
                    break;
                  case 'method':
                    deleteMethod(item.id);
                    break;
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-[var(--destructive)]" />
            </Button>
          </>
        )}
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <PasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onSuccess={handleAuthSuccess}
        title="管理验证"
      />
    );
  }

  return (
    <div className="content-area-no-nav">
      {/* 顶部导航 */}
      <div className="mobile-header flex items-center justify-between px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/products')}
          className="h-10 w-10"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold">系统管理</h1>
        <div className="w-10" />
      </div>

      {/* 内容 */}
      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* 密码管理 */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">全局密码</CardTitle>
          </CardHeader>
          <CardContent>
            {showPasswordChange ? (
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="输入新密码"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[var(--input)]"
                />
                <Button
                  onClick={handlePasswordChange}
                  className="bg-[var(--primary)] text-[var(--primary-foreground)]"
                >
                  保存
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordChange(false)}
                >
                  取消
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowPasswordChange(true)}
                className="w-full"
              >
                修改密码
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 包装规格 */}
        <Card className="glass-card">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">包装规格</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={addPackageSpec}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {(config.packageSpecs || []).map((spec) =>
              renderListItem(spec, 'spec', (
                <Input
                  type="number"
                  value={spec.volume}
                  onChange={(e) => updatePackageSpec(spec.id, { volume: parseInt(e.target.value) || 0 })}
                  className="bg-[var(--input)] h-8 w-20 text-sm number-font"
                  placeholder="ml"
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* 售卖品牌 */}
        <Card className="glass-card">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">售卖品牌</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={addBrand}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {(config.brands || []).map((brand) => renderListItem(brand, 'brand'))}
          </CardContent>
        </Card>

        {/* 产品分类 */}
        <Card className="glass-card">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">产品分类</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={addCategory}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {(config.categories || []).map((cat) => renderListItem(cat, 'category'))}
          </CardContent>
        </Card>

        {/* 制作方法 */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">制作方法</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 无损耗 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--muted-foreground)]">无损耗</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => addMethod(false)}
                  className="h-6 w-6"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2">
                {(config.methods || []).filter((m) => !m.hasLoss).map((method) =>
                  renderListItem(method, 'method')
                )}
              </div>
            </div>

            <Separator />

            {/* 有损耗 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--muted-foreground)]">有损耗</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => addMethod(true)}
                  className="h-6 w-6"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2">
                {(config.methods || []).filter((m) => m.hasLoss).map((method) =>
                  renderListItem(method, 'method')
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}