import { getSupabaseClient, isClient } from '@/storage/database/supabase-client';
import {
  GlobalConfig,
  DEFAULT_CONFIG,
  Ingredient,
  Product,
  ProductStock,
  PackageSpec,
  Brand,
  Category,
  Method,
  ProductIngredient,
  ProductionStep,
  StepIngredient,
  IngredientSource,
  IngredientUnit,
  ProductionLog,
} from '@/types';

// Supabase 客户端获取函数（延迟初始化，仅在客户端）
const getSupabase = () => {
  if (!isClient()) {
    throw new Error('Supabase operations can only be performed on the client side');
  }
  return getSupabaseClient();
}



// ========== Settings 表存储（用于存储 steps、abv 等扩展数据）==========

// 设置表存储 - 通用读写函数
const settingsStorage = {
  // 读取单个设置
  async get<T>(key: string): Promise<T | null> {
    if (!isClient()) return null;
    try {
      const client = getSupabase();
      const { data, error } = await client
        .from('settings')
        .select('*')
        .eq('key', key)
        .maybeSingle();
      if (error) {
        console.error(`[settingsStorage.get] 读取失败: ${error.message}`);
        return null;
      }
      return data?.value as T ?? null;
    } catch (error) {
      console.error(`[settingsStorage.get] 读取失败:`, error);
      return null;
    }
  },

  // 写入单个设置（upsert）
  async set(key: string, value: any): Promise<void> {
    if (!isClient()) return;
    try {
      const client = getSupabase();
      const { error } = await client
        .from('settings')
        .upsert(
          { key, value },
          { onConflict: 'key' }
        );
      if (error) {
        console.error(`[settingsStorage.set] 写入失败: ${error.message}`);
        throw new Error(`保存设置失败: ${error.message}`);
      }
      console.log(`[settingsStorage.set] 保存成功: ${key}`);
    } catch (error) {
      console.error(`[settingsStorage.set] 写入失败:`, error);
      throw error;
    }
  },

  // 删除单个设置
  async delete(key: string): Promise<void> {
    if (!isClient()) return;
    try {
      const client = getSupabase();
      const { error } = await client
        .from('settings')
        .delete()
        .eq('key', key);
      if (error) {
        console.error(`[settingsStorage.delete] 删除失败: ${error.message}`);
      }
      console.log(`[settingsStorage.delete] 删除成功: ${key}`);
    } catch (error) {
      console.error(`[settingsStorage.delete] 删除失败:`, error);
    }
  },
};

// 原料酒精度存储
export const ingredientABVStorage = {
  // 获取原料酒精度
  async get(ingredientId: string): Promise<number> {
    const abv = await settingsStorage.get<number>(`ingredient_abv_${ingredientId}`);
    return abv ?? 0;
  },

  // 设置原料酒精度
  async set(ingredientId: string, abv: number): Promise<void> {
    if (abv > 0) {
      await settingsStorage.set(`ingredient_abv_${ingredientId}`, abv);
    } else {
      await settingsStorage.delete(`ingredient_abv_${ingredientId}`);
    }
  },

  // 删除原料酒精度
  async delete(ingredientId: string): Promise<void> {
    await settingsStorage.delete(`ingredient_abv_${ingredientId}`);
  },
};

// 产品步骤数据存储
export const productStepsStorage = {
  // 获取产品步骤数据
  async get(productId: string): Promise<ProductionStep[]> {
    const steps = await settingsStorage.get<ProductionStep[]>(`product_steps_${productId}`);
    return steps ?? [];
  },

  // 设置产品步骤数据
  async set(productId: string, steps: ProductionStep[]): Promise<void> {
    if (steps.length > 0) {
      await settingsStorage.set(`product_steps_${productId}`, steps);
    } else {
      await settingsStorage.delete(`product_steps_${productId}`);
    }
  },

  // 删除产品步骤数据
  async delete(productId: string): Promise<void> {
    await settingsStorage.delete(`product_steps_${productId}`);
  },
};

// 产品酒精度存储
export const productABVStorage = {
  // 获取产品酒精度
  async get(productId: string): Promise<{ value: number; manual: boolean } | null> {
    const data = await settingsStorage.get<{ value: number; manual: boolean }>(`product_abv_${productId}`);
    return data ?? null;
  },

  // 设置产品酒精度
  async set(productId: string, value: number, manual: boolean): Promise<void> {
    if (value > 0 || manual) {
      await settingsStorage.set(`product_abv_${productId}`, { value, manual });
    } else {
      await settingsStorage.delete(`product_abv_${productId}`);
    }
  },

  // 删除产品酒精度
  async delete(productId: string): Promise<void> {
    await settingsStorage.delete(`product_abv_${productId}`);
  },
};

// ========== 产品手动成本 ==========
export const productCostStorage = {
  async get(productId: string): Promise<{ value: number; manual: boolean } | null> {
    const data = await settingsStorage.get<{ value: number; manual: boolean }>(`product_cost_${productId}`);
    return data ?? null;
  },
  async set(productId: string, value: number, manual: boolean): Promise<void> {
    if (value > 0 || manual) {
      await settingsStorage.set(`product_cost_${productId}`, { value, manual });
    } else {
      await settingsStorage.delete(`product_cost_${productId}`);
    }
  },
  async delete(productId: string): Promise<void> {
    await settingsStorage.delete(`product_cost_${productId}`);
  },
};

// ========== 制作记录 ==========
export const productionLogStorage = {
  async get(productId: string): Promise<ProductionLog[]> {
    const data = await settingsStorage.get<ProductionLog[]>(`production_logs_${productId}`);
    return data || [];
  },
  async add(productId: string, log: ProductionLog): Promise<void> {
    const logs = await this.get(productId);
    logs.push(log);
    await settingsStorage.set(`production_logs_${productId}`, logs);
  },
  async delete(productId: string): Promise<void> {
    await settingsStorage.delete(`production_logs_${productId}`);
  },
};

