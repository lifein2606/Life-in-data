'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProducts, useApp, usePasswordAuth } from '@/hooks/use-app';
import { handleNumberInput } from '@/lib/utils';
import { calculateProductABV, checkMissingABV } from '@/lib/storage';
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
import { Combobox, ComboboxOption, MultiCombobox } from '@/components/ui/combobox';
import { PasswordDialog } from '@/components/password-dialog';
import { ChevronLeft, Save, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { ProductIngredient, ProductionStep, StepIngredient, Method, OperationPlanInstance } from '@/types';
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
  // 数字输入显示值缓存（保留小数点输入中间状态）
  const [numDisplays, setNumDisplays] = useState<Record<string, string>>({});
  const numVal = (key: string, fallback: number | undefined | null) =>
    key in numDisplays ? numDisplays[key] : (fallback != null && fallback !== 0 ? String(fallback) : '');
  const setNumVal = (key: string, val: string) =>
    setNumDisplays(prev => ({ ...prev, [key]: val }));

  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brands: [] as string[],
    standardOutput: 500,
    standardOutputUnit: 'ml' as 'ml' | 'g' | 'L' | 'kg',
    ingredients: [] as ProductIngredient[],  // 保留用于兼容
    steps: [] as ProductionStep[],           // 新的步骤分组结构
    packageSpecs: [] as string[],
    isIngredientProduct: false,
    operationPlans: [] as OperationPlanInstance[], // 具体操作方案
    abv: 0,
    abvManualOverride: false,
    costManualOverride: false,
    manualCost: undefined as number | undefined,
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
          standardOutputUnit: product.standardOutputUnit || 'ml',
          ingredients: product.ingredients || [],
          steps: product.steps || [],
          packageSpecs: product.packageSpecs || [],
          isIngredientProduct: product.isIngredientProduct,
          operationPlans: product.operationPlans || [],
          abv: product.abv || 0,
          abvManualOverride: product.abvManualOverride || false,
          costManualOverride: product.costManualOverride || false,
          manualCost: product.manualCost,
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
        standardOutputUnit: product.standardOutputUnit || 'ml',
        ingredients: product.ingredients || [],
        steps: product.steps || [],
        packageSpecs: product.packageSpecs || [],
        isIngredientProduct: product.isIngredientProduct,
        operationPlans: product.operationPlans || [],
        abv: product.abv || 0,
        abvManualOverride: product.abvManualOverride || false,
        costManualOverride: product.costManualOverride || false,
        manualCost: product.manualCost,
      });
    }
  };

  // 计算 ABV（自动）
  const calculatedABV = useMemo(() => {
    if (formData.steps.length === 0) return 0;
    return calculateProductABV(formData.steps, ingredients || []);
  }, [formData.steps, ingredients]);

  // 检查 ABV 是否完整
  const abvStatus = useMemo(() => {
    if (formData.steps.length === 0) return { hasAlcoholic: false, allFilled: true };
    return checkMissingABV(formData.steps, ingredients || []);
  }, [formData.steps, ingredients]);

  // 实际显示的 ABV
  const displayABV = formData.abvManualOverride ? formData.abv : (calculatedABV > 0 ? calculatedABV : formData.abv);

  // 成本预览
  const previewCost = useMemo(() => {
    let total = 0;
    
    // 优先使用 steps 计算成本
    if (formData.steps.length > 0) {
      for (const step of formData.steps) {
        for (const si of step.ingredients) {
          const ingredient = (ingredients || []).find((i) => i.id === si.ingredientId);
          if (ingredient) {
            total += si.inputAmount * ingredient.minUnitPrice;
          }
        }
      }
    } else {
      // 降级使用 ingredients
      for (const pi of formData.ingredients) {
        const ingredient = (ingredients || []).find((i) => i.id === pi.ingredientId);
        if (ingredient) {
          total += pi.inputAmount * ingredient.minUnitPrice;
        }
      }
    }
    return total;
  }, [formData.steps, formData.ingredients, ingredients]);

  // 启用的分类
  const enabledCategories = config.categories.filter((c) => c.enabled);
  // 启用的品牌
  const enabledBrands = config.brands.filter((b) => b.enabled);
  // 启用的包装规格
  const enabledSpecs = config.packageSpecs.filter((s) => s.enabled);
  // 启用的制作方法
  const enabledMethods = config.methods.filter((m) => m.enabled);

  // 获取同类单位选项（容量组：ml/L，重量组：g/kg）
  const getUnitOptions = (currentUnit: string): { value: string; label: string }[] => {
    if (currentUnit === 'ml' || currentUnit === 'L') {
      return [
        { value: 'ml', label: 'ml（毫升）' },
        { value: 'L', label: 'L（升）' },
      ];
    }
    if (currentUnit === 'g' || currentUnit === 'kg') {
      return [
        { value: 'g', label: 'g（克）' },
        { value: 'kg', label: 'kg（千克）' },
      ];
    }
    // 默认返回容量组
    return [
      { value: 'ml', label: 'ml（毫升）' },
      { value: 'L', label: 'L（升）' },
    ];
  };

  // 获取原料的默认单位（基于关联原料产品的standardOutputUnit）
  const getIngredientDefaultUnit = (ingredientId: string): 'ml' | 'g' | 'L' | 'kg' => {
    const ing = (ingredients || []).find(i => i.id === ingredientId);
    if (ing?.relatedProductId) {
      const relatedProduct = products.find(p => p.id === ing.relatedProductId);
      if (relatedProduct?.standardOutputUnit) {
        return relatedProduct.standardOutputUnit;
      }
    }
    // 兜底：使用原料的minUnit，如果不属于四种单位则默认ml
    const minUnit = ing?.minUnit || 'g';
    if (['ml', 'g', 'L', 'kg'].includes(minUnit)) {
      return minUnit as 'ml' | 'g' | 'L' | 'kg';
    }
    return 'ml';
  };

  // ========== 步骤相关操作 ==========

  // 添加步骤
  const addStep = () => {
    const newStep: ProductionStep = {
      id: generateId(),
      method: '',
      methodName: '',
      ingredients: [],
      lockStandard: false,
    };
    setFormData({
      ...formData,
      steps: [...formData.steps, newStep],
    });
  };

  // 更新步骤
  const updateStep = (stepId: string, updates: Partial<ProductionStep>) => {
    const newSteps = formData.steps.map((step) =>
      step.id === stepId ? { ...step, ...updates } : step
    );
    setFormData({ ...formData, steps: newSteps });
  };

  // 删除步骤
  const removeStep = (stepId: string) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((step) => step.id !== stepId),
    });
  };

  // 添加步骤内的原料
  const addStepIngredient = (stepId: string) => {
    const newIngredient: StepIngredient = {
      id: generateId(),
      ingredientId: '',
      ingredientName: '',
      inputAmount: 0,
      inputUnit: 'ml',
      unit: 'ml',
    };
    const newSteps = formData.steps.map((step) =>
      step.id === stepId
        ? { ...step, ingredients: [...step.ingredients, newIngredient] }
        : step
    );
    setFormData({ ...formData, steps: newSteps });
  };

  // 更新步骤内的原料
  const updateStepIngredient = (stepId: string, ingredientId: string, updates: Partial<StepIngredient>) => {
    const newSteps = formData.steps.map((step) =>
      step.id === stepId
        ? {
            ...step,
            ingredients: step.ingredients.map((ing) =>
              ing.id === ingredientId ? { ...ing, ...updates } : ing
            ),
          }
        : step
    );
    setFormData({ ...formData, steps: newSteps });
  };

  // 删除步骤内的原料
  const removeStepIngredient = (stepId: string, ingredientId: string) => {
    const newSteps = formData.steps.map((step) =>
      step.id === stepId
        ? { ...step, ingredients: step.ingredients.filter((ing) => ing.id !== ingredientId) }
        : step
    );
    setFormData({ ...formData, steps: newSteps });
  };

  // 获取方法的 hasLoss 属性
  const getMethodHasLoss = (methodId: string): boolean => {
    const method = config.methods.find((m) => m.id === methodId);
    return method?.hasLoss || false;
  };

  // ========== 兼容模式：原料相关操作 ==========

  // 添加原料及操作（兼容旧数据迁移）
  const addIngredientItem = () => {
    const newItem: ProductIngredient = {
      id: generateId(),
      ingredientId: '',
      ingredientName: '',
      inputAmount: 0,
      inputUnit: 'ml',
      unit: 'ml',
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

  // 手动设置 ABV
  const handleManualABVChange = (value: number) => {
    setFormData({
      ...formData,
      abv: value,
      abvManualOverride: true,
    });
  };

  // 重置为自动计算 ABV
  const resetABVToAuto = () => {
    setFormData({
      ...formData,
      abv: calculatedABV,
      abvManualOverride: false,
    });
  };

  // 手动设定成本
  const handleManualCostChange = (value: number) => {
    setFormData({
      ...formData,
      manualCost: value,
      costManualOverride: true,
    });
  };

  // 重置成本为自动计算
  const resetCostToAuto = () => {
    setFormData({
      ...formData,
      manualCost: undefined,
      costManualOverride: false,
    });
  };

  // ========== 操作方案相关操作 ==========

  // 添加操作方案
  const addOperationPlan = (templateId: string) => {
    const template = (config.operationPlanTemplates || []).find((t) => t.id === templateId);
    if (!template) return;
    // 检查是否已添加
    if (formData.operationPlans.some((p) => p.templateId === templateId)) return;
    // 初始化默认值
    const fieldValues: Record<string, any> = {};
    for (const field of template.fields) {
      switch (field.type) {
        case 'duration':
          fieldValues[field.id] = { value: 0, unit: field.unit || '分钟' };
          break;
        case 'temperature':
          fieldValues[field.id] = { value: 0, unit: field.unit || '°C' };
          break;
        case 'ingredient':
          fieldValues[field.id] = [];
          break;
        case 'text':
          fieldValues[field.id] = '';
          break;
        case 'select':
          fieldValues[field.id] = '';
          break;
        case 'multiselect':
          fieldValues[field.id] = [];
          break;
      }
    }
    const newInstance: OperationPlanInstance = {
      templateId: template.id,
      templateName: template.name,
      fieldValues,
    };
    setFormData({
      ...formData,
      operationPlans: [...formData.operationPlans, newInstance],
    });
  };

  // 删除操作方案
  const removeOperationPlan = (templateId: string) => {
    setFormData({
      ...formData,
      operationPlans: formData.operationPlans.filter((p) => p.templateId !== templateId),
    });
  };

  // 更新操作方案字段值
  const updateOperationPlanField = (templateId: string, fieldId: string, value: any) => {
    setFormData({
      ...formData,
      operationPlans: formData.operationPlans.map((p) =>
        p.templateId === templateId
          ? { ...p, fieldValues: { ...p.fieldValues, [fieldId]: value } }
          : p
      ),
    });
  };

  // 可添加的操作方案模板（已启用的、且尚未添加的）
  const availableTemplates = (config.operationPlanTemplates || []).filter(
    (t) => t.enabled && !formData.operationPlans.some((p) => p.templateId === t.id)
  );

  // 时长单位选项
  const durationUnitOptions = ['分钟', '小时', '天'];
  // 温度单位选项
  const temperatureUnitOptions = ['°C', '°F'];

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

    // 验证步骤数据
    if (formData.steps.length === 0 && formData.ingredients.length === 0) {
      alert('请添加操作步骤');
      return;
    }

    // 验证每个步骤
    for (const step of formData.steps) {
      if (!step.method) {
        alert('请为所有步骤选择操作方式');
        return;
      }
      if (step.ingredients.length === 0) {
        alert('每个步骤至少需要添加一个原料');
        return;
      }
      for (const si of step.ingredients) {
        if (!si.ingredientId) {
          alert('请为所有步骤内的原料选择关联原料');
          return;
        }
        if (si.inputAmount <= 0) {
          alert('请输入所有原料的投入量');
          return;
        }
      }
      const method = config.methods.find((m) => m.id === step.method);
      if (method?.hasLoss && !step.resultWeight) {
        alert(`步骤"${step.methodName}"为有损耗操作，必须填写结果液重`);
        return;
      }
      if (step.lockStandard) {
        if (!step.fixedInput || step.fixedInput <= 0) {
          alert('锁定标准时必须填写固定投入量');
          return;
        }
        if (method?.hasLoss && (!step.fixedOutput || step.fixedOutput <= 0)) {
          alert('锁定标准且有损耗时必须填写固定结果液重');
          return;
        }
      }
    }

    // 循环依赖检测（如果勾选原料产品）
    if (formData.isIngredientProduct) {
      for (const step of formData.steps) {
        for (const si of step.ingredients) {
          if (dependencyChecker.hasCircularDependency(productId, si.ingredientId, products)) {
            alert('存在循环依赖，请检查原料关联');
            return;
          }
        }
      }
    }

    setLoading(true);

    try {
      // 准备保存的数据（同时包含 steps 和 ingredients 以确保兼容）
      const saveData = {
        name: formData.name.trim(),
        category: formData.category,
        brands: formData.brands,
        standardOutput: formData.standardOutput,
        standardOutputUnit: formData.standardOutputUnit,
        steps: formData.steps,
        ingredients: formData.ingredients,
        packageSpecs: formData.packageSpecs,
        isIngredientProduct: formData.isIngredientProduct,
        operationPlans: formData.operationPlans,
        abv: displayABV,
        abvManualOverride: formData.abvManualOverride,
        costManualOverride: formData.costManualOverride,
        manualCost: formData.manualCost,
      };

      if (isEdit) {
        await updateProduct(productId, saveData);
      } else {
        await addProduct(saveData);
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
    <div className="content-area-no-nav">
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

      <div className="px-4 py-6 space-y-4 max-w-lg mx-auto overflow-y-auto pb-20">
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
                placeholder="如：橙子伏特加"
              />
            </div>

            <div>
              <Label>分类 *</Label>
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
                <Label>售卖品牌</Label>
                <div className="flex flex-wrap gap-2 mt-2">
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
                  value={numVal('standardOutput', formData.standardOutput)}
                  onChange={(e) => {
                    const val = handleNumberInput(e.target.value, numVal('standardOutput', formData.standardOutput));
                    setNumVal('standardOutput', val);
                    setFormData({ ...formData, standardOutput: parseFloat(val) || 0 });
                  }}
                  className="bg-[var(--input)] number-font w-[100px]"
                />
                <Select
                  value={formData.standardOutputUnit}
                  onValueChange={(v) => setFormData({ ...formData, standardOutputUnit: v as 'ml' | 'g' | 'L' | 'kg' })}
                >
                  <SelectTrigger className="bg-[var(--input)] h-9 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                  </SelectContent>
                </Select>
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

            {/* ABV 显示区域 */}
            <div className="p-3 rounded-lg bg-[var(--muted)]">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm">酒精度 (ABV)</Label>
                {formData.abvManualOverride && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={resetABVToAuto}
                  >
                    重置为自动
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="number-font text-lg text-[var(--primary)]">
                  {displayABV > 0 ? `${displayABV.toFixed(2)}%` : '0%'}
                </span>
                {formData.abvManualOverride && (
                  <span className="text-xs text-[var(--muted-foreground)]">(已手动设定)</span>
                )}
              </div>
              {calculatedABV > 0 && !formData.abvManualOverride && (
                <div className="text-xs text-[var(--muted-foreground)] mt-1">
                  自动计算值
                </div>
              )}
              {abvStatus.hasAlcoholic && !abvStatus.allFilled && (
                <div className="flex items-center gap-1 mt-2 text-xs text-[var(--warning)]">
                  <AlertCircle className="h-3 w-3" />
                  部分原料未填写酒精度，将作为稀释成分，计算结果可能不准确
                </div>
              )}
              <div className="mt-2">
                <Input
                  type="text"
                  value={numVal('manualAbv', formData.abv)}
                  onChange={(e) => {
                    const val = handleNumberInput(e.target.value, numVal('manualAbv', formData.abv));
                    setNumVal('manualAbv', val);
                    handleManualABVChange(parseFloat(val) || 0);
                  }}
                  className="bg-[var(--input)] number-font w-[100px] h-8 text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 操作步骤 */}
        <Card className="glass-card">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">操作步骤 *</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={addStep}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.steps.length === 0 && formData.ingredients.length === 0 ? (
              <div className="text-center py-4 text-[var(--muted-foreground)]">
                点击右上角 + 添加步骤
              </div>
            ) : (
              <>
                {/* 渲染步骤分组 */}
                {formData.steps.map((step, stepIndex) => {
                  const method = config.methods.find((m) => m.id === step.method);
                  const hasLoss = method?.hasLoss || false;

                  return (
                    <div key={step.id} className="space-y-3 p-3 rounded-lg bg-[var(--muted)]">
                      {/* 步骤头部 */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">步骤 {stepIndex + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStep(step.id)}
                          className="h-7 w-7"
                        >
                          <Trash2 className="h-4 w-4 text-[var(--destructive)]" />
                        </Button>
                      </div>

                      {/* 操作方式选择 */}
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
                          value={step.method}
                          onChange={(v) => {
                            const m = config.methods.find((m) => m.id === v);
                            updateStep(step.id, {
                              method: v,
                              methodName: m?.name || '',
                              resultWeight: m?.hasLoss ? step.resultWeight : undefined,
                            });
                          }}
                          placeholder="选择操作"
                          searchPlaceholder="搜索操作方式..."
                          className="bg-[var(--input)] mt-1 h-9"
                          popoverClassName="max-h-[200px]"
                        />
                      </div>

                      {/* 步骤内原料列表 */}
                      <div className="space-y-2">
                        {step.ingredients.map((si) => {
                          const ingredient = (ingredients || []).find((i) => i.id === si.ingredientId);
                          return (
                            <div key={si.id} className="flex items-center gap-2 p-2 rounded bg-[var(--background)]">
                              <div className="flex-1 min-w-0">
                                <Combobox
                                  options={ingredients.filter((ing) => ing.id).map((ing) => ({
                                    value: ing.id,
                                    label: `${ing.name} (${ing.category})${ing.abv > 0 ? ` · ${ing.abv}%vol` : ''}`,
                                  }))}
                                  value={si.ingredientId}
                                  onChange={(v) => {
                                    const ing = (ingredients || []).find((i) => i.id === v);
                                    const defaultUnit = getIngredientDefaultUnit(v);
                                    updateStepIngredient(step.id, si.id, {
                                      ingredientId: v,
                                      ingredientName: ing?.name || '',
                                      inputUnit: defaultUnit,
                                      unit: defaultUnit,
                                    });
                                  }}
                                  placeholder="选择原料"
                                  searchPlaceholder="搜索原料..."
                                  className="bg-[var(--input)] h-8 text-sm"
                                  popoverClassName="max-h-[150px]"
                                />
                              </div>
                              <div className="flex items-center gap-1 w-[140px]">
                                <Input
                                  type="text"
                                  value={numVal(`si-${si.id}`, si.inputAmount)}
                                  onChange={(e) => {
                                    const val = handleNumberInput(e.target.value, numVal(`si-${si.id}`, si.inputAmount));
                                    setNumVal(`si-${si.id}`, val);
                                    updateStepIngredient(step.id, si.id, { inputAmount: parseFloat(val) || 0 });
                                  }}
                                  className="bg-[var(--input)] number-font h-8 text-sm w-[70px]"
                                />
                                <select
                                  value={si.unit || si.inputUnit || 'ml'}
                                  onChange={(e) => {
                                    const newUnit = e.target.value as 'ml' | 'g' | 'L' | 'kg';
                                    updateStepIngredient(step.id, si.id, { unit: newUnit, inputUnit: newUnit });
                                  }}
                                  className="text-xs bg-[var(--input)] border border-[var(--border)] rounded px-1 h-8"
                                >
                                  {getUnitOptions(si.unit || si.inputUnit || 'ml').map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.value}</option>
                                  ))}
                                </select>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeStepIngredient(step.id, si.id)}
                                className="h-7 w-7 shrink-0"
                              >
                                <Trash2 className="h-3 w-3 text-[var(--destructive)]" />
                              </Button>
                            </div>
                          );
                        })}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addStepIngredient(step.id)}
                          className="w-full h-8 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          添加原料
                        </Button>
                      </div>

                      {/* 有损耗时显示结果液重 */}
                      {hasLoss && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">结果液重</Label>
                            <Input
                              type="text"
                              value={numVal(`rw-${step.id}`, step.resultWeight)}
                              onChange={(e) => {
                                const val = handleNumberInput(e.target.value, numVal(`rw-${step.id}`, step.resultWeight));
                                setNumVal(`rw-${step.id}`, val);
                                updateStep(step.id, { resultWeight: val ? parseFloat(val) || undefined : undefined });
                              }}
                              className="bg-[var(--input)] number-font mt-1 h-9"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">损耗比例</Label>
                            <div className="text-sm number-font text-[var(--warning)] mt-2">
                              {step.resultWeight && step.ingredients.reduce((sum, si) => sum + si.inputAmount, 0) > 0
                                ? `${calculateLossRatio(
                                    step.ingredients.reduce((sum, si) => sum + si.inputAmount, 0),
                                    step.resultWeight
                                  ).toFixed(1)}%`
                                : '0%'}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 锁定每次标准 */}
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">锁定每次标准</Label>
                        <Switch
                          checked={step.lockStandard}
                          onCheckedChange={(checked) =>
                            updateStep(step.id, { lockStandard: checked })
                          }
                        />
                      </div>

                      {step.lockStandard && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">固定投入量</Label>
                            <Input
                              type="text"
                              value={numVal(`fi-${step.id}`, step.fixedInput)}
                              onChange={(e) => {
                                const val = handleNumberInput(e.target.value, numVal(`fi-${step.id}`, step.fixedInput));
                                setNumVal(`fi-${step.id}`, val);
                                updateStep(step.id, { fixedInput: val ? parseFloat(val) || undefined : undefined });
                              }}
                              className="bg-[var(--input)] number-font mt-1 h-9"
                            />
                          </div>
                          {hasLoss && (
                            <div>
                              <Label className="text-xs">固定结果液重</Label>
                              <Input
                                type="text"
                                value={numVal(`fo-${step.id}`, step.fixedOutput)}
                                onChange={(e) => {
                                  const val = handleNumberInput(e.target.value, numVal(`fo-${step.id}`, step.fixedOutput));
                                  setNumVal(`fo-${step.id}`, val);
                                  updateStep(step.id, { fixedOutput: val ? parseFloat(val) || undefined : undefined });
                                }}
                                className="bg-[var(--input)] number-font mt-1 h-9"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 添加步骤按钮 */}
                <Button
                  variant="outline"
                  onClick={addStep}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加步骤
                </Button>
              </>
            )}

            {/* 成本区域 */}
            <>
              <Separator />
              <div className="p-3 rounded-lg bg-[var(--muted)]">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">成本预览</Label>
                  {formData.costManualOverride && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={resetCostToAuto}
                    >
                      重置为自动
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="number-font text-lg text-[var(--primary)]">
                    ¥{(formData.costManualOverride && formData.manualCost !== undefined ? formData.manualCost : previewCost).toFixed(2)}
                  </span>
                  {formData.costManualOverride && (
                    <span className="text-xs text-[var(--muted-foreground)]">(已手动设定)</span>
                  )}
                </div>
                {!formData.costManualOverride && previewCost > 0 && (
                  <div className="text-xs text-[var(--muted-foreground)] mt-1">
                    参照当前成品标准进行成本计算
                  </div>
                )}
                <div className="mt-2">
                  <Input
                    type="text"
                    value={numVal('manualCost', formData.manualCost)}
                    onChange={(e) => {
                      const val = handleNumberInput(e.target.value, numVal('manualCost', formData.manualCost));
                      setNumVal('manualCost', val);
                      handleManualCostChange(parseFloat(val) || 0);
                    }}
                    className="bg-[var(--input)] number-font w-[100px] h-8 text-sm"
                    placeholder="手动设定成本"
                  />
                </div>
              </div>
            </>
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

        {/* 具体操作方案 - 仅原料产品显示 */}
        {formData.isIngredientProduct && (
          <Card className="glass-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">具体操作方案</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* 添加方案按钮 */}
              {availableTemplates.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-[var(--muted-foreground)]">添加操作方案</Label>
                  <Combobox
                    options={availableTemplates.filter((t) => t.id).map((t) => ({
                      value: t.id,
                      label: t.name,
                    }))}
                    value=""
                    onChange={addOperationPlan}
                    placeholder="选择方案..."
                    searchPlaceholder="搜索方案..."
                    className="bg-[var(--input)]"
                  />
                </div>
              )}

              {/* 已添加的方案 */}
              {formData.operationPlans.length === 0 ? (
                <div className="text-center py-4 text-[var(--muted-foreground)]">
                  暂无操作方案，请在管理页面创建并启用方案模板后在此添加
                </div>
              ) : (
                formData.operationPlans.map((plan) => {
                  const template = (config.operationPlanTemplates || []).find((t) => t.id === plan.templateId);
                  if (!template) return null;
                  return (
                    <div key={plan.templateId} className="p-3 rounded-lg bg-[var(--muted)] space-y-2">
                      {/* 方案头部 */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{plan.templateName}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOperationPlan(plan.templateId)}
                          className="h-6 w-6"
                        >
                          <Trash2 className="h-3 w-3 text-[var(--destructive)]" />
                        </Button>
                      </div>

                      {/* 字段列表 */}
                      <div className="space-y-2 pl-2">
                        {template.fields.map((field) => {
                          const value = plan.fieldValues[field.id];
                          return (
                            <div key={field.id} className="space-y-1">
                              <Label className="text-xs">{field.name}</Label>
                              {/* 时长类型 */}
                              {field.type === 'duration' && (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="text"
                                    value={numVal(`op-${plan.templateId}-${field.id}`, value?.value)}
                                    onChange={(e) => {
                                      const val = handleNumberInput(e.target.value, numVal(`op-${plan.templateId}-${field.id}`, value?.value));
                                      setNumVal(`op-${plan.templateId}-${field.id}`, val);
                                      updateOperationPlanField(plan.templateId, field.id, { value: parseFloat(val) || 0, unit: value?.unit || field.unit || '分钟' });
                                    }}
                                    className="bg-[var(--input)] number-font h-8 text-sm w-[100px]"
                                  />
                                  <Select
                                    value={value?.unit || field.unit || '分钟'}
                                    onValueChange={(v) => updateOperationPlanField(plan.templateId, field.id, { ...value, unit: v })}
                                  >
                                    <SelectTrigger className="bg-[var(--input)] h-8 w-[90px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {durationUnitOptions.map((u) => (
                                        <SelectItem key={u} value={u}>{u}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                              {/* 温度类型 */}
                              {field.type === 'temperature' && (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="text"
                                    value={numVal(`op-${plan.templateId}-${field.id}`, value?.value)}
                                    onChange={(e) => {
                                      const val = handleNumberInput(e.target.value, numVal(`op-${plan.templateId}-${field.id}`, value?.value));
                                      setNumVal(`op-${plan.templateId}-${field.id}`, val);
                                      updateOperationPlanField(plan.templateId, field.id, { value: parseFloat(val) || 0, unit: value?.unit || field.unit || '°C' });
                                    }}
                                    className="bg-[var(--input)] number-font h-8 text-sm w-[100px]"
                                  />
                                  <Select
                                    value={value?.unit || field.unit || '°C'}
                                    onValueChange={(v) => updateOperationPlanField(plan.templateId, field.id, { ...value, unit: v })}
                                  >
                                    <SelectTrigger className="bg-[var(--input)] h-8 w-[90px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {temperatureUnitOptions.map((u) => (
                                        <SelectItem key={u} value={u}>{u}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                              {/* 原料选择类型 */}
                              {field.type === 'ingredient' && (
                                <MultiCombobox
                                  options={ingredients.filter((ing) => ing.id).map((ing) => ({
                                    value: ing.id,
                                    label: `${ing.name} (${ing.category})`,
                                  }))}
                                  value={value || []}
                                  onChange={(v) => updateOperationPlanField(plan.templateId, field.id, v)}
                                  placeholder="选择原料..."
                                  searchPlaceholder="搜索原料..."
                                  className="bg-[var(--input)] h-8 text-sm"
                                />
                              )}
                              {/* 文本类型 */}
                              {field.type === 'text' && (
                                <Input
                                  value={value || ''}
                                  onChange={(e) => updateOperationPlanField(plan.templateId, field.id, e.target.value)}
                                  className="bg-[var(--input)] h-8 text-sm"
                                  placeholder="输入文本..."
                                />
                              )}
                              {/* 自定义下拉类型 */}
                              {field.type === 'select' && (
                                <Select
                                  value={value || ''}
                                  onValueChange={(v) => updateOperationPlanField(plan.templateId, field.id, v)}
                                >
                                  <SelectTrigger className="bg-[var(--input)] h-8 text-sm">
                                    <SelectValue placeholder="请选择..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(field.options || []).map((opt) => (
                                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              {/* 自定义复选类型 */}
                              {field.type === 'multiselect' && (
                                <div className="flex flex-wrap gap-1">
                                  {(field.options || []).map((opt) => (
                                    <button
                                      key={opt}
                                      type="button"
                                      className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium transition-all ${
                                        (value || []).includes(opt)
                                          ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent'
                                          : 'bg-transparent text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--accent)]'
                                      }`}
                                      onClick={() => {
                                        const current = value || [];
                                        if (current.includes(opt)) {
                                          updateOperationPlanField(plan.templateId, field.id, current.filter((v: string) => v !== opt));
                                        } else {
                                          updateOperationPlanField(plan.templateId, field.id, [...current, opt]);
                                        }
                                      }}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
