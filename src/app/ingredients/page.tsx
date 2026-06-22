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
import { Plus, Search, Settings, ChevronRight, Trash2, Lock, Home } from 'lucide-react';

// 原料分类从config读取，不再硬编码

export default function IngredientsPage() {
  const router = useRouter();
  const { ingredients, deleteIngredient, refreshData } = useIngredients();
  const { products, config } = useApp();
  const { mode, exitMode } = useMode();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const isEditMode = mode === 'edit';

  // 每次页面挂载或获得焦点时刷新数据，确保编辑后列表同步
  useEffect(() => {
    refreshData();
    const handleFocus = () => refreshData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshData]);

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
    return (products || []).some((p) => 
      (p.ingredients || []).some((i) => i.ingredientId === id)
    );
  };

  const handleClick = (id: string) => {
    if (isEditMode) {
      router.push(\`/ingredients/\${id}/edit\`);
    } else {
      router.push(\`/ingredients/\${id}\`);
    }
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditMode) {
      router.push(\`/ingredients/\${id}/edit\`);
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
            {/* 管理按钮 - 跳转到原料库专属设置页 */}
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
            {/* 新建按钮 */}
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
          </div>
        </div>

        <div className="px-4 space-y-3">
          {filteredIngredients.length === 0 ? (
            <div className="text-center py-12 text-[var(--muted-foreground)]">
              {search || categoryFilter !== 'all' ? '未找到匹配的原料' : '暂无原料，点击右上角 + 添加'}
            </div>
          ) : (
            filteredIngredients.map((ingredient) => (
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
            ))
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