// 批量获取多个原料的 ABV
export async function getIngredientABVs(ingredientIds: string[]): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  if (!isClient() || ingredientIds.length === 0) return result;

  try {
    const client = getSupabase();
    const keys = ingredientIds.map(id => `ingredient_abv_${id}`);
    const { data, error } = await client
      .from('settings')
      .select('*')
      .in('key', keys);

    if (error) {
      console.error('[getIngredientABVs] 批量读取失败:', error.message);
      return result;
    }

    for (const item of data || []) {
      const id = item.key.replace('ingredient_abv_', '');
      result.set(id, item.value as number);
    }
  } catch (error) {
    console.error('[getIngredientABVs] 批量读取失败:', error);
  }

  return result;
}

// ========== ABV 计算函数 ==========

// ABV 计算公式
// ABV = Σ(体积 × 度数) / 总体积
// 对于有损耗的步骤：用投入的原料参与计算（酒精在加工过程中保留，损耗的是水和其他成分）
// 总体积 = 所有步骤所有原料的投入量之和（转换为ml）
// 只计算 abv > 0 的原料贡献的酒精量
export function calculateProductABV(
  steps: ProductionStep[],
  ingredients: Ingredient[]
): number {
  let totalAlcohol = 0;  // 总酒精量（ml）
  let totalVolume = 0;   // 总体积（ml）
  
  for (const step of steps) {
    for (const si of step.ingredients) {
      // 将用量统一转换为 ml（如果是 g 则近似 1g ≈ 1ml）
      const volumeMl = convertToMl(si.inputAmount, si.inputUnit);
      totalVolume += volumeMl;
      
      // 查找该原料的 ABV
      const ingredient = ingredients.find(i => i.id === si.ingredientId);
      if (ingredient && ingredient.abv > 0) {
        totalAlcohol += volumeMl * (ingredient.abv / 100);
      }
    }
  }
  
  if (totalVolume === 0) return 0;
  return Math.round((totalAlcohol / totalVolume) * 100 * 100) / 100;
}

// 检查是否有原料未填写酒精度
export function checkMissingABV(
  steps: ProductionStep[],
  ingredients: Ingredient[]
): { hasAlcoholic: boolean; allFilled: boolean } {
  let hasAlcoholic = false;
  let allFilled = true;
  
  for (const step of steps) {
    for (const si of step.ingredients) {
      const ingredient = ingredients.find(i => i.id === si.ingredientId);
      if (ingredient && ingredient.abv > 0) {
        hasAlcoholic = true;
      }
      // 如果有酒精原料但未填写ABV
      if (ingredient && ingredient.abv === 0 && (si.inputUnit === 'ml' || si.inputUnit === 'L')) {
        allFilled = false;
      }
    }
  }
  
  return { hasAlcoholic, allFilled };
}

// 单位转换辅助函数
export function convertToMl(amount: number, unit: string): number {
  switch (unit) {
    case 'ml': return amount;
    case 'L': return amount * 1000;
    case 'g': return amount;  // 近似 1g ≈ 1ml
    case 'kg': return amount * 1000;  // 近似 1kg ≈ 1L
    default: return amount;
  }
}

// 配置格式适配器：兼容数据库中旧格式（简单字符串数组）和代码期望的新格式（对象数组）
function adaptConfigValue<T extends { enabled?: boolean }>(
  dbValue: any,
  defaultValue: T[],
  idPrefix: string
): T[] {
  if (!dbValue) return defaultValue;
  if (!Array.isArray(dbValue)) return defaultValue;
  // 已经是新格式（对象数组，第一个元素有 id 属性）
  if (dbValue.length > 0 && typeof dbValue[0] === 'object' && dbValue[0] !== null && 'id' in dbValue[0]) {
    return dbValue;
  }
  // 旧格式：字符串数组，转换为新格式
  console.warn(`[adaptConfigValue] 检测到旧格式配置数据，正在转换: ${idPrefix}`);
  return dbValue.map((item: any, index: number) => {
    if (typeof item === 'string') {
      const obj: any = { id: `${idPrefix}${index + 1}`, name: item, enabled: true };
      return obj;
    }
    return item;
  }) as T[];
}

// 不再使用 localStorage 作为降级方案
// 所有数据必须持久化到 Supabase

// 生成唯一ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 数据库记录类型转换函数

// 将旧的扁平 ProductIngredient[] 迁移为新的 steps 格式
function migrateIngredientsToSteps(ingredients: ProductIngredient[]): ProductionStep[] {
  const methodGroups = new Map<string, ProductIngredient[]>();
  
  // 按 method 分组
  for (const ing of ingredients) {
    const existing = methodGroups.get(ing.method) || [];
    existing.push(ing);
    methodGroups.set(ing.method, existing);
  }
  
  // 转换为 steps 格式
  const steps: ProductionStep[] = [];
  for (const [method, methodIngredients] of methodGroups) {
    if (methodIngredients.length > 0) {
      steps.push({
        id: generateId(),
        method: method,
        methodName: methodIngredients[0].methodName,
        ingredients: methodIngredients.map(i => ({
          id: i.id,
          ingredientId: i.ingredientId,
          ingredientName: i.ingredientName,
          inputAmount: i.inputAmount,
          inputUnit: i.inputUnit,
        })),
        resultWeight: methodIngredients[0].resultWeight,
        lockStandard: methodIngredients[0].lockStandard,
        fixedInput: methodIngredients[0].fixedInput,
        fixedOutput: methodIngredients[0].fixedOutput,
      });
    }
  }
  
  return steps;
}

