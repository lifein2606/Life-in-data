'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useIngredients, useApp, usePasswordAuth } from '@/hooks/use-app';
import { handleNumberInput } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { PasswordDialog } from '@/components/password-dialog';
import { ChevronLeft, Save } from 'lucide-react';

export default function IngredientEditPage() {
  const router = useRouter();
  const params = useParams();
  const ingredientId = params.id as string;
  const isEdit = ingredientId !== 'new';

  const { ingredients, addIngredient, updateIngredient, refreshData } = useIngredients();
  const { products, config } = useApp();
  const { isAuthenticated } = usePasswordAuth();

  const [showPasswordDialog, setShowPasswordDialog] = useState(!isAuthenticated && isEdit);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    purchaseSpec: '',
    purchasePrice: 0,
    purchasePriceInput: undefined as string | undefined,
    purchaseUnit: 'g',
    minUnit: 'g',
    source: 'purchase',
    relatedProductId: '',
  });

  useEffect(() => {
    if (isEdit && isAuthenticated) {
      const ingredient = (ingredients || []).find((i) => i.id === ingredientId);
      if (ingredient) {
        setFormData({
          name: ingredient.name,
          category: ingredient.category,
          purchaseSpec: ingredient.purchaseSpec,
          purchasePrice: ingredient.purchasePrice,
          purchasePriceInput: undefined,
          purchaseUnit: ingredient.purchaseUnit,
          minUnit: ingredient.minUnit,
          source: ingredient.source,
          relatedProductId: ingredient.relatedProductId || '',
        });
      }
    }
  }, [isEdit, ingredientId, isAuthenticated, ingredients]);

  const handleAuthSuccess = () => {
    setShowPasswordDialog(false);
    const ingredient = (ingredients || []).find((i) => i.id === ingredientId);
    if (ingredient) {
      setFormData({
        name: ingredient.name,
        category: ingredient.category,
        purchaseSpec: ingredient.purchaseSpec,
        purchasePrice: ingredient.purchasePrice,
        purchasePriceInput: undefined,
        purchaseUnit: ingredient.purchaseUnit,
        minUnit: ingredient.minUnit,
        source: ingredient.source,
        relatedProductId: ingredient.relatedProductId || '',
      });
    }
  };

  const previewMinUnitPrice = useMemo(() => {
    if (!formData.purchaseSpec || formData.purchasePrice === 0) return 0;
    const spec = formData.purchaseSpec.toLowerCase();
    let totalAmount = 0;
    let unitMultiplier = 1;

    if (formData.minUnit === 'g') {
      if (spec.includes('kg')) unitMultiplier = 1000;
    } else if (formData.minUnit === 'ml') {
      if (spec.includes('l') && !spec.includes('ml')) unitMultiplier = 1000;
    } else if (formData.minUnit === 'kg') {
      if (spec.includes('g') && !spec.includes('kg')) unitMultiplier = 0.001;
    } else if (formData.minUnit === 'L') {
      if (spec.includes('ml')) unitMultiplier = 0.001;
    }

    const match = spec.match(/(\d+(?:\.\d+)?)/);
    if (match) totalAmount = parseFloat(match[1]) * unitMultiplier;

    if (totalAmount === 0) return 0;
    return formData.purchasePrice / totalAmount;
  }, [formData.purchaseSpec, formData.purchasePrice, formData.minUnit]);

  const ingredientProducts = (products || []).filter((p) => p.isIngredientProduct);

  const categoryOptions = (config.ingredientCategories || []).filter((c) => c.enabled).map((cat) => ({
    value: cat.name,
    label: cat.name,
  }));

  const sourceOptions = (config.ingredientSources || []).filter((s) => s.enabled).map((src) => ({
    value: src.value,
    label: src.name,
  }));

  const unitOptions = (config.ingredientUnits || []).filter((u) => u.enabled).map((unit) => ({
    value: unit.value,
    label: unit.name,
  }));

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('请输入原料名称');
      return;
    }
    if (!formData.purchaseSpec.trim()) {
      alert('请输入进货规格');
      return;
    }
    if (formData.purchasePrice <= 0) {
      alert('请输入进货单价');
      return;
    }
    if (formData.source === 'internal' && !formData.relatedProductId) {
      alert('请选择关联产品');
      return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        await updateIngredient(ingredientId, {
          name: formData.name.trim(),
          category: formData.category,
          purchaseSpec: formData.purchaseSpec.trim(),
          purchasePrice: formData.purchasePrice,
          purchaseUnit: formData.purchaseUnit,
          minUnit: formData.minUnit,
          source: formData.source,
          relatedProductId: formData.relatedProductId,
        });
      } else {
        await addIngredient({
          name: formData.name.trim(),
          category: formData.category,
          purchaseSpec: formData.purchaseSpec.trim(),
          purchasePrice: formData.purchasePrice,
          purchaseUnit: formData.purchaseUnit,
          minUnit: formData.minUnit,
          source: formData.source,
          relatedProductId: formData.relatedProductId,
        });
      }
      await refreshData();
      router.push('/ingredients');
    } catch (error: any) {
      console.error('保存失败:', {
        message: error?.message,
        stack: error?.stack,
        formData: JSON.stringify(formData, null, 2),
      });
      alert(`保存失败: ${error?.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated && isEdit) {
    return (
      <PasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onSuccess={handleAuthSuccess}
        title="编辑验证"
      />
    );
  }

  return (
    <div className="content-area-no-nav">
      <div className="mobile-header flex items-center justify-between px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/ingredients')}
          className="h-10 w-10"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold">{isEdit ? '编辑原料' : '新建原料'}</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSubmit}
          disabled={loading}
          className="h-10 w-10"
        >
          <Save className="h-5 w-5 text-[var(--primary)]" />
        </Button>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>原料名称 *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-[var(--input)] mt-1"
                placeholder="如：伏特加"
              />
            </div>

            <div>
              <Label>分类 *</Label>
              <Combobox
                options={categoryOptions}
                value={formData.category}
                onChange={(v) => setFormData({ ...formData, category: v })}
                placeholder="选择分类"
                searchPlaceholder="搜索分类..."
                className="bg-[var(--input)] mt-1"
              />
            </div>

            <div>
              <Label>最小单位</Label>
              <Combobox
                options={unitOptions}
                value={formData.minUnit}
                onChange={(v) => {
                  const newUnit = v;
                  const specNum = formData.purchaseSpec.replace(/[^\d.]/g, '');
                  setFormData({
                    ...formData,
                    minUnit: newUnit,
                    purchaseSpec: specNum ? `${specNum}${newUnit}` : '',
                    purchaseUnit: newUnit,
                  });
                }}
                placeholder="选择单位"
                searchPlaceholder="搜索单位..."
                className="bg-[var(--input)] mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card mt-4">
          <CardHeader>
            <CardTitle className="text-base">进货信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>进货规格数量 *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="text"
                  inputMode="decimal"
                  value={formData.purchaseSpec.replace(/[^\d.]/g, '')}
                  onChange={(e) => {
                    const num = handleNumberInput(e.target.value, formData.purchaseSpec.replace(/[^\d.]/g, '')).replace(/[^\d.]/g, '');
                    setFormData({
                      ...formData,
                      purchaseSpec: num ? `${num}${formData.minUnit}` : '',
                      purchaseUnit: formData.minUnit,
                    });
                  }}
                  className="bg-[var(--input)] flex-1 number-font"
                  placeholder="如：500、1、750"
                  min={0}
                  step={0.01}
                />
                <div className="flex items-center px-3 bg-[var(--input)] rounded-md border border-[var(--border)] min-w-[60px] justify-center">
                  <span className="text-sm text-[var(--muted-foreground)]">{formData.minUnit}</span>
                </div>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                单位自动跟随最小单位选择
              </p>
            </div>

            <div>
              <Label>进货单价 (元) *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="text"
                  inputMode="decimal"
                  value={formData.purchasePriceInput ?? formData.purchasePrice?.toString() ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*\.?\d*$/.test(val) || val === '') {
                      setFormData({
                        ...formData,
                        purchasePriceInput: val,
                        purchasePrice: val ? parseFloat(val) : 0
                      });
                    }
                  }}
                  onBlur={() => {
                    const val = formData.purchasePriceInput;
                    if (val && !isNaN(parseFloat(val))) {
                      setFormData({
                        ...formData,
                        purchasePrice: parseFloat(val),
                        purchasePriceInput: undefined
                      });
                    }
                  }}
                  className="bg-[var(--input)] flex-1 number-font"
                  placeholder="0.00"
                />
                <div className="flex items-center px-3 bg-[var(--input)] rounded-md border border-[var(--border)] min-w-[80px] justify-center">
                  <span className="text-sm text-[var(--muted-foreground)]">元/{formData.purchaseSpec ? formData.minUnit : '-'}</span>
                </div>
              </div>
            </div>

            {previewMinUnitPrice > 0 && (
              <div className="text-sm text-[var(--muted-foreground)]">
                自动计算单价：¥{previewMinUnitPrice.toFixed(4)}/{formData.minUnit}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card mt-4">
          <CardHeader>
            <CardTitle className="text-base">来源设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>来源类型</Label>
              <Combobox
                options={sourceOptions}
                value={formData.source}
                onChange={(v) => setFormData({ ...formData, source: v })}
                placeholder="选择来源"
                searchPlaceholder="搜索..."
                className="w-[140px] bg-[var(--input)]"
              />
            </div>

            {formData.source === 'internal' && (
              <div>
                <Label>关联产品 *</Label>
                <Combobox
                  options={ingredientProducts.filter((p) => p.id).map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                  value={formData.relatedProductId}
                  onChange={(v) => setFormData({ ...formData, relatedProductId: v })}
                  placeholder="选择原料产品"
                  searchPlaceholder="搜索产品..."
                  className="bg-[var(--input)] mt-1"
                />
                {ingredientProducts.length === 0 && (
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    暂无原料产品，请先在产品库中创建原料产品
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
