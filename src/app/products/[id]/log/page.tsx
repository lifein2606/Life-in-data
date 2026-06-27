'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProducts, useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { handleNumberInput } from '@/lib/utils';
import { ChevronLeft, Save } from 'lucide-react';
import { ProductionStep, ProductionLog } from '@/types';
import { productionLogStorage } from '@/lib/storage';

export default function ProductionLogPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const { products, ingredients } = useApp();
  const { config } = useApp();

  // 出品标准量
  const [targetOutput, setTargetOutput] = useState<number>(0);
  // 数字输入显示值缓存
  const [numDisplays, setNumDisplays] = useState<Record<string, string>>({});
  const numVal = (key: string, fallback: number | undefined | null) =>
    key in numDisplays ? numDisplays[key] : (fallback != null && fallback !== 0 ? String(fallback) : '');
  const setNumVal = (key: string, val: string) =>
    setNumDisplays(prev => ({ ...prev, [key]: val }));

  // 实际投入量 key: ingredientId (如果同一步骤有多个相同原料，用 index 区分)
  const [actualIngredients, setActualIngredients] = useState<Record<string, number>>({});
  // 实际步骤结果液重 key: stepIndex
  const [actualStepResults, setActualStepResults] = useState<Record<number, number>>({});
  // 实际成品出品量
  const [actualFinalOutput, setActualFinalOutput] = useState<number>(0);
  // 制作人
  const [maker, setMaker] = useState('');
  // 制作时间
  const [logDate, setLogDate] = useState('');
  const [logTime, setLogTime] = useState('');

  // 保存状态
  const [saving, setSaving] = useState(false);

  // 获取产品
  const product = products.find((p) => p.id === productId);

  // 初始化时间为当前时间
  useEffect(() => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);
    setLogDate(dateStr);
    setLogTime(timeStr);
  }, []);

  // 计算缩放比例
  const scale = useMemo(() => {
    if (!product || targetOutput <= 0) return 0;
    return targetOutput / product.standardOutput;
  }, [product, targetOutput]);

  // 获取分类名称
  const getCategoryName = (categoryId: string) => {
    const cat = config.categories.find((c) => c.id === categoryId);
    return cat?.name || '未分类';
  };

  // 计算标准成本（按目标出品量缩放）
  const standardCost = useMemo(() => {
    if (!product || targetOutput <= 0) return 0;
    const baseCost = (product.costManualOverride && product.manualCost !== undefined)
      ? product.manualCost
      : product.cost;
    return baseCost * scale;
  }, [product, scale]);

  // 计算实际成本
  const actualCost = useMemo(() => {
    let total = 0;
    const steps: ProductionStep[] = product?.steps || [];
    
    steps.forEach((step) => {
      step.ingredients.forEach((si, siIdx) => {
        const key = `${step.id}_${siIdx}`;
        const actualAmount = actualIngredients[key] ?? 0;
        const ingredient = ingredients.find((i) => i.id === si.ingredientId);
        if (ingredient) {
          total += actualAmount * ingredient.minUnitPrice;
        }
      });
    });
    
    return total;
  }, [product, actualIngredients, ingredients]);

  // 计算成本差异百分比
  const costDiff = useMemo(() => {
    if (standardCost <= 0) return 0;
    return ((actualCost - standardCost) / standardCost) * 100;
  }, [actualCost, standardCost]);

  // 保存制作记录
  const handleSave = async () => {
    if (!product) return;
    
    // 验证必填字段
    if (!maker.trim()) {
      alert('请填写制作人');
      return;
    }
    if (targetOutput <= 0) {
      alert('请填写出品标准量');
      return;
    }
    if (actualFinalOutput <= 0) {
      alert('请填写实际成品出品量');
      return;
    }

    setSaving(true);
    try {
      // 组合制作时间
      const logDateTime = new Date(`${logDate}T${logTime}`);
      const timestamp = logDateTime.getTime();

      // 构建原料记录
      const steps: ProductionStep[] = product.steps || [];
      const ingredientLogs: ProductionLog['ingredients'] = [];
      
      steps.forEach((step) => {
        step.ingredients.forEach((si, siIdx) => {
          const key = `${step.id}_${siIdx}`;
          const plannedAmount = si.inputAmount * scale;
          const actualAmount = actualIngredients[key] ?? 0;
          ingredientLogs.push({
            ingredientId: si.ingredientId,
            ingredientName: si.ingredientName,
            unit: si.inputUnit,
            plannedAmount,
            actualAmount,
          });
        });
      });

      // 构建步骤结果记录
      const stepResultLogs: ProductionLog['stepResults'] = [];
      steps.forEach((step, idx) => {
        if (step.resultWeight && step.resultWeight > 0) {
          stepResultLogs.push({
            stepIndex: idx,
            methodName: step.methodName,
            plannedResultWeight: step.resultWeight * scale,
            actualResultWeight: actualStepResults[idx] ?? 0,
          });
        }
      });

      const log: ProductionLog = {
        id: `log-${Date.now()}`,
        timestamp,
        maker: maker.trim(),
        targetOutput,
        ingredients: ingredientLogs,
        stepResults: stepResultLogs,
        actualFinalOutput,
        actualCost,
        standardCost,
      };

      await productionLogStorage.add(productId, log);
      alert('制作记录已保存');
      router.push(`/products/${productId}`);
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-lg font-semibold ml-2">填写制作记录</h1>
        </div>
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          产品不存在
        </div>
      </div>
    );
  }

  const steps: ProductionStep[] = product.steps || [];

  return (
    <div className="content-area-no-nav">
      {/* 顶部导航 */}
      <div className="mobile-header flex items-center justify-between px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/products/${productId}`)}
          className="h-10 w-10"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold truncate max-w-[200px]">填写制作记录</h1>
        <div className="w-10" />
      </div>

      {/* 内容 */}
      <div className="px-4 py-6 pb-20 space-y-4 max-w-lg mx-auto overflow-y-auto">
        {/* 产品信息 */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{product.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Badge variant="outline">{getCategoryName(product.category)}</Badge>
              <span>标准出品: {product.standardOutput}ml</span>
            </div>
          </CardHeader>
        </Card>

        {/* 出品标准 */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">出品标准</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Label className="text-sm whitespace-nowrap">本次出品量</Label>
              <Input
                type="text"
                value={numVal('targetOutput', targetOutput)}
                onChange={(e) => {
                  const val = handleNumberInput(e.target.value, numVal('targetOutput', targetOutput));
                  setNumVal('targetOutput', val);
                  setTargetOutput(parseFloat(val) || 0);
                }}
                className="bg-[var(--input)] number-font flex-1 h-9"
                placeholder="输入出品量(ml)"
              />
              <span className="text-sm text-[var(--muted-foreground)]">ml</span>
            </div>
          </CardContent>
        </Card>

        {/* 原料投入 */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">原料投入</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {targetOutput > 0 && steps.length > 0 ? (
              steps.map((step, stepIdx) => (
                <div key={step.id} className="space-y-3">
                  <div className="text-xs text-[var(--muted-foreground)] font-medium border-l-2 border-[var(--primary)] pl-2">
                    步骤{stepIdx + 1}: {step.methodName}
                  </div>
                  {step.ingredients.map((si, siIdx) => {
                    const key = `${step.id}_${siIdx}`;
                    const plannedAmount = si.inputAmount * scale;
                    return (
                      <div key={key} className="flex items-center gap-2 pl-4">
                        <span className="text-sm w-24 truncate">{si.ingredientName}</span>
                        <span className="text-xs text-[var(--muted-foreground)] w-20">
                          计划: {plannedAmount.toFixed(1)}
                        </span>
                        <Input
                          type="text"
                          value={numVal(`actual_${key}`, actualIngredients[key])}
                          onChange={(e) => {
                            const val = handleNumberInput(e.target.value, numVal(`actual_${key}`, actualIngredients[key]));
                            setNumVal(`actual_${key}`, val);
                            setActualIngredients(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));
                          }}
                          className="bg-[var(--input)] number-font flex-1 h-8 text-sm"
                          placeholder="实际投入"
                        />
                        <span className="text-xs text-[var(--muted-foreground)]">{si.inputUnit}</span>
                      </div>
                    );
                  })}
                </div>
              ))
            ) : targetOutput > 0 && product.ingredients.length > 0 ? (
              // 降级：旧数据没有 steps，使用 ingredients
              product.ingredients.map((pi, idx) => {
                const plannedAmount = pi.inputAmount * scale;
                const key = `legacy_${idx}`;
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-sm w-24 truncate">{pi.ingredientName}</span>
                    <span className="text-xs text-[var(--muted-foreground)] w-20">
                      计划: {plannedAmount.toFixed(1)}
                    </span>
                    <Input
                      type="text"
                      value={numVal(`actual_${key}`, actualIngredients[key])}
                      onChange={(e) => {
                        const val = handleNumberInput(e.target.value, numVal(`actual_${key}`, actualIngredients[key]));
                        setNumVal(`actual_${key}`, val);
                        setActualIngredients(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));
                      }}
                      className="bg-[var(--input)] number-font flex-1 h-8 text-sm"
                      placeholder="实际投入"
                    />
                    <span className="text-xs text-[var(--muted-foreground)]">{pi.inputUnit}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                {targetOutput <= 0 ? '请先填写出品标准量' : '暂无原料'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* 步骤结果液重（有损耗的步骤） */}
        {steps.some((step) => step.resultWeight && step.resultWeight > 0) && targetOutput > 0 && (
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">步骤结果液重</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.map((step, idx) => {
                if (!step.resultWeight || step.resultWeight <= 0) return null;
                const scaledResultWeight = step.resultWeight * scale;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="text-sm font-medium">{step.methodName}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--muted-foreground)] w-20">
                        计划: {scaledResultWeight.toFixed(1)}g
                      </span>
                      <Input
                        type="text"
                        value={numVal(`step_${idx}`, actualStepResults[idx])}
                        onChange={(e) => {
                          const val = handleNumberInput(e.target.value, numVal(`step_${idx}`, actualStepResults[idx]));
                          setNumVal(`step_${idx}`, val);
                          setActualStepResults(prev => ({ ...prev, [idx]: parseFloat(val) || 0 }));
                        }}
                        className="bg-[var(--input)] number-font flex-1 h-8 text-sm"
                        placeholder="实际结果液重"
                      />
                      <span className="text-xs text-[var(--muted-foreground)]">g</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* 实际成品出品量 */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">成品出品</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Label className="text-sm whitespace-nowrap">实际出品量</Label>
              <Input
                type="text"
                value={numVal('actualFinalOutput', actualFinalOutput)}
                onChange={(e) => {
                  const val = handleNumberInput(e.target.value, numVal('actualFinalOutput', actualFinalOutput));
                  setNumVal('actualFinalOutput', val);
                  setActualFinalOutput(parseFloat(val) || 0);
                }}
                className="bg-[var(--input)] number-font flex-1 h-9"
                placeholder="实际成品出品量"
              />
              <span className="text-sm text-[var(--muted-foreground)]">ml</span>
            </div>
          </CardContent>
        </Card>

        {/* 成本对比 */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">成本分析</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted-foreground)]">标准成本</span>
              <span className="number-font text-[var(--primary)] font-medium">
                ¥{standardCost.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted-foreground)]">实际成本</span>
              <span className="number-font text-[var(--primary)] font-medium">
                ¥{actualCost.toFixed(2)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm">成本差异</span>
              <div className="flex items-center gap-2">
                {standardCost > 0 && actualCost > 0 && (
                  <>
                    <span
                      className={`number-font font-medium ${
                        costDiff > 0 ? 'text-red-500' : costDiff < 0 ? 'text-green-500' : 'text-[var(--muted-foreground)]'
                      }`}
                    >
                      {costDiff > 0 ? '+' : ''}{costDiff.toFixed(1)}%
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {costDiff > 0 ? '超出标准' : costDiff < 0 ? '低于标准' : '与标准持平'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 制作信息 */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">制作信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Label className="text-sm whitespace-nowrap">制作人</Label>
              <Input
                type="text"
                value={maker}
                onChange={(e) => setMaker(e.target.value)}
                className="bg-[var(--input)] flex-1 h-9"
                placeholder="填写制作人姓名"
              />
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-sm whitespace-nowrap">制作时间</Label>
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="bg-[var(--input)] flex-1 h-9"
                />
                <Input
                  type="time"
                  value={logTime}
                  onChange={(e) => setLogTime(e.target.value)}
                  className="bg-[var(--input)] w-24 h-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 保存按钮 */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-11"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? '保存中...' : '保存此次制作记录'}
        </Button>
      </div>
    </div>
  );
}