// 产品记录转前端类型
async function productRecordToModel(record: any): Promise<Product> {
  // 处理 ingredients 和 steps 数据
  let steps: ProductionStep[] = [];
  const ingredients: ProductIngredient[] = (record.ingredients || []).map((i: any) => ({
    ...i,
  }));
  
  // 尝试从 settings 表读取 steps 数据
  const settingsSteps = await productStepsStorage.get(record.id);
  if (settingsSteps.length > 0) {
    steps = settingsSteps;
  } else if (record.steps && Array.isArray(record.steps) && record.steps.length > 0) {
    // 兼容旧的 steps 字段（数据库中直接存储的）
    steps = record.steps.map((s: any) => ({
      id: s.id,
      method: s.method,
      methodName: s.methodName,
      ingredients: (s.ingredients || []).map((si: any) => ({
        id: si.id,
        ingredientId: si.ingredientId,
        ingredientName: si.ingredientName,
        inputAmount: si.inputAmount,
        inputUnit: si.inputUnit,
      })),
      resultWeight: s.resultWeight,
      lockStandard: s.lockStandard || false,
      fixedInput: s.fixedInput,
      fixedOutput: s.fixedOutput,
    }));
  } else if (ingredients.length > 0) {
    // 旧数据：将 ingredients 迁移为 steps
    steps = migrateIngredientsToSteps(ingredients);
  }
  
  // 尝试从 settings 表读取 ABV 数据
  let abv = record.abv || 0;
  let abvManualOverride = record.abv_manual_override || false;
  const settingsABV = await productABVStorage.get(record.id);
  if (settingsABV) {
    abv = settingsABV.value;
    abvManualOverride = settingsABV.manual;
  }
  
  // 尝试从 settings 表读取手动成本数据
  let costManualOverride = false;
  let manualCost: number | undefined;
  const settingsCost = await productCostStorage.get(record.id);
  if (settingsCost) {
    costManualOverride = settingsCost.manual;
    manualCost = settingsCost.value;
  }
  
  return {
    id: record.id,
    name: record.name,
    category: record.category,
    brands: record.brands || [],
    standardOutput: record.total_output_ml,
    ingredients: ingredients,
    steps: steps,
    packageSpecs: record.package_specs || [],
    cost: 0, // 成本需要实时计算
    costManualOverride: costManualOverride,
    manualCost: manualCost,
    isIngredientProduct: record.is_ingredient_product,
    abv: abv,
    abvManualOverride: abvManualOverride,
    createdAt: new Date(record.created_at).getTime(),
    updatedAt: new Date(record.updated_at).getTime(),
  };
}

// 前端产品类型转数据库记录
function productModelToRecord(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'cost'>): any {
  return {
    name: product.name,
    category: product.category,
    brands: product.brands,
    is_ingredient_product: product.isIngredientProduct,
    total_output_ml: product.standardOutput,
    ingredients: product.ingredients,
    package_specs: product.packageSpecs,
    total_stock_ml: 0,
  };
}

// 原料记录转前端类型
async function ingredientRecordToModel(record: any): Promise<Ingredient> {
  // 从 settings 表读取 ABV 数据（ingredients 表没有 abv 列）
  let abv = 0;
  const settingsABV = await ingredientABVStorage.get(record.id);
  if (settingsABV > 0) {
    abv = settingsABV;
  }
  
  return {
    id: record.id,
    name: record.name,
    category: record.category,
    purchaseSpec: record.purchase_spec || '',
    purchasePrice: parseFloat(record.purchase_price || '0'),
    purchaseUnit: record.min_unit,
    minUnitPrice: parseFloat(record.unit_price || '0'),
    minUnit: record.min_unit,
    source: record.source,
    abv: abv,
    relatedProductId: record.linked_product_id,
    createdAt: new Date(record.created_at).getTime(),
    updatedAt: new Date(record.updated_at).getTime(),
  };
}

// 前端原料类型转数据库记录
function ingredientModelToRecord(ingredient: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>): any {
  console.log('[ingredientModelToRecord] 输入数据:', JSON.stringify(ingredient, null, 2));
  const record = {
    name: ingredient.name,
    category: ingredient.category,
    source: ingredient.source || 'purchase',
    min_unit: ingredient.minUnit || 'g',
    purchase_spec: ingredient.purchaseSpec || '',
    purchase_price: (ingredient.purchasePrice || 0).toString(),
    unit_price: (ingredient.minUnitPrice || 0).toString(),
    linked_product_id: ingredient.relatedProductId && ingredient.relatedProductId.trim() !== '' ? ingredient.relatedProductId : null,
  };
  console.log('[ingredientModelToRecord] 输出记录:', JSON.stringify(record, null, 2));
  return record;
}

