'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIngredients, useApp, useMode } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Combobox } from '@/components/ui/combobox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Plus, Search, Settings, ChevronRight, Trash2, Lock, Home, List, LayoutGrid } from 'lucide-react';

export default function IngredientsPage() {
  const router = useRouter();
  const { ingredients, deleteIngredient, refreshData } = useIngredients();
  const { products, config } = useApp();
  const { mode, exitMode } = useMode();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // 视图模式状态（默认列表模式）
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const isEditMode = mode === 'edit';

  useEffect(() => {
    refreshData();
    const handleFocus = () => refreshData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshData]);

  // 从 localStorage 读取视图偏好
  useEffect(() => {
    const savedMode = localStorage.getItem('ingredients-view-mode');
    if (savedMode === 'list' || savedMode === 'grid') {
      setViewMode(savedMode);
    }
  }, []);

  // 保存视图偏好到 localStorage
  const handleViewModeChange = (mode: 'list' | 'grid') => {
    setViewMode(mode);
    localStorage.setItem('ingredients-view-mode', mode);
  };

  const handleGoHome = () => {
    exitMode();
    router.push('/');
  };

  const filteredIngredients = useMemo(() => {
    return (ingredients || []).filter((ingredient) => {
      const matchSearch = ingredient.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'all' || ingredient.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [ingredients, search, categoryFilter]);

  const isUsed = (id: string) => {
    return (products || []).some((p) => {
      // 检查新的 steps 结构
      if (p.steps && p.steps.length > 0) {
        return p.steps.some((step) => 
          step.ingredients.some((si) => si.ingredientId === id)
        );
      }
      // 兼容旧的 ingredients 结构
      return (p.ingredients || []).some((i) => i.ingredientId === id);
    });
  };

  const handleClick = (id: string) => {
    if (isEditMode) {
      router.push(`/ingredients/${id}/edit`);
    } else {
      router.push(`/ingredients/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (isUsed(id)) {
      alert('该原料已被产品使用，无法删除');
      return;
    }
    if (isEditMode) {
      if (confirm('确定要删除该原料吗？')) {
        await deleteIngredient(id);
      }
    } else {
      router.push('/');
    }
  };

  const handleAdd = () => {
    if (isEditMode) {
      router.push('/ingredients/new/edit');
    }
  };

  const getSourceBadge = (source: string) => {
    const sourceConfig = (config.ingredientSources || []).find((s) => s.value === source);
    const label = sourceConfig ? sourceConfig.name : source;
    if (source === 'purchase') {
      return <Badge variant="secondary" className="text-xs">{label}</Badge>;
    }
    return <Badge className="bg-[var(--primary)] text-[var(--primary-foreground)] text-xs">{label}</Badge>;
  };

  // 渲染列表模式下的原料卡片
  const renderListCard = (ingredient: any) => (
    <Card
      key={ingredient.id}
      className="glass-card group cursor-pointer"
      onClick={() => handleClick(ingredient.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{ingredient.name}</h3>
              {getSourceBadge(ingredient.source)}
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Badge variant="outline" className="text-xs">{ingredient.category}</Badge>
              <span className="truncate">{ingredient.purchaseSpec}</span>
              {ingredient.abv > 0 && (
                <span className="text-xs text-[var(--primary)]">{ingredient.abv}% ABV</span>
              )}
            </div>
            <div className="mt-2 text-sm number-font text-[var(--primary)]">
              ¥{ingredient.minUnitPrice.toFixed(4)}/{ingredient.minUnit}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isEditMode && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(ingredient.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <ChevronRight className="h-5 w-5 text-[var(--muted-foreground)]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // 渲染网格模式下的原料卡片
  const renderGridCard = (ingredient: any) => (
    <Card
      key={ingredient.id}
      className="glass-card group cursor-pointer overflow-hidden"
      onClick={() => handleClick(ingredient.id)}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-medium text-sm truncate flex-1">{ingredient.name}</h3>
          {getSourceBadge(ingredient.source)}
        </div>
        <div className="space-y-1">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{ingredient.category}</Badge>
          <div className="text-[10px] text-[var(--muted-foreground)] truncate">
            {ingredient.purchaseSpec}
          </div>
          {ingredient.abv > 0 && (
            <div className="text-[10px] text-[var(--primary)]">
              {ingredient.abv}% ABV
            </div>
          )}
          <div className="text-[10px] number-font text-[var(--primary)]">
            ¥{ingredient.minUnitPrice.toFixed(4)}/{ingredient.minUnit}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <TooltipProvider>
      <div className="content-area">
        <div className="mobile-header flex items-center justify-between px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoHome}
            className="h-10 px-2 gap-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <Home className="h-4 w-4" />
            <span className="text-sm">首页</span>
          </Button>

          <h1 className="text-lg font-semibold absolute left-1/2 -translate-x-1/2">原料库</h1>

          <div className="flex items-center gap-2">
            {isEditMode ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/ingredients/admin')}
                className="h-10 w-10"
              >
                <Settings className="h-5 w-5" />
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push('/ingredients/admin')}
                    className="h-10 w-10 opacity-50"
                  >
                    <Lock className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>需要进入编辑模式才能操作</p>
                </TooltipContent>
              </Tooltip>
            )}
            {isEditMode ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAdd}
                className="h-10 w-10"
              >
                <Plus className="h-5 w-5" />
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleAdd}
                    className="h-10 w-10 opacity-50"
                  >
                    <Lock className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>需要进入编辑模式才能操作</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        <div className="px-4 pt-4 pb-3 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <Input
                placeholder="搜索原料..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-[var(--input)]"
              />
            </div>
            <Combobox
              options={[
                { value: 'all', label: '全部' },
                ...(config.ingredientCategories || []).filter((c) => c.enabled).map((cat) => ({
                  value: cat.name,
                  label: cat.name,
                })),
              ]}
              value={categoryFilter}
              onChange={setCategoryFilter}
              placeholder="分类"
              searchPlaceholder="搜索分类..."
              className="w-[120px] bg-[var(--input)]"
            />
            {/* 视图切换按钮 */}
            <div className="flex items-center border border-[var(--border)] rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => handleViewModeChange('list')}
                className={`p-1.5 ${viewMode === 'list' ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--accent)]'}`}
                title="列表视图"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('grid')}
                className={`p-1.5 ${viewMode === 'grid' ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--accent)]'}`}
                title="网格视图"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className={viewMode === 'grid' ? 'px-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3' : 'px-4 space-y-3'}>
          {filteredIngredients.length === 0 ? (
            <div className={viewMode === 'grid' ? 'col-span-full text-center py-12 text-[var(--muted-foreground)]' : 'text-center py-12 text-[var(--muted-foreground)]'}>
              {search || categoryFilter !== 'all' ? '未找到匹配的原料' : '暂无原料，点击右上角 + 添加'}
            </div>
          ) : (
            filteredIngredients.map((ingredient) =>
              viewMode === 'grid' ? renderGridCard(ingredient) : renderListCard(ingredient)
            )
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
