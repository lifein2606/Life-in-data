'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProducts, useApp, useMode } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { handleNumberInput } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronLeft, Edit2, Plus, Minus, Lock } from 'lucide-react';
import { PackageStock } from '@/types';
import { costCalculator } from '@/lib/storage';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const { products, getProductStock, updateProductStock } = useProducts();
  const { config, ingredients } = useApp();
  const { mode } = useMode();

  const [targetOutput, setTargetOutput] = useState<number>(0);
  const [stockEditMode, setStockEditMode] = useState(false);
  const [totalAvailable, setTotalAvailable] = useState<number>(0);
  const [packageCounts, setPackageCounts] = useState<Record<string, number>>({});

  // 是否处于编辑模式
  const isEditMode = mode === 'edit';

  // 获取产品
  const product = products.find((p) => p.id === productId);

  // 获取库存
  const stock = getProductStock(productId);

  // 初始化库存数据
  useEffect(() => {
    if (stock) {
      setTotalAvailable(stock.totalAvailable);
      const counts: Record<string, number> = {};
      stock.packages.forEach((pkg) => {
        counts[pkg.specId] = pkg.count;
      });
      setPackageCounts(counts);
      if (targetOutput === 0) {
        setTargetOutput(product?.standardOutput || 0);
      }
    } else if (product) {
      setTargetOutput(product.standardOutput);
    }
  }, [stock, product]);

  // 计算换算后的原料用量
  const scaledIngredients = useMemo(() => {
    if (!product || targetOutput <= 0) return [];
    return costCalculator.scaleIngredients(product, targetOutput);
  }, [product, targetOutput]);

  // 计算总成本
  const scaledCost = useMemo(() => {
    if (!product || targetOutput <= 0) return 0;
    const scale = targetOutput / product.standardOutput;
    return product.cost * scale;
  }, [product, targetOutput]);

  // 获取分类名称
  const getCategoryName = (categoryId: string) => {
    const cat = config.categories.find((c) => c.id === categoryId);
    return cat?.name || '未分类';
  };

  // 获取品牌名称
  const getBrandNames = (brandIds: string[]) => {
    return brandIds
      .map((id) => config.brands.find((b) => b.id === id)?.name)
      .filter(Boolean)
      .join(' / ');
  };

  // 获取包装规格名称
  const getSpecName = (specId: string) => {
    const spec = config.packageSpecs.find((s) => s.id === specId);
    return spec?.name || specId;
  };

  // 计算已装瓶合计
  const bottledTotal = useMemo(() => {
    let total = 0;
    Object.entries(packageCounts).forEach(([specId, count]) => {
      const spec = config.packageSpecs.find((s) => s.id === specId);
      if (spec) {
        total += spec.volume * count;
      }
    });
    return total;
  }, [packageCounts, config.packageSpecs]);

  // 计算剩余散量
  const looseAmount = useMemo(() => {
    return Math.max(0, totalAvailable - bottledTotal);
  }, [totalAvailable, bottledTotal]);

  // 处理编辑 - 只有编辑模式可用
  const handleEdit = () => {
    if (isEditMode) {
      router.push(`/products/${productId}/edit`);
    } else {
      // 返回首页进入编辑模式
      router.push('/');
    }
  };

  // 更新包装数量
  const updatePackageCount = (specId: string, delta: number) => {
    const newCount = Math.max(0, (packageCounts[specId] || 0) + delta);
    setPackageCounts({ ...packageCounts, [specId]: newCount });
  };

  // 保存库存（异步） - 查阅模式和编辑模式都可以操作
  const saveStock = async () => {
    if (totalAvailable < bottledTotal) {
      alert('总可用量不能小于已装瓶合计');
      return;
    }

    // 构建库存更新数据（新格式：specMl + quantity）
    const packages: Array<{ specMl: number; quantity: number }> = [];
    Object.entries(packageCounts).forEach(([specId, count]) => {
      if (count > 0) {
        const spec = config.packageSpecs.find((s) => s.id === specId);
        if (spec) {
          packages.push({
            specMl: spec.volume,
            quantity: count,
          });
        }
      }
    });

    await updateProductStock(productId, totalAvailable, packages);
    setStockEditMode(false);
  };

  // 获取原料产品包装规格（原料产品只显示散量）
  const isIngredientProduct = product?.isIngredientProduct;

  if (!product) {
    return (
      <div className="content-area-no-nav">
        <div className="mobile-header flex items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/products')}
            className="h-10 w-10"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold ml-2">产品详情</h1>
        </div>
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          产品不存在
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
            onClick={() => router.push('/products')}
            className="h-10 w-10"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold truncate max-w-[200px]">{product.name}</h1>
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
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{getCategoryName(product.category)}</Badge>
                {product.isIngredientProduct && (
                  <Badge className="bg-[var(--primary)] text-[var(--primary-foreground)]">
                    原料产品
                  </Badge>
                )}
              </div>
              <div className="text-sm text-[var(--muted-foreground)] mb-2">
                {getBrandNames(product.brands)}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm">出品标准</span>
                <span className="number-font text-[var(--primary)] font-medium">
                  {product.standardOutput}ml
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 用量换算 */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">用量换算</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm whitespace-nowrap">目标出品</span>
                <Input
                  type="number"
                  value={targetOutput}
                  onChange={(e) => setTargetOutput(Number(handleNumberInput(e.target.value, String(targetOutput))))}
                  className="bg-[var(--input)] number-font w-[120px]"
                  min={0}
                />
                <span className="text-sm">ml</span>
              </div>

              {scaledIngredients.length > 0 && (
                <div className="space-y-2">
                  {scaledIngredients.map((si) => (
                    <div
                      key={si.ingredientId}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--muted)]"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-sm truncate">{si.ingredientName}</span>
                        <div className="text-xs text-[var(--muted-foreground)] mt-1">
                          {si.methodName}
                          {si.scaledResultWeight !== undefined && (
                            <span className="ml-2">
                              → {si.scaledResultWeight.toFixed(1)}g
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="number-font text-sm text-[var(--primary)]">
                          {si.scaledAmount.toFixed(1)}{si.unit}
                        </span>
                        {si.operationCount !== undefined && (
                          <div className="text-xs text-[var(--muted-foreground)] mt-1">
                            {si.operationCount}次
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm">预估成本</span>
                <span className="number-font text-[var(--primary)] font-medium">
                  ¥{scaledCost.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 原料明细 */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">原料明细</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(product.ingredients || []).map((pi) => {
                const ingredient = ingredients.find((i) => i.id === pi.ingredientId);
                const lossRatio =
                  pi.resultWeight !== undefined && pi.inputAmount > 0
                    ? costCalculator.calculateLossRatio(pi.inputAmount, pi.resultWeight)
                    : undefined;

                return (
                  <div
                    key={pi.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--muted)]"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm truncate">{pi.ingredientName}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {pi.methodName}
                        </Badge>
                        {lossRatio !== undefined && (
                          <span className="text-xs text-[var(--warning)]">
                            损耗 {lossRatio.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="number-font text-sm">
                        {pi.inputAmount}{pi.inputUnit}
                      </span>
                      {pi.resultWeight !== undefined && (
                        <div className="text-xs text-[var(--muted-foreground)] mt-1">
                          → {pi.resultWeight}g
                        </div>
                      )}
                      {pi.lockStandard && (
                        <div className="text-xs text-[var(--muted-foreground)] mt-1">
                          固定: {pi.fixedInput}→{pi.fixedOutput}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* 包装方案 */}
          {!isIngredientProduct && product.packageSpecs.length > 0 && (
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">包装方案</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {(product.packageSpecs || []).map((specId) => (
                    <Badge key={specId} variant="outline">
                      {getSpecName(specId)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 库存管理 - 查阅模式和编辑模式都可以操作 */}
          <Card className="glass-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                {isIngredientProduct ? '库存散量' : '库存管理'}
              </CardTitle>
              {!isIngredientProduct && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (stockEditMode) {
                      saveStock();
                    } else {
                      setStockEditMode(true);
                    }
                  }}
                >
                  {stockEditMode ? '保存' : '编辑'}
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 总可用量 */}
              <div className="flex items-center justify-between">
                <span className="text-sm">总可用量</span>
                {stockEditMode || isIngredientProduct ? (
                  <Input
                    type="number"
                    value={totalAvailable}
                    onChange={(e) => setTotalAvailable(Number(handleNumberInput(e.target.value, String(totalAvailable))))}
                    className="bg-[var(--input)] number-font w-[100px] h-8 text-right"
                    min={0}
                  />
                ) : (
                  <span className="number-font">{totalAvailable}ml</span>
                )}
              </div>

              {/* 包装库存 - 非原料产品 */}
              {!isIngredientProduct && product.packageSpecs.length > 0 && (
                <div className="space-y-2">
                  <Separator />
                  <div className="text-sm text-[var(--muted-foreground)]">装瓶数量</div>
                  {product.packageSpecs.map((specId) => {
                    const spec = config.packageSpecs.find((s) => s.id === specId);
                    if (!spec) return null;
                    const count = packageCounts[specId] || 0;

                    return (
                      <div
                        key={specId}
                        className="flex items-center justify-between py-2"
                      >
                        <span className="text-sm">{spec.name}</span>
                        <div className="flex items-center gap-2">
                          {stockEditMode && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updatePackageCount(specId, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                          )}
                          <span className="number-font w-[40px] text-center">
                            {count}
                          </span>
                          {stockEditMode && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updatePackageCount(specId, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 汇计 */}
              <Separator />
              {!isIngredientProduct && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted-foreground)]">已装瓶合计</span>
                    <span className="number-font text-sm">{bottledTotal}ml</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted-foreground)]">剩余散量</span>
                    <span className="number-font text-sm text-[var(--primary)]">
                      {looseAmount}ml
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}