// 全局配置存储（使用 settings 表）
export const configStorage = {
  async get(): Promise<GlobalConfig> {
    // 必须在客户端执行
    if (!isClient()) {
      console.warn('[configStorage.get] SSR 环境，返回默认配置');
      return DEFAULT_CONFIG;
    }

    // 直接调用 Supabase，不做可用性检测
    try {
      const client = getSupabase();

      // 获取所有配置
      const { data, error } = await client.from('settings').select('*');
      if (error) {
        console.error('[configStorage.get] Supabase 查询错误:', error.message);
        throw new Error(`获取配置失败: ${error.message}`);
      }

      const configMap = new Map<string, any>();
      for (const item of data || []) {
        configMap.set(item.key, item.value);
      }

      console.log('[configStorage.get] 成功获取配置，数据条数:', data?.length || 0);

      // 合并默认配置（使用适配器兼容旧格式）
      return {
        password: configMap.get('global_password') || DEFAULT_CONFIG.password,
        packageSpecs: adaptConfigValue(configMap.get('package_specs'), DEFAULT_CONFIG.packageSpecs, 'spec-'),
        brands: adaptConfigValue(configMap.get('brands'), DEFAULT_CONFIG.brands, 'brand-'),
        categories: adaptConfigValue(configMap.get('categories'), DEFAULT_CONFIG.categories, 'cat-'),
        methods: adaptConfigValue(configMap.get('methods'), DEFAULT_CONFIG.methods, 'method-'),
        ingredientCategories: adaptConfigValue(configMap.get('ingredient_categories'), DEFAULT_CONFIG.ingredientCategories, 'icat-'),
        ingredientSources: adaptConfigValue(configMap.get('ingredient_sources'), DEFAULT_CONFIG.ingredientSources, 'isrc-'),
        ingredientUnits: adaptConfigValue(configMap.get('ingredient_units'), DEFAULT_CONFIG.ingredientUnits, 'iunit-'),
      };
    } catch (error) {
      console.error('[configStorage.get] 获取配置失败:', error);
      // 返回默认配置，但不使用 localStorage
      return DEFAULT_CONFIG;
    }
  },

  async set(config: GlobalConfig): Promise<void> {
    const client = getSupabase();
    
    // 更新各个配置项
    const configs = [
      { key: 'global_password', value: config.password },
      { key: 'package_specs', value: config.packageSpecs },
      { key: 'brands', value: config.brands },
      { key: 'categories', value: config.categories },
      { key: 'methods', value: config.methods },
      { key: 'ingredient_categories', value: config.ingredientCategories },
      { key: 'ingredient_sources', value: config.ingredientSources },
      { key: 'ingredient_units', value: config.ingredientUnits },
    ];
    
    for (const c of configs) {
      const { error } = await client
        .from('settings')
        .upsert({ key: c.key, value: c.value }, { onConflict: 'key' });
      if (error) throw new Error(`更新配置失败: ${error.message}`);
    }
  },

  async verifyPassword(input: string): Promise<boolean> {
    // 必须在客户端执行
    if (!isClient()) {
      console.warn('[configStorage.verifyPassword] SSR 环境，使用默认密码验证');
      return input === DEFAULT_CONFIG.password;
    }

    // 直接调用 Supabase
    try {
      const config = await this.get();
      const result = input === config.password;
      console.log('[configStorage.verifyPassword] 密码验证结果:', result);
      return result;
    } catch (error) {
      console.error('[configStorage.verifyPassword] 密码验证失败:', error);
      // 降级到默认密码
      return input === DEFAULT_CONFIG.password;
    }
  },

  async updatePassword(newPassword: string): Promise<void> {
    const config = await this.get();
    config.password = newPassword;
    await this.set(config);
  },
};

