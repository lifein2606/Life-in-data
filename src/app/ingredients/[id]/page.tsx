'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useIngredients, useApp, useMode } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronLeft, Edit2, Lock } from 'lucide-react';

export default function IngredientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ingredientId = params.id as string;

  const { ingredients } = useIngredients();
  const { products, config } = useApp();
  const { mode } = useMode();

  // 是否处于编辑模式
  const isEditMode = mode === 'edit';

  // 获取原料
  const ingredient = ingredients.find((i) => i.id === ingredientId);

  // 获取分类名称
  const getCategoryName = (category: string) => {
    return category;
  };

  // 获取关联产品名称
  const getLinkedProductName = (productId: string | undefined) => {
    if (!productId) return null;
    const product = products.find((p) => p.id === productId);
    return product?.name || '未知产品';
  };

  // 处理编辑
  const handleEdit = () => {
    if (isEditMode) {
      router.push(`/ingredients/${ingredientId}/edit`);
    }
    // 查阅模式下不跳转，只显示提示
  };

  // 如果原料不存在
  if (!ingredient) {
    return (
      <div className="content-area-no-nav">
        <div className="mobile-header flex items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/ingredients')}
            className="h-10 w-10"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold ml-2">原料详情</h1>
        </div>
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          原料不存在
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
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
          <h1 className="text-lg font-semibold truncate max-w-[200px]">{ingredient.name}</h1>
          {/* 编辑按钮 - 只有编辑模式显示 */}
          {isEditMode ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEdit}
              className="h-10 w-10"
            >
              <Edit2 className="h-5 w-5 text-[var(--primary)]" />
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEdit}
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

        {/* 内容 */}
        <div className="px-4 py-6 pb-20 space-y-4 max-w-lg mx-auto overflow-y-auto">
          {/* 基本信息 */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">{getCategoryName(ingredient.category)}</Badge>
                <Badge 
                  variant="secondary" 
                  className={ingredient.source === 'purchase' ? '' : 'bg-[var(--primary)] text-[var(--primary-foreground)]'}
                >
                  {ingredient.source === 'purchase' ? '采购' : '内部生产'}
                </Badge>
              </div>
              {ingredient.source === 'internal' && ingredient.relatedProductId && (
                <div className="text-sm text-[var(--muted-foreground)] mb-2">
                  关联产品: {getLinkedProductName(ingredient.relatedProductId)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 进货信息 - 采购原料 */}
          {ingredient.source === 'purchase' && (
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">进货信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">进货规格</span>
                  <span className="text-sm">{ingredient.purchaseSpec || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">进货单价</span>
                  <span className="number-font text-sm">
                    ¥{ingredient.purchasePrice?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">最小单位</span>
                  <span className="text-sm">{ingredient.minUnit || '-'}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                  <span className="text-sm font-medium">最小单位单价</span>
                  <span className="number-font text-[var(--primary)] font-medium">
                    ¥{ingredient.minUnitPrice?.toFixed(4) || '0.0000'}/{ingredient.minUnit}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 成本信息 - 内部生产原料 */}
          {ingredient.source === 'internal' && (
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">成本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">最小单位</span>
                  <span className="text-sm">{ingredient.minUnit || 'ml'}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                  <span className="text-sm font-medium">最小单位单价</span>
                  <span className="number-font text-[var(--primary)] font-medium">
                    ¥{ingredient.minUnitPrice?.toFixed(4) || '0.0000'}/{ingredient.minUnit || 'ml'}
                  </span>
                </div>
                <div className="text-xs text-[var(--muted-foreground)] mt-2">
                  * 成本由关联产品的配方计算得出
                </div>
              </CardContent>
            </Card>
          )}

          {/* 使用记录 */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">使用记录</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const usedProducts = products.filter((p) => 
                  (p.ingredients || []).some((i) => i.ingredientId === ingredientId)
                );
                if (usedProducts.length === 0) {
                  return (
                    <div className="text-sm text-[var(--muted-foreground)]">
                      未被任何产品使用
                    </div>
                  );
                }
                return (
                  <div className="space-y-2">
                    {usedProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--muted)]"
                      >
                        <span className="text-sm truncate">{p.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {config.categories.find((c) => c.id === p.category)?.name || '未分类'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}