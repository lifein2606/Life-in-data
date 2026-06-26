'use client';

import { useRouter, useParams } from 'next/navigation';
import { useIngredients, useApp, useMode, useProducts } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  const { config } = useApp();
  const { products } = useProducts();
  const { mode } = useMode();

  const isEditMode = mode === 'edit';

  const ingredient = ingredients.find((i) => i.id === ingredientId);

  // 找到使用该原料的产品
  const linkedProducts = products.filter(
    (p) => p.ingredients && p.ingredients.some((pi) => pi.ingredientId === ingredientId)
  );

  // 获取来源标记
  const getSourceBadge = (source: string) => {
    if (source === 'self') {
      return <Badge className="bg-[var(--primary)] text-[var(--primary-foreground)] text-xs">自制</Badge>;
    }
    if (source === 'purchase') {
      return <Badge variant="outline" className="text-xs">外购</Badge>;
    }
    return null;
  };

  // 获取分类名称
  const getCategoryName = (categoryId: string) => {
    const cat = config.categories.find((c) => c.id === categoryId);
    return cat?.name || '未分类';
  };

  const handleEdit = () => {
    if (isEditMode) {
      router.push(`/ingredients/${ingredientId}/edit`);
    }
  };

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
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{getCategoryName(ingredient.category)}</Badge>
                {getSourceBadge(ingredient.source)}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">采购规格</span>
                  <span className="text-sm">{ingredient.purchaseSpec}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">采购单价</span>
                  <span className="number-font text-sm">¥{ingredient.purchasePrice.toFixed(2)}/{ingredient.purchaseUnit}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">最小单位成本</span>
                  <span className="number-font text-[var(--primary)] font-medium">
                    ¥{ingredient.minUnitPrice.toFixed(4)}/{ingredient.minUnit}
                  </span>
                </div>
              </div>

              {/* 酒精度 */}
              {ingredient.abv > 0 && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted-foreground)]">酒精度</span>
                    <span className="number-font text-[var(--primary)] font-medium">
                      {ingredient.abv}%
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 关联产品 */}
          {linkedProducts.length > 0 && (
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">关联产品</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {linkedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--muted)] cursor-pointer"
                    onClick={() => router.push(`/products/${p.id}`)}
                  >
                    <span className="text-sm">{p.name}</span>
                    <Badge variant="outline" className="text-xs">{getCategoryName(p.category)}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