// 原料存储
export const ingredientStorage = {
  async getAll(): Promise<Ingredient[]> {
    // 必须在客户端执行
    if (!isClient()) {
      console.warn('[ingredientStorage.getAll] SSR 环境，返回空数组');
      return [];
    }

    // 直接调用 Supabase
    try {
      const client = getSupabase();
      const { data, error } = await client
        .from('ingredients')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('[ingredientStorage.getAll] Supabase 查询错误:', error.message);
        throw new Error(`获取原料失败: ${error.message}`);
      }
      console.log('[ingredientStorage.getAll] 成功获取原料，数量:', data?.length || 0);
      
      // 转换为前端类型（异步，需要处理每个记录）
      const ingredients: Ingredient[] = [];
      for (const record of data || []) {
        ingredients.push(await ingredientRecordToModel(record));
      }
      return ingredients;
    } catch (error) {
      console.error('[ingredientStorage.getAll] 获取原料失败:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Ingredient | null> {
    if (!isClient()) {
      return null;
    }

    try {
      const client = getSupabase();
      const { data, error } = await client
        .from('ingredients')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) {
        console.error('[ingredientStorage.getById] Supabase 查询错误:', error.message);
        throw new Error(`获取原料失败: ${error.message}`);
      }
      return data ? await ingredientRecordToModel(data) : null;
    } catch (error) {
      console.error('[ingredientStorage.getById] 获取原料失败:', error);
      return null;
    }
  },

  async create(ingredient: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ingredient> {
    if (!isClient()) {
      throw new Error('Supabase 不可用，无法创建原料');
    }

    try {
      const client = getSupabase();
      const record = ingredientModelToRecord(ingredient);
      const { data, error } = await client
        .from('ingredients')
        .insert(record)
        .select()
        .maybeSingle();
      if (error) {
        console.error('[ingredientStorage.create] Supabase 插入错误:', error.message);
        throw new Error(`创建原料失败: ${error.message}`);
      }
      console.log('[ingredientStorage.create] 成功创建原料:', data.id);
      
      // 将 ABV 保存到 settings 表
      if (ingredient.abv > 0) {
        await ingredientABVStorage.set(data.id, ingredient.abv);
      }
      
      return await ingredientRecordToModel(data);
    } catch (error) {
      console.error('[ingredientStorage.create] 创建原料失败:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Ingredient | null> {
    if (!isClient()) {
      throw new Error('Supabase 不可用，无法更新原料');
    }

    try {
      const client = getSupabase();
      const updateRecord: any = {};
      
      if (updates.name !== undefined) updateRecord.name = updates.name;
      if (updates.category !== undefined) updateRecord.category = updates.category;
      if (updates.purchaseSpec !== undefined) updateRecord.purchase_spec = updates.purchaseSpec;
      if (updates.purchasePrice !== undefined) updateRecord.purchase_price = updates.purchasePrice.toString();
      if (updates.purchaseUnit !== undefined) updateRecord.min_unit = updates.purchaseUnit;
      if (updates.minUnit !== undefined) updateRecord.min_unit = updates.minUnit;
      if (updates.minUnitPrice !== undefined) updateRecord.unit_price = updates.minUnitPrice.toString();
      if (updates.source !== undefined) updateRecord.source = updates.source;
      if (updates.relatedProductId !== undefined) {
        updateRecord.linked_product_id = updates.relatedProductId && updates.relatedProductId.trim() !== '' ? updates.relatedProductId : null;
      }
      // ABV 存储在 settings 表中，不写入 ingredients 表
      if (updates.abv !== undefined) {
        await ingredientABVStorage.set(id, updates.abv);
      }
      
      const { data, error } = await client
        .from('ingredients')
        .update(updateRecord)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) {
        console.error('[ingredientStorage.update] Supabase 更新错误:', error.message);
        throw new Error(`更新原料失败: ${error.message}`);
      }
      console.log('[ingredientStorage.update] 成功更新原料:', id);
      
      // 将 ABV 保存到 settings 表
      if (updates.abv !== undefined) {
        await ingredientABVStorage.set(id, updates.abv);
      }
      
      return data ? await ingredientRecordToModel(data) : null;
    } catch (error) {
      console.error('[ingredientStorage.update] 更新原料失败:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    if (!isClient()) {
      throw new Error('Supabase 不可用，无法删除原料');
    }

    try {
      const client = getSupabase();
      const { error } = await client
        .from('ingredients')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('[ingredientStorage.delete] Supabase 删除错误:', error.message);
        throw new Error(`删除原料失败: ${error.message}`);
      }
      
      // 删除 settings 中的 ABV 数据
      await ingredientABVStorage.delete(id);
      
      console.log('[ingredientStorage.delete] 成功删除原料:', id);
      return true;
    } catch (error) {
      console.error('[ingredientStorage.delete] 删除原料失败:', error);
      throw error;
    }
  },

  // 更新关联原料的 ABV（当原料产品的 ABV 变更时）
  async updateLinkedABV(ingredientId: string, abv: number): Promise<void> {
    if (!isClient()) {
      return;
    }

    try {
      const client = getSupabase();
      const { error } = await client
        .from('ingredients')
        .update({ abv: abv })
        .eq('id', ingredientId)
        .eq('source', 'internal');
      if (error) {
        console.error('[ingredientStorage.updateLinkedABV] 更新 ABV 失败:', error.message);
      }
      
      // 同时更新 settings 表
      await ingredientABVStorage.set(ingredientId, abv);
    } catch (error) {
      console.error('[ingredientStorage.updateLinkedABV] 更新 ABV 失败:', error);
    }
  },
};

// 产品存储
export const productStorage = {
  async getAll(): Promise<Product[]> {
    if (!isClient()) {
      console.warn('[productStorage.getAll] SSR 环境，返回空数组');
      return [];
    }

    try {
      const client = getSupabase();
      const { data, error } = await client
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('[productStorage.getAll] Supabase 查询错误:', error.message);
        throw new Error(`获取产品失败: ${error.message}`);
      }
      console.log('[productStorage.getAll] 成功获取产品，数量:', data?.length || 0);
      
      // 转换为前端类型（异步）
      const products: Product[] = [];
      for (const record of data || []) {
        products.push(await productRecordToModel(record));
      }
      return products;
    } catch (error) {
      console.error('[productStorage.getAll] 获取产品失败:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Product | null> {
    if (!isClient()) {
      return null;
    }

    try {
      const client = getSupabase();
      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) {
        console.error('[productStorage.getById] Supabase 查询错误:', error.message);
        throw new Error(`获取产品失败: ${error.message}`);
      }
      return data ? await productRecordToModel(data) : null;
    } catch (error) {
      console.error('[productStorage.getById] 获取产品失败:', error);
      return null;
    }
  },

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'cost'>): Promise<Product> {
    if (!isClient()) {
      throw new Error('Supabase 不可用，无法创建产品');
    }

    try {
      const client = getSupabase();
      const record = productModelToRecord(product);
      const { data, error } = await client
        .from('products')
        .insert(record)
        .select()
        .maybeSingle();
      if (error) {
        console.error('[productStorage.create] Supabase 插入错误:', error.message);
        throw new Error(`创建产品失败: ${error.message}`);
      }
      console.log('[productStorage.create] 成功创建产品:', data.id);
      
      // 将 steps 保存到 settings 表
      await productStepsStorage.set(data.id, product.steps || []);
      
      // 将 ABV 保存到 settings 表
      await productABVStorage.set(data.id, product.abv || 0, product.abvManualOverride || false);
      
      // 将手动成本保存到 settings 表
      if (product.costManualOverride && product.manualCost !== undefined) {
        await productCostStorage.set(data.id, product.manualCost, true);
      }
      
      // 如果是原料产品，同步更新关联原料的 ABV
      if (product.isIngredientProduct && product.abv > 0) {
        // 查找关联的原料
        const ingredients = await ingredientStorage.getAll();
        const linkedIngredient = ingredients.find(i => i.relatedProductId === data.id);
        if (linkedIngredient) {
          await ingredientStorage.updateLinkedABV(linkedIngredient.id, product.abv);
        }
      }
      
      return await productRecordToModel(data);
    } catch (error) {
      console.error('[productStorage.create] 创建产品失败:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'cost'>>): Promise<Product | null> {
    if (!isClient()) {
      throw new Error('Supabase 不可用，无法更新产品');
    }

    try {
      const client = getSupabase();
      const updateRecord: any = {};
      
      if (updates.name !== undefined) updateRecord.name = updates.name;
      if (updates.category !== undefined) updateRecord.category = updates.category;
      if (updates.brands !== undefined) updateRecord.brands = updates.brands;
      if (updates.standardOutput !== undefined) updateRecord.total_output_ml = updates.standardOutput;
      if (updates.ingredients !== undefined) updateRecord.ingredients = updates.ingredients;
      if (updates.packageSpecs !== undefined) updateRecord.package_specs = updates.packageSpecs;
      if (updates.isIngredientProduct !== undefined) updateRecord.is_ingredient_product = updates.isIngredientProduct;
      // steps 和 ABV 存储在 settings 表中，不写入 products 表
      if (updates.steps !== undefined) {
        await productStepsStorage.set(id, updates.steps);
      }
      if (updates.abv !== undefined || updates.abvManualOverride !== undefined) {
        const current = await productABVStorage.get(id);
        const newAbv = updates.abv !== undefined ? updates.abv : (current?.value ?? 0);
        const newManual = updates.abvManualOverride !== undefined ? updates.abvManualOverride : (current?.manual ?? false);
        await productABVStorage.set(id, newAbv, newManual);
      }
      // 处理手动成本覆盖
      if (updates.costManualOverride !== undefined || updates.manualCost !== undefined) {
        const current = await productCostStorage.get(id);
        const newManual = updates.costManualOverride ?? current?.manual ?? false;
        const newValue = updates.manualCost ?? current?.value ?? 0;
        if (newManual) {
          await productCostStorage.set(id, newValue, true);
        } else {
          await productCostStorage.delete(id);
        }
      }
      
      const { data, error } = await client
        .from('products')
        .update(updateRecord)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) {
        console.error('[productStorage.update] Supabase 更新错误:', error.message);
        throw new Error(`更新产品失败: ${error.message}`);
      }
      console.log('[productStorage.update] 成功更新产品:', id);
      
      // 将 steps 保存到 settings 表
      if (updates.steps !== undefined) {
        await productStepsStorage.set(id, updates.steps);
      }
      
      // 将 ABV 保存到 settings 表
      if (updates.abv !== undefined || updates.abvManualOverride !== undefined) {
        const current = await productABVStorage.get(id);
        const newAbv = updates.abv ?? current?.value ?? 0;
        const newManual = updates.abvManualOverride ?? current?.manual ?? false;
        await productABVStorage.set(id, newAbv, newManual);
      }
      
      // 将手动成本保存到 settings 表
      if (updates.costManualOverride !== undefined || updates.manualCost !== undefined) {
        const current = await productCostStorage.get(id);
        const newManual = updates.costManualOverride ?? current?.manual ?? false;
        const newValue = updates.manualCost ?? current?.value ?? 0;
        if (newManual) {
          await productCostStorage.set(id, newValue, true);
        } else {
          await productCostStorage.delete(id);
        }
      }
      
      // 如果是原料产品，同步更新关联原料的 ABV
      const updatedProduct = await productRecordToModel(data);
      if (updatedProduct.isIngredientProduct && updatedProduct.abv > 0) {
        const ingredients = await ingredientStorage.getAll();
        const linkedIngredient = ingredients.find(i => i.relatedProductId === id);
        if (linkedIngredient) {
          await ingredientStorage.updateLinkedABV(linkedIngredient.id, updatedProduct.abv);
        }
      }
      
      return data ? await productRecordToModel(data) : null;
    } catch (error) {
      console.error('[productStorage.update] 更新产品失败:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    if (!isClient()) {
      throw new Error('Supabase 不可用，无法删除产品');
    }

    try {
      const client = getSupabase();
      
      // 先删除库存记录
      const { error: inventoryError } = await client
        .from('inventory')
        .delete()
        .eq('product_id', id);
      if (inventoryError) {
        console.error('[productStorage.delete] 删除库存错误:', inventoryError.message);
        // 继续删除产品，即使库存删除失败
      }
      
      // 删除产品
      const { error } = await client
        .from('products')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('[productStorage.delete] Supabase 删除错误:', error.message);
        throw new Error(`删除产品失败: ${error.message}`);
      }
      
      // 删除 settings 中的 steps、abv、cost 和 production_logs 数据
      await productStepsStorage.delete(id);
      await productABVStorage.delete(id);
      await productCostStorage.delete(id);
      await productionLogStorage.delete(id);
      
      console.log('[productStorage.delete] 成功删除产品:', id);
      return true;
    } catch (error) {
      console.error('[productStorage.delete] 删除产品失败:', error);
      throw error;
    }
  },

  // 获取原料产品
  async getIngredientProducts(): Promise<Product[]> {
    if (!isClient()) {
      return [];
    }

    try {
      const client = getSupabase();
      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('is_ingredient_product', true)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('[productStorage.getIngredientProducts] Supabase 查询错误:', error.message);
        throw new Error(`获取原料产品失败: ${error.message}`);
      }
      
      // 转换为前端类型（异步）
      const products: Product[] = [];
      for (const record of data || []) {
        products.push(await productRecordToModel(record));
      }
      return products;
    } catch (error) {
      console.error('[productStorage.getIngredientProducts] 获取原料产品失败:', error);
      return [];
    }
  },
};

// 库存存储
export const stockStorage = {
  async getAll(): Promise<ProductStock[]> {
    if (!isClient()) {
      return [];
    }

    try {
      const client = getSupabase();
      
      // 获取所有库存记录
      const { data: inventoryData, error: inventoryError } = await client
        .from('inventory')
        .select('*')
        .order('product_id');
      if (inventoryError) {
        console.error('[stockStorage.getAll] 获取库存错误:', inventoryError.message);
        throw new Error(`获取库存失败: ${inventoryError.message}`);
      }
      
      // 获取所有产品
      const { data: productData, error: productError } = await client
        .from('products')
        .select('id, name, package_specs, total_stock_ml');
      if (productError) {
        console.error('[stockStorage.getAll] 获取产品错误:', productError.message);
        throw new Error(`获取产品失败: ${productError.message}`);
      }
    
    // 组装库存数据
    const stocks: ProductStock[] = [];
    const productMap = new Map<string, any>();
    for (const p of productData || []) {
      productMap.set(p.id, p);
    }
    
    // 按产品分组库存
    const inventoryByProduct = new Map<string, any[]>();
    for (const inv of inventoryData || []) {
      const list = inventoryByProduct.get(inv.product_id) || [];
      list.push(inv);
      inventoryByProduct.set(inv.product_id, list);
    }
    
    // 构建每个产品的库存
    for (const [productId, inventories] of inventoryByProduct) {
      const product = productMap.get(productId);
      if (!product) continue;
      
      const packageSpecs: any[] = product.package_specs || [];
      const packages: any[] = inventories.map(inv => ({
        specId: `${inv.spec_ml}ml`,
        specName: `${inv.spec_ml}ml`,
        count: inv.quantity,
      }));
      
      // 计算总可用量
      let totalAvailable = product.total_stock_ml || 0;
      let looseAmount = totalAvailable;
      
      // 减去已装瓶量
      for (const inv of inventories) {
        looseAmount -= inv.spec_ml * inv.quantity;
      }
      
      stocks.push({
        productId,
        totalAvailable,
        packages,
        looseAmount: Math.max(0, looseAmount),
      });
    }
    
    // 补充没有库存记录的产品
    for (const [productId, product] of productMap) {
      if (!inventoryByProduct.has(productId)) {
        stocks.push({
          productId,
          totalAvailable: product.total_stock_ml || 0,
          packages: [],
          looseAmount: product.total_stock_ml || 0,
        });
      }
    }
    
    return stocks;
    } catch (error) {
      console.error('[stockStorage.getAll] 获取库存失败:', error);
      return [];
    }
  },

  async getByProductId(productId: string): Promise<ProductStock | null> {
    if (!isClient()) {
      return null;
    }

    try {
      const client = getSupabase();
      
      // 获取产品信息
      const { data: product, error: productError } = await client
        .from('products')
        .select('id, name, package_specs, total_stock_ml')
        .eq('id', productId)
        .maybeSingle();
      if (productError) {
        console.error('[stockStorage.getByProductId] 获取产品错误:', productError.message);
        throw new Error(`获取产品失败: ${productError.message}`);
      }
      if (!product) return null;
      
      // 获取库存记录
      const { data: inventoryData, error: inventoryError } = await client
        .from('inventory')
        .select('*')
        .eq('product_id', productId);
      if (inventoryError) {
        console.error('[stockStorage.getByProductId] 获取库存错误:', inventoryError.message);
        throw new Error(`获取库存失败: ${inventoryError.message}`);
      }
      
      const packageSpecs: any[] = product.package_specs || [];
      const packages: any[] = (inventoryData || []).map(inv => ({
        specId: `${inv.spec_ml}ml`,
        specName: `${inv.spec_ml}ml`,
        count: inv.quantity,
      }));
      
      let totalAvailable = product.total_stock_ml || 0;
      let looseAmount = totalAvailable;
      
      for (const inv of inventoryData || []) {
        looseAmount -= inv.spec_ml * inv.quantity;
      }
      
      return {
        productId,
        totalAvailable,
        packages,
        looseAmount: Math.max(0, looseAmount),
      };
    } catch (error) {
      console.error('[stockStorage.getByProductId] 获取库存失败:', error);
      return null;
    }
  },

  async updateTotalStock(productId: string, totalStock: number): Promise<void> {
    if (!isClient()) {
      throw new Error('Supabase 不可用，无法更新库存');
    }

    try {
      const client = getSupabase();
      const { error } = await client
        .from('products')
        .update({ total_stock_ml: totalStock })
        .eq('id', productId);
      if (error) {
        console.error('[stockStorage.updateTotalStock] Supabase 更新错误:', error.message);
        throw new Error(`更新总库存失败: ${error.message}`);
      }
      console.log('[stockStorage.updateTotalStock] 成功更新总库存:', productId, totalStock);
    } catch (error) {
      console.error('[stockStorage.updateTotalStock] 更新库存失败:', error);
      throw error;
    }
  },

  async updatePackageQuantity(productId: string, specMl: number, quantity: number): Promise<void> {
    if (!isClient()) {
      throw new Error('Supabase 不可用，无法更新库存');
    }

    try {
      const client = getSupabase();
      
      // 使用 upsert 更新或创建库存记录
      const { error } = await client
        .from('inventory')
        .upsert(
          { product_id: productId, spec_ml: specMl, quantity },
          { onConflict: 'product_id,spec_ml' }
        );
      if (error) {
        console.error('[stockStorage.updatePackageQuantity] Supabase 更新错误:', error.message);
        throw new Error(`更新库存失败: ${error.message}`);
      }
      console.log('[stockStorage.updatePackageQuantity] 成功更新库存:', productId, specMl, quantity);
    } catch (error) {
      console.error('[stockStorage.updatePackageQuantity] 更新库存失败:', error);
      throw error;
    }
  },

  async delete(productId: string): Promise<void> {
    if (!isClient()) {
      throw new Error('Supabase 不可用，无法删除库存');
    }

    try {
      const client = getSupabase();
      const { error } = await client
        .from('inventory')
        .delete()
        .eq('product_id', productId);
      if (error) {
        console.error('[stockStorage.delete] Supabase 删除错误:', error.message);
        throw new Error(`删除库存失败: ${error.message}`);
      }
    } catch (error) {
      console.error('[stockStorage.delete] 删除库存失败:', error);
      throw error;
    }
  },
};

// 成本计算工具
export const costCalculator = {
  // 计算原料最小单位单价
  calculateMinUnitPrice(
    purchasePrice: number,
    purchaseSpec: string,
    minUnit: string
  ): number {
    const spec = purchaseSpec.toLowerCase();
    let totalAmount = 0;
    let unitMultiplier = 1;

    if (minUnit === 'g') {
      if (spec.includes('kg')) unitMultiplier = 1000;
    } else if (minUnit === 'ml') {
      if (spec.includes('l') && !spec.includes('ml')) unitMultiplier = 1000;
    } else if (minUnit === 'kg') {
      if (spec.includes('g') && !spec.includes('kg')) unitMultiplier = 0.001;
    } else if (minUnit === 'L') {
      if (spec.includes('ml')) unitMultiplier = 0.001;
    }

    const match = spec.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      totalAmount = parseFloat(match[1]) * unitMultiplier;
    }

    if (totalAmount === 0) return 0;
    return purchasePrice / totalAmount;
  },

  // 计算产品成本（优先使用 steps，降级使用 ingredients）
  calculateProductCost(
    product: Product,
    ingredients: Ingredient[]
  ): number {
    let totalCost = 0;
    
    // 优先使用 steps
    if (product.steps && product.steps.length > 0) {
      for (const step of product.steps) {
        for (const si of step.ingredients) {
          const ingredient = ingredients.find((i) => i.id === si.ingredientId);
          if (!ingredient) continue;
          const cost = si.inputAmount * ingredient.minUnitPrice;
          totalCost += cost;
        }
      }
    } else {
      // 降级使用 ingredients
      for (const pi of product.ingredients) {
        const ingredient = ingredients.find((i) => i.id === pi.ingredientId);
        if (!ingredient) continue;
        const cost = pi.inputAmount * ingredient.minUnitPrice;
        totalCost += cost;
      }
    }

    return totalCost;
  },

  // 计算损耗比例
  calculateLossRatio(inputAmount: number, resultWeight: number): number {
    if (inputAmount === 0) return 0;
    return ((inputAmount - resultWeight) / inputAmount) * 100;
  },

  // 按目标出品量换算原料用量（基于 steps 结构）
  scaleIngredients(
    product: Product,
    targetOutput: number
  ): Array<{
    ingredientId: string;
    ingredientName: string;
    originalAmount: number;
    scaledAmount: number;
    unit: string;
    method: string;
    methodName: string;
    resultWeight?: number;
    scaledResultWeight?: number;
    operationCount?: number;
  }> {
    const scale = targetOutput / product.standardOutput;
    
    // 优先使用 steps
    if (product.steps && product.steps.length > 0) {
      const result: Array<{
        ingredientId: string;
        ingredientName: string;
        originalAmount: number;
        scaledAmount: number;
        unit: string;
        method: string;
        methodName: string;
        resultWeight?: number;
        scaledResultWeight?: number;
        operationCount?: number;
      }> = [];
      
      for (const step of product.steps) {
        for (const si of step.ingredients) {
          const item: any = {
            ingredientId: si.ingredientId,
            ingredientName: si.ingredientName,
            originalAmount: si.inputAmount,
            scaledAmount: si.inputAmount * scale,
            unit: si.inputUnit,
            method: step.method,
            methodName: step.methodName,
          };
          
          if (step.resultWeight !== undefined) {
            item.resultWeight = step.resultWeight;
            item.scaledResultWeight = step.resultWeight * scale;
          }
          
          if (step.lockStandard && step.fixedInput && step.fixedOutput) {
            item.operationCount = Math.ceil(item.scaledAmount / step.fixedInput);
          }
          
          result.push(item);
        }
      }
      
      return result;
    }
    
    // 降级使用 ingredients
    return product.ingredients.map((pi) => {
      const result: any = {
        ingredientId: pi.ingredientId,
        ingredientName: pi.ingredientName,
        originalAmount: pi.inputAmount,
        scaledAmount: pi.inputAmount * scale,
        unit: pi.inputUnit,
        method: pi.method,
        methodName: pi.methodName,
      };

      if (pi.resultWeight !== undefined) {
        result.resultWeight = pi.resultWeight;
        result.scaledResultWeight = pi.resultWeight * scale;
      }

      if (pi.lockStandard && pi.fixedInput && pi.fixedOutput) {
        result.operationCount = Math.ceil(result.scaledAmount / pi.fixedInput);
      }

      return result;
    });
  },
};

// 循环依赖检测
export const dependencyChecker = {
  hasCircularDependency(
    productId: string,
    targetIngredientId: string,
    products: Product[]
  ): boolean {
    const visited = new Set<string>();
    const queue: string[] = [targetIngredientId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      if (currentId === productId) return true;

      const dependentProducts = products.filter(
        (p) => p.isIngredientProduct && p.id === currentId
      );

      for (const dp of dependentProducts) {
        // 同时检查 steps 和 ingredients
        const ingredientIds = new Set<string>();
        
        // 从 steps 获取
        if (dp.steps && dp.steps.length > 0) {
          for (const step of dp.steps) {
            for (const si of step.ingredients) {
              ingredientIds.add(si.ingredientId);
            }
          }
        }
        
        // 从 ingredients 获取（向后兼容）
        for (const i of dp.ingredients) {
          ingredientIds.add(i.ingredientId);
        }
        
        for (const ingId of ingredientIds) {
          if (ingId === productId) return true;
          queue.push(ingId);
        }
      }
    }

    return false;
  },
};
