'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/hooks/use-app';
import { PasswordDialog } from '@/components/password-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Category, IngredientSource, IngredientUnit } from '@/types';
import { generateId } from '@/lib/storage';

export default function IngredientAdminPage() {
  const router = useRouter();
  const { config, updateConfig, isAuthenticated } = useApp();
  const [showPasswordDialog, setShowPasswordDialog] = useState(!isAuthenticated);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAuthSuccess = () => {
    setShowPasswordDialog(false);
  };

  // === 原料分类 ===
  const updateIngredientCategory = async (id: string, updates: Partial<Category>) => {
    const newCats = config.ingredientCategories.map((cat) =>
      cat.id === id ? { ...cat, ...updates } : cat
    );
    await updateConfig({ ...config, ingredientCategories: newCats });
  };

  const addIngredientCategory = async () => {
    const newCat: Category = {
      id: `icat-${Date.now()}`,
      name: '新分类',
      enabled: true,
    };
    await updateConfig({ ...config, ingredientCategories: [...config.ingredientCategories, newCat] });
    setEditingItem(newCat.id);
    setEditValue('新分类');
  };

  const deleteIngredientCategory = async (id: string) => {
    const newCats = config.ingredientCategories.filter((cat) => cat.id !== id);
    await updateConfig({ ...config, ingredientCategories: newCats });
  };

  // === 原料来源 ===
  const updateIngredientSource = async (id: string, updates: Partial<IngredientSource>) => {
    const newSources = config.ingredientSources.map((src) =>
      src.id === id ? { ...src, ...updates } : src
    );
    await updateConfig({ ...config, ingredientSources: newSources });
  };

  const addIngredientSource = async () => {
    const newSrc: IngredientSource = {
      id: `isrc-${Date.now()}`,
      name: '新来源',
      value: `source-${Date.now()}`,
      enabled: true,
    };
    await updateConfig({ ...config, ingredientSources: [...config.ingredientSources, newSrc] });
    setEditingItem(newSrc.id);
    setEditValue('新来源');
  };

  const deleteIngredientSource = async (id: string) => {
    const newSources = config.ingredientSources.filter((src) => src.id !== id);
    await updateConfig({ ...config, ingredientSources: newSources });
  };

  // === 原料单位 ===
  const updateIngredientUnit = async (id: string, updates: Partial<IngredientUnit>) => {
    const newUnits = config.ingredientUnits.map((unit) =>
      unit.id === id ? { ...unit, ...updates } : unit
    );
    await updateConfig({ ...config, ingredientUnits: newUnits });
  };

  const addIngredientUnit = async () => {
    const newUnit: IngredientUnit = {
      id: `iunit-${Date.now()}`,
      name: '新单位',
      value: `unit-${Date.now()}`,
      enabled: true,
    };
    await updateConfig({ ...config, ingredientUnits: [...config.ingredientUnits, newUnit] });
    setEditingItem(newUnit.id);
    setEditValue('新单位');
  };

  const deleteIngredientUnit = async (id: string) => {
    const newUnits = config.ingredientUnits.filter((unit) => unit.id !== id);
    await updateConfig({ ...config, ingredientUnits: newUnits });
  };

  // 保存编辑
  const handleSaveEdit = async (type: 'category' | 'source' | 'unit') => {
    if (!editingItem || !editValue.trim()) return;

    switch (type) {
      case 'category':
        await updateIngredientCategory(editingItem, { name: editValue.trim() });
        break;
      case 'source':
        await updateIngredientSource(editingItem, { name: editValue.trim(), value: editValue.trim() });
        break;
      case 'unit':
        await updateIngredientUnit(editingItem, { name: editValue.trim(), value: editValue.trim() });
        break;
    }
    setEditingItem(null);
    setEditValue('');
  };

  // 通用列表项渲染
  const renderListItem = (
    item: { id: string; name: string; enabled: boolean },
    type: 'category' | 'source' | 'unit',
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
              case 'category':
                updateIngredientCategory(item.id, { enabled: checked });
                break;
              case 'source':
                updateIngredientSource(item.id, { enabled: checked });
                break;
              case 'unit':
                updateIngredientUnit(item.id, { enabled: checked });
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
                  case 'category':
                    deleteIngredientCategory(item.id);
                    break;
                  case 'source':
                    deleteIngredientSource(item.id);
                    break;
                  case 'unit':
                    deleteIngredientUnit(item.id);
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
          onClick={() => router.push('/ingredients')}
          className="h-10 w-10"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold">原料库设置</h1>
        <div className="w-10" />
      </div>

      {/* 内容 */}
      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* 原料分类 */}
        <Card className="glass-card">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">原料分类</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={addIngredientCategory}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {(config.ingredientCategories || []).map((cat) => renderListItem(cat, 'category'))}
          </CardContent>
        </Card>

        {/* 原料来源 */}
        <Card className="glass-card">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">原料来源</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={addIngredientSource}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {(config.ingredientSources || []).map((src) => renderListItem(src, 'source'))}
          </CardContent>
        </Card>

        {/* 原料单位 */}
        <Card className="glass-card">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">原料单位</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={addIngredientUnit}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {(config.ingredientUnits || []).map((unit) => renderListItem(unit, 'unit'))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
