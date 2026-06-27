// 全局配置类型
export interface GlobalConfig {
  password: string; // 全局密码
  packageSpecs: PackageSpec[]; // 包装规格
  brands: Brand[]; // 售卖品牌
  categories: Category[]; // 产品分类
  methods: Method[]; // 制作方法
  ingredientCategories: Category[]; // 原料分类
  ingredientSources: IngredientSource[]; // 原料来源
  ingredientUnits: IngredientUnit[]; // 原料单位
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

export interface IngredientSource {
  id: string;
  name: string; // 显示名称，如 '采购', '内部生产'
  value: string; // 存储值，如 'purchase', 'internal'
  enabled: boolean;
}

export interface IngredientUnit {
  id: string;
  name: string; // 显示名称，如 '克(g)', '千克(kg)'
  value: string; // 存储值，如 'g', 'kg'
  enabled: boolean;
}

// 原料类型
export interface Ingredient {
  id: string;
  name: string;
  category: string;
  purchaseSpec: string; // 进货规格
  purchasePrice: number; // 进货单价（元）
  purchaseUnit: string; // 进货单位
  minUnitPrice: number; // 最小单位单价（自动计算）
  minUnit: string; // 最小单位
  source: string; // 来源
  abv: number; // 酒精度（%），新增字段
  relatedProductId?: string; // 如果是内部生产，关联的产品ID
  createdAt: number;
  updatedAt: number;
}

// 产品类型
export interface Product {
  id: string;
  name: string;
  category: string; // 分类ID
  brands: string[]; // 售卖品牌ID列表
  standardOutput: number; // 出品总量标准
  ingredients: ProductIngredient[]; // 原料明细（向后兼容）
  steps: ProductionStep[]; // 操作步骤分组（新增）
  packageSpecs: string[]; // 包装方案ID列表
  cost: number; // 成本（自动计算）
  costManualOverride?: boolean; // 是否手动覆盖成本
  manualCost?: number; // 手动设定的成本值
  isIngredientProduct: boolean; // 是否为原料产品
  abv: number; // 酒精度（%），新增字段
  abvManualOverride: boolean; // 是否手动覆盖ABV
  createdAt: number;
  updatedAt: number;
}

// 步骤内的原料（精简版）
export interface StepIngredient {
  id: string;
  ingredientId: string;
  ingredientName: string;
  inputAmount: number;
  inputUnit: string;
}

// 操作步骤（分组结构）
export interface ProductionStep {
  id: string;
  method: string;       // 操作方式ID
  methodName: string;   // 操作方式名称
  ingredients: StepIngredient[];  // 同一步骤的多个原料
  resultWeight?: number;
  lockStandard: boolean;
  fixedInput?: number;
  fixedOutput?: number;
}

// 产品原料明细（保留用于向后兼容）
export interface ProductIngredient {
  id: string;
  ingredientId: string; // 关联原料ID
  ingredientName: string; // 原料名（冗余，便于显示）
  inputAmount: number; // 投入量
  inputUnit: string; // 投入单位
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

// 制作记录
export interface ProductionLog {
  id: string;
  timestamp: number;                    // 制作时间（可手动修改后保存）
  maker: string;                        // 实际制作人
  targetOutput: number;                 // 本次出品标准量(ml)
  ingredients: Array<{                  // 原料实际用量
    ingredientId: string;
    ingredientName: string;
    unit: string;
    plannedAmount: number;              // 计划用量（系统按出品量缩放）
    actualAmount: number;               // 实际投入量
  }>;
  stepResults: Array<{                  // 有损耗步骤的实际结果液重
    stepIndex: number;
    methodName: string;
    plannedResultWeight: number;        // 计划结果液重
    actualResultWeight: number;         // 实际结果液重
  }>;
  actualFinalOutput: number;            // 实际成品出品量
  actualCost: number;                   // 实际总成本
  standardCost: number;                 // 标准成本（本次出品量对应的）
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
  ingredientSources: [
    { id: 'isrc-1', name: '采购', value: 'purchase', enabled: true },
    { id: 'isrc-2', name: '内部生产', value: 'internal', enabled: true },
  ],
  ingredientUnits: [
    { id: 'iunit-1', name: '克(g)', value: 'g', enabled: true },
    { id: 'iunit-2', name: '千克(kg)', value: 'kg', enabled: true },
    { id: 'iunit-3', name: '毫升(ml)', value: 'ml', enabled: true },
    { id: 'iunit-4', name: '升(L)', value: 'L', enabled: true },
  ],
};
