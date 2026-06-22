// 全局配置类型
export interface GlobalConfig {
  password: string; // 全局密码
  packageSpecs: PackageSpec[]; // 包装规格
  brands: Brand[]; // 售卖品牌
  categories: Category[]; // 产品分类
  methods: Method[]; // 制作方法
  ingredientCategories: Category[]; // 原料分类
}

export interface PackageSpec {
  id: string;
  name: string; // 如 "100ml", "500ml"
  volume: number; // 容量数值
  enabled: boolean;
}

export interface Brand {
  id: string;
  name: string; // 如 "Life in麟敬", "Don't wait不等"
  enabled: boolean;
}

export interface Category {
  id: string;
  name: string; // 如 "水果", "咖啡", "草本", "香水", "其他", "原料产品"
  enabled: boolean;
}

export interface Method {
  id: string;
  name: string; // 制作方法名称
  hasLoss: boolean; // 是否有损耗
  enabled: boolean;
}

// 原料类型
export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  purchaseSpec: string; // 进货规格
  purchasePrice: number; // 进货单价（元）
  purchaseUnit: string; // 进货单位
  minUnitPrice: number; // 最小单位单价（自动计算）
  minUnit: 'g' | 'kg' | 'ml' | 'L'; // 最小单位
  source: 'purchase' | 'internal'; // 来源：采购/内部生产
  relatedProductId?: string; // 如果是内部生产，关联的产品ID
  createdAt: number;
  updatedAt: number;
}

export type IngredientCategory = '基酒' | '糖浆' | '水果' | '调料' | '自制原料' | '其他';

// 产品类型
export interface Product {
  id: string;
  name: string;
  category: string; // 分类ID
  brands: string[]; // 售卖品牌ID列表
  standardOutput: number; // 出品总量标准
  ingredients: ProductIngredient[]; // 原料明细
  packageSpecs: string[]; // 包装方案ID列表
  cost: number; // 成本（自动计算）
  isIngredientProduct: boolean; // 是否为原料产品
  createdAt: number;
  updatedAt: number;
}

// 产品原料明细
export interface ProductIngredient {
  id: string;
  ingredientId: string; // 关联原料ID
  ingredientName: string; // 原料名（冗余，便于显示）
  inputAmount: number; // 投入量
  inputUnit: 'g' | 'kg' | 'ml' | 'L'; // 投入单位
  method: string; // 操作方式ID
  methodName: string; // 操作方式名称（冗余）
  resultWeight?: number; // 结果液重- 有损耗时必填
  lockStandard: boolean; // 锁定每次标准
  fixedInput?: number; // 固定投入量
  fixedOutput?: number; // 固定结果液重
}

// 产品库存
export interface ProductStock {
  productId: string;
  totalAvailable: number; // 总可用量
  packages: PackageStock[]; // 各规格装瓶情况
  looseAmount: number; // 剩余散量（自动计算）
}

export interface PackageStock {
  specId: string; // 包装规格ID
  specName: string; // 包装规格名称
  count: number; // 装瓶数量
}

// 默认全局配置
export const DEFAULT_CONFIG: GlobalConfig = {
  password: '123456', // 默认密码
  packageSpecs: [
    { id: 'spec-1', name: '100ml', volume: 100, enabled: true },
    { id: 'spec-2', name: '500ml', volume: 500, enabled: true },
    { id: 'spec-3', name: '1000ml', volume: 1000, enabled: true },
    { id: 'spec-4', name: '1.5L', volume: 1500, enabled: true },
    { id: 'spec-5', name: '3L', volume: 3000, enabled: true },
  ],
  brands: [
    { id: 'brand-1', name: 'Life in麟敬', enabled: true },
    { id: 'brand-2', name: "Don't wait不等", enabled: true },
  ],
  categories: [
    { id: 'cat-1', name: '水果', enabled: true },
    { id: 'cat-2', name: '咖啡', enabled: true },
    { id: 'cat-3', name: '草本', enabled: true },
    { id: 'cat-4', name: '香水', enabled: true },
    { id: 'cat-5', name: '其他', enabled: true },
    { id: 'cat-6', name: '原料产品', enabled: true },
  ],
  methods: [
    // 无损耗
    { id: 'method-1', name: '直接加入', hasLoss: false, enabled: true },
    { id: 'method-2', name: '摇和', hasLoss: false, enabled: true },
    { id: 'method-3', name: '搅拌', hasLoss: false, enabled: true },
    { id: 'method-4', name: '滤冰', hasLoss: false, enabled: true },
    { id: 'method-5', name: '浮层', hasLoss: false, enabled: true },
    { id: 'method-6', name: '打发', hasLoss: false, enabled: true },
    // 有损耗
    { id: 'method-7', name: '压榨', hasLoss: true, enabled: true },
    { id: 'method-8', name: '加热', hasLoss: true, enabled: true },
    { id: 'method-9', name: '烟熏', hasLoss: true, enabled: true },
    { id: 'method-10', name: '浸泡', hasLoss: true, enabled: true },
    { id: 'method-11', name: '旋转蒸馏', hasLoss: true, enabled: true },
    { id: 'method-12', name: '离心', hasLoss: true, enabled: true },
    { id: 'method-13', name: '奶洗', hasLoss: true, enabled: true },
    { id: 'method-14', name: '油洗', hasLoss: true, enabled: true },
  ],
  ingredientCategories: [
    { id: 'icat-1', name: '基酒', enabled: true },
    { id: 'icat-2', name: '糖浆', enabled: true },
    { id: 'icat-3', name: '水果', enabled: true },
    { id: 'icat-4', name: '调料', enabled: true },
    { id: 'icat-5', name: '自制原料', enabled: true },
    { id: 'icat-6', name: '其他', enabled: true },
  ],
};