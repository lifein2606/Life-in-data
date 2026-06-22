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
} from '@/types';

// Supabase 客户端获取函数（延迟初始化，仅在客户端）
const getSupabase = () => {
  if (!isClient()) {
    throw new Error('Supabase operations can only be performed on the client side');
  }
  return getSupabaseClient();
};



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

// 产品记录转前端类型
function productRecordToModel(record: any): Product {
  return {
    id: record.id,
    name: record.name,
    category: record.category,
    brands: record.brands || [],
    standardOutput: record.total_output_ml,
    ingredients: (record.ingredients || []).map((i: any) => ({
      ...i,
      // 保持字段名不变
    })),
    packageSpecs: record.package_specs || [],
    cost: 0, // 成本需要实时计算
    isIngredientProduct: record.is_ingredient_product,
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
function ingredientRecordToModel(record: any): Ingredient {
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
      return (data || []).map(ingredientRecordToModel);
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
      return data ? ingredientRecordToModel(data) : null;
    } catch (error) {
      console.error('[ingredientStorage.getById] 获取原料失败:', error);
      return null;
    }
  },

  async add(ingredient: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ingredient> {
    console.log('[ingredientStorage.add] 开始添加原料');
    
    if (!isClient()) {
      throw new Error('[ingredientStorage.add] 必须在客户端执行');
    }

    try {
      const client = getSupabase();
      const record = ingredientModelToRecord(ingredient);
      
      console.log('[ingredientStorage.add] 准备插入记录:', JSON.stringify(record, null, 2));
      
      const { data, error } = await client
        .from('ingredients')
        .insert(record)
        .select()
        .single();
      
      if (error) {
        console.error('[ingredientStorage.add] Supabase 插入错误:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw new Error(`添加原料失败: ${error.message} (code: ${error.code})`);
      }
      
      console.log('[ingredientStorage.add] 成功添加原料:', data?.id);
      return ingredientRecordToModel(data);
    } catch (error: any) {
      console.error('[ingredientStorage.add] 添加原料失败:', {
        message: error?.message,
        stack: error?.stack,
        ingredient: JSON.stringify(ingredient, null, 2),
      });
      throw error;
    }
  },

  async update(id: string, updates: Partial<Omit<Ingredient, 'id' | 'createdAt'>>): Promise<Ingredient | null> {
    if (!isClient()) {
      throw new Error('Supabase 不可用，无法更新原料');
    }

    try {
      const client = getSupabase();
      const record: any = {};
      
      if (updates.name !== undefined) record.name = updates.name;
      if (updates.category !== undefined) record.category = updates.category;
      if (updates.purchaseSpec !== undefined) record.purchase_spec = updates.purchaseSpec;
      if (updates.purchasePrice !== undefined) record.purchase_price = updates.purchasePrice.toString();
      if (updates.minUnitPrice !== undefined) record.unit_price = updates.minUnitPrice.toString();
      if (updates.minUnit !== undefined) record.min_unit = updates.minUnit;
      if (updates.source !== undefined) record.source = updates.source;
      if (updates.relatedProductId !== undefined) record.linked_product_id = updates.relatedProductId && updates.relatedProductId.trim() !== '' ? updates.relatedProductId : null;
      
      const { data, error } = await client
        .from('ingredients')
        .update(record)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) {
        console.error('[ingredientStorage.update] Supabase 更新错误:', error.message);
        throw new Error(`更新原料失败: ${error.message}`);
      }
      console.log('[ingredientStorage.update] 成功更新原料:', id);
      return data ? ingredientRecordToModel(data) : null;
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
      console.log('[ingredientStorage.delete] 成功删除原料:', id);
      return true;
    } catch (error) {
      console.error('[ingredientStorage.delete] 删除原料失败:', error);
      throw error;
    }
  },

  // 检查原料是否被产品使用
  isUsedInProducts(id: string, products: Product[]): boolean {
    return products.some((p) => p.ingredients.some((i) => i.ingredientId === id));
  },
};

// 产品存储
export const productStorage = {
  async getAll(): Promise<Product[]> {
    // 必须在客户端执行
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
      return (data || []).map(productRecordToModel);
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
      return data ? productRecordToModel(data) : null;
    } catch (error) {
      console.error('[productStorage.getById] 获取产品失败:', error);
      return null;
    }
  },

  async add(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'cost'>): Promise<Product> {
    if (!isClient()) {
      throw new Error('Supabase 不可用，无法添加产品');
    }

    try {
      const client = getSupabase();
      const record = productModelToRecord(product);
      const { data, error } = await client
        .from('products')
        .insert(record)
        .select()
        .single();
      if (error) {
        console.error('[productStorage.add] Supabase 插入错误:', error.message);
        throw new Error(`添加产品失败: ${error.message}`);
      }
      console.log('[productStorage.add] 成功添加产品:', data?.id);
      return productRecordToModel(data);
    } catch (error) {
      console.error('[productStorage.add] 添加产品失败:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product | null> {
    if (!isClient()) {
      throw new Error('Supabase 不可用，无法更新产品');
    }

    try {
      const client = getSupabase();
      const record: any = {};
      
      if (updates.name !== undefined) record.name = updates.name;
      if (updates.category !== undefined) record.category = updates.category;
      if (updates.brands !== undefined) record.brands = updates.brands;
      if (updates.standardOutput !== undefined) record.total_output_ml = updates.standardOutput;
      if (updates.ingredients !== undefined) record.ingredients = updates.ingredients;
      if (updates.packageSpecs !== undefined) record.package_specs = updates.packageSpecs;
      if (updates.isIngredientProduct !== undefined) record.is_ingredient_product = updates.isIngredientProduct;
      
      const { data, error } = await client
        .from('products')
        .update(record)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) {
        console.error('[productStorage.update] Supabase 更新错误:', error.message);
        throw new Error(`更新产品失败: ${error.message}`);
      }
      console.log('[productStorage.update] 成功更新产品:', id);
      return data ? productRecordToModel(data) : null;
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
      return (data || []).map(productRecordToModel);
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

// 成本计算工具（保持不变）
export const costCalculator = {
  // 计算原料最小单位单价
  calculateMinUnitPrice(
    purchasePrice: number,
    purchaseSpec: string,
    minUnit: 'g' | 'kg' | 'ml' | 'L'
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

  // 计算产品成本
  calculateProductCost(
    product: Product,
    ingredients: Ingredient[]
  ): number {
    let totalCost = 0;

    for (const pi of product.ingredients) {
      const ingredient = ingredients.find((i) => i.id === pi.ingredientId);
      if (!ingredient) continue;

      const cost = pi.inputAmount * ingredient.minUnitPrice;
      totalCost += cost;
    }

    return totalCost;
  },

  // 计算损耗比例
  calculateLossRatio(inputAmount: number, resultWeight: number): number {
    if (inputAmount === 0) return 0;
    return ((inputAmount - resultWeight) / inputAmount) * 100;
  },

  // 按目标出品量换算原料用量
  scaleIngredients(
    product: Product,
    targetOutput: number
  ): Array<{
    ingredientId: string;
    ingredientName: string;
    originalAmount: number;
    scaledAmount: number;
    unit: 'g' | 'kg' | 'ml' | 'L';
    method: string;
    methodName: string;
    resultWeight?: number;
    scaledResultWeight?: number;
    operationCount?: number;
  }> {
    const scale = targetOutput / product.standardOutput;

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

// 循环依赖检测（保持不变）
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
        for (const i of dp.ingredients) {
          if (i.ingredientId === productId) return true;
          queue.push(i.ingredientId);
        }
      }
    }

    return false;
  },
};