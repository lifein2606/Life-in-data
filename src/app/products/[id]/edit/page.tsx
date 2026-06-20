'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProducts, useApp, usePasswordAuth } from '@/hooks/use-app';
import { handleNumberInput } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { PasswordDialog } from '@/components/password-dialog';
import { ChevronLeft, Save, Plus, Trash2 } from 'lucide-react';
import { ProductIngredient, Method } from '@/types';
import { generateId, dependencyChecker } from '@/lib/storage';

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const isEdit = productId !== 'new';

  const { products, addProduct, updateProduct, refreshData } = useProducts();
  const { config, ingredients } = useApp();
  const { isAuthenticated } = usePasswordAuth();

  const [showPasswordDialog, setShowPasswordDialog] = useState(!isAuthenticated && isEdit);
  const [loading, setLoading] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brands: [] as string[],
    standardOutput: 500,
    ingredients: [] as ProductIngredient[],
    packageSpecs: [] as string[],
    isIngredientProduct: false,
  });

  // 加载已有数据
  useEffect(() => {
    if (isEdit && isAuthenticated) {
      const product = (products || []).find((p) => p.id === productId);
      if (product) {
        setFormData({
          name: product.name,
          category: product.category,
          brands: product.brands,
          standardOutput: product.standardOutput,
          ingredients: product.ingredients || [],
          packageSpecs: product.packageSpecs || [],
          isIngredientProduct: product.isIngredientProduct,
        });
      }
    }
  }, [isEdit, productId, isAuthenticated, products]);

  // 成功验证后加载数据
  const handleAuthSuccess = () => {
    setShowPasswordDialog(false);
    const product = (products || []).find((p) => p.id === productId);
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        brands: product.brands,
        standardOutput: product.standardOutput,
        ingredients: product.ingredients || [],
        packageSpecs: product.packageSpecs || [],
        isIngredientProduct: product.isIngredientProduct,
      });
    }
  };

  // 计算成本预览
  const previewCost = useMemo(() => {
    let total = 0;
    for (const pi of formData.ingredients) {
      const ingredient = (ingredients || []).find((i) => i.id === pi.ingredientId);
      if (ingredient) {
        total += pi.inputAmount * ingredient.minUnitPrice;
      }
    }
    return total;
  }, [formData.ingredients, ingredients]);

  // 启用的分类
  const enabledCategories = config.categories.filter((c) => c.enabled);
  // 启用的品牌
  const enabledBrands = config.brands.filter((b) => b.enabled);
  // 启用的包装规格
  const enabledSpecs = config.packageSpecs.filter((s) => s.enabled);
  // 启用的制作方法
  const enabledMethods = config.methods.filter((m) => m.enabled);

  // 添加原料及操作
  const addIngredientItem = () => {
    const newItem: ProductIngredient = {
      id: generateId(),
      ingredientId: '',
      ingredientName: '',
      inputAmount: 0,
      inputUnit: 'g',
      method: '',
      methodName: '',
      lockStandard: false,
    };
    setFormData({
      ...formData,
      ingredients: [...(formData.ingredients || []), newItem],
    });
  };

  // 更新原料及操作
  const updateIngredientItem = (id: string, updates: Partial<ProductIngredient>) => {
    const newIngredients = (formData.ingredients || []).map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setFormData({ ...formData, ingredients: newIngredients });
  };

  // 删除原料及操作
  const removeIngredientItem = (id: string) => {
    setFormData({
      ...formData,
      ingredients: (formData.ingredients || []).filter((item) => item.id !== id),
    });
  };

  // 更新品牌选择
  const updateBrandSelection = (brandId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        brands: [...formData.brands, brandId],
      });
    } else {
      setFormData({
        ...formData,
        brands: formData.brands.filter((id) => id !== brandId),
      });
    }
  };

  // 更新包装规格选择
  const updateSpecSelection = (specId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        packageSpecs: [...formData.packageSpecs, specId],
      });
    } else {
      setFormData({
        ...formData,
        packageSpecs: formData.packageSpecs.filter((id) => id !== specId),
      });
    }
  };

  // 计算损耗比例
  const calculateLossRatio = (input: number, result: number) => {
    if (input <= 0) return 0;
    return ((input - result) / input) * 100;
  };

  // 提交表单（异步）
  const handleSubmit = async () => {
    // 验证
    if (!formData.name.trim()) {
      alert('请输入产品名称');
      return;
    }
    if (!formData.category) {
      alert('请选择产品分类');
      return;
    }
    if (!formData.isIngredientProduct && formData.brands.length === 0) {
      alert('请选择售卖品牌');
      return;
    }
    if (formData.standardOutput <= 0) {
      alert('请输入出品总量标准');
      return;
    }
    if (formData.ingredients.length === 0) {
      alert('请添加原料及操作');
      return;
    }
    
    // 验证原料及操作
    for (const pi of formData.ingredients || []) {
      if (!pi.ingredientId) {
        alert('请为所有原料选择关联原料');
        return;
      }
      if (pi.inputAmount <= 0) {
        alert('请输入所有原料的投入量');
        return;
      }
      if (!pi.method) {
        alert('请为所有原料选择操作方式');
        return;
      }
      
      const method = config.methods.find((m) => m.id === pi.method);
      if (method?.hasLoss && !pi.resultWeight) {
        alert('有损耗操作必须填写结果液重');
        return;
      }
      
      if (pi.lockStandard) {
        if (!pi.fixedInput || pi.fixedInput <= 0) {
          alert('锁定标准时必须填写固定投入量');
          return;
        }
        if (method?.hasLoss && (!pi.fixedOutput || pi.fixedOutput <= 0)) {
          alert('锁定标准且有损耗时必须填写固定结果液重');
          return;
        }
      }
    }

    // 循环依赖检测（如果勾选原料产品）
    if (formData.isIngredientProduct) {
      for (const pi of formData.ingredients) {
        if (dependencyChecker.hasCircularDependency(productId, pi.ingredientId, products)) {
          alert('存在循环依赖，请检查原料关联');
          return;
        }
      }
    }

    setLoading(true);

    try {
      if (isEdit) {
        await updateProduct(productId, {
          name: formData.name.trim(),
          category: formData.category,
          brands: formData.brands,
          standardOutput: formData.standardOutput,
          ingredients: formData.ingredients,
          packageSpecs: formData.packageSpecs,
          isIngredientProduct: formData.isIngredientProduct,
        });
      } else {
        await addProduct({
          name: formData.name.trim(),
          category: formData.category,
          brands: formData.brands,
          standardOutput: formData.standardOutput,
          ingredients: formData.ingredients,
          packageSpecs: formData.packageSpecs,
          isIngredientProduct: formData.isIngredientProduct,
        });
      }
      // 显式调用 refreshData 确保数据刷新完成
      await refreshData();
      router.push('/products');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
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
    <div className="content-area-no-nav pb-6">
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
        <h1 className="text-lg font-semibold">{isEdit ? '编辑产品' : '新建产品'}</h1>
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

      {/* 表单 */}
      <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
        {/* 基本信息 */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>产品名称 *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-[var(--input)] mt-1"
                placeholder="如：莫吉托"
              />
            </div>

            <div>
              <Label>产品分类 *</Label>
              <Combobox
                options={enabledCategories.filter((cat) => cat.id).map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                }))}
                value={formData.category}
                onChange={(v) => setFormData({ ...formData, category: v })}
                placeholder="选择分类"
                searchPlaceholder="搜索分类..."
                className="bg-[var(--input)] mt-1"
              />
            </div>

            {!formData.isIngredientProduct && (
              <div>
                <Label>售卖品牌 *</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {enabledBrands.filter((brand) => brand.id).map((brand) => (
                    <button
                      key={brand.id}
                      type="button"
                      className={`inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-150 touch-manipulation ${
                        formData.brands.includes(brand.id)
                          ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent'
                          : 'bg-transparent text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--accent)]'
                      }`}
                      onClick={() => updateBrandSelection(brand.id, !formData.brands.includes(brand.id))}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label>出品总量标准</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={formData.standardOutput}
                  onChange={(e) => {
                    const val = handleNumberInput(e.target.value, String(formData.standardOutput));
                    setFormData({ ...formData, standardOutput: parseInt(val) || 0 });
                  }}
                  className="bg-[var(--input)] number-font w-[100px]"
                />
                <span className="text-sm">ml</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>原料产品</Label>
              <Switch
                checked={formData.isIngredientProduct}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isIngredientProduct: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* 原料及操作 */}
        <Card className="glass-card">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">原料及操作 *</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={addIngredientItem}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {(formData.ingredients || []).length === 0 ? (
              <div className="text-center py-4 text-[var(--muted-foreground)]">
                点击右上角 + 添加原料
              </div>
            ) : (
              (formData.ingredients || []).map((pi, index) => {
                const ingredient = (ingredients || []).find((i) => i.id === pi.ingredientId);
                const method = config.methods.find((m) => m.id === pi.method);
                const lossRatio = pi.resultWeight
                  ? calculateLossRatio(pi.inputAmount, pi.resultWeight)
                  : 0;

                return (
                  <div key={pi.id} className="space-y-3 p-3 rounded-lg bg-[var(--muted)]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">原料 {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeIngredientItem(pi.id)}
                        className="h-7 w-7"
                      >
                        <Trash2 className="h-4 w-4 text-[var(--destructive)]" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">原料</Label>
                        <Combobox
                          options={ingredients.filter((ing) => ing.id).map((ing) => ({
                            value: ing.id,
                            label: `${ing.name} (${ing.category})`,
                          }))}
                          value={pi.ingredientId}
                          onChange={(v) => {
                            const ing = (ingredients || []).find((i) => i.id === v);
                            updateIngredientItem(pi.id, {
                              ingredientId: v,
                              ingredientName: ing?.name || '',
                              inputUnit: ing?.minUnit || 'g',
                            });
                          }}
                          placeholder="选择原料"
                          searchPlaceholder="搜索原料..."
                          className="bg-[var(--input)] mt-1 h-9"
                          popoverClassName="max-h-[200px]"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">投入量</Label>
                        <div className="flex items-center gap-1 mt-1">
                          <Input
                            type="text"
                            value={pi.inputAmount}
                            onChange={(e) => {
                              const val = handleNumberInput(e.target.value, String(pi.inputAmount));
                              updateIngredientItem(pi.id, { inputAmount: parseFloat(val) || 0 })
                            }}
                            className="bg-[var(--input)] number-font h-9"
                          />
                          <span className="text-xs">{pi.inputUnit}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">操作方式</Label>
                      <Combobox
                        options={[
                          ...enabledMethods.filter((m) => !m.hasLoss && m.id).map((m) => ({
                            value: m.id,
                            label: `${m.name} (无损耗)`,
                          })),
                          ...enabledMethods.filter((m) => m.hasLoss && m.id).map((m) => ({
                            value: m.id,
                            label: `${m.name} (有损耗)`,
                          })),
                        ]}
                        value={pi.method}
                        onChange={(v) => {
                          const m = config.methods.find((m) => m.id === v);
                          updateIngredientItem(pi.id, {
                            method: v,
                            methodName: m?.name || '',
                            // 切换到无损耗时清空结果液重
                            resultWeight: m?.hasLoss ? pi.resultWeight : undefined,
                          });
                        }}
                        placeholder="选择操作"
                        searchPlaceholder="搜索操作方式..."
                        className="bg-[var(--input)] mt-1 h-9"
                        popoverClassName="max-h-[200px]"
                      />
                    </div>

                    {/* 有损耗时显示结果液重 */}
                    {method?.hasLoss && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">结果液重</Label>
                          <Input
                            type="text"
                            value={pi.resultWeight || ''}
                            onChange={(e) => {
                              const val = handleNumberInput(e.target.value, String(pi.resultWeight || 0));
                              updateIngredientItem(pi.id, { resultWeight: parseFloat(val) || undefined })
                            }}
                            className="bg-[var(--input)] number-font mt-1 h-9"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">损耗比例</Label>
                          <div className="text-sm number-font text-[var(--warning)] mt-2">
                            {lossRatio.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 锁定每次标准 */}
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">锁定每次标准</Label>
                      <Switch
                        checked={pi.lockStandard}
                        onCheckedChange={(checked) =>
                          updateIngredientItem(pi.id, { lockStandard: checked })
                        }
                      />
                    </div>

                    {pi.lockStandard && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">固定投入量</Label>
                          <Input
                            type="text"
                            value={pi.fixedInput || ''}
                            onChange={(e) => {
                              const val = handleNumberInput(e.target.value, String(pi.fixedInput || 0));
                              updateIngredientItem(pi.id, { fixedInput: parseFloat(val) || undefined })
                            }}
                            className="bg-[var(--input)] number-font mt-1 h-9"
                          />
                        </div>
                        {method?.hasLoss && (
                          <div>
                            <Label className="text-xs">固定结果液重</Label>
                            <Input
                              type="text"
                              value={pi.fixedOutput || ''}
                              onChange={(e) => {
                                const val = handleNumberInput(e.target.value, String(pi.fixedOutput || 0));
                                updateIngredientItem(pi.id, { fixedOutput: parseFloat(val) || undefined })
                              }}
                              className="bg-[var(--input)] number-font mt-1 h-9"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {previewCost > 0 && (
              <Separator />
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted-foreground)]">成本预览</span>
              <span className="number-font text-[var(--primary)] font-medium">
                ¥{previewCost.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 包装方案 - 非原料产品 */}
        {!formData.isIngredientProduct && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">包装方案</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {enabledSpecs.filter((spec) => spec.id).map((spec) => (
                  <button
                    key={spec.id}
                    type="button"
                    className={`inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-150 touch-manipulation ${
                      formData.packageSpecs.includes(spec.id)
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent'
                        : 'bg-transparent text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--accent)]'
                    }`}
                    onClick={() => updateSpecSelection(spec.id, !formData.packageSpecs.includes(spec.id))}
                  >
                    {spec.name}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}