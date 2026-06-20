(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/workspace/projects/src/types/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// 全局配置类型
__turbopack_context__.s([
    "DEFAULT_CONFIG",
    ()=>DEFAULT_CONFIG
]);
const DEFAULT_CONFIG = {
    password: '123456',
    // 默认密码
    packageSpecs: [
        {
            id: 'spec-1',
            name: '100ml',
            volume: 100,
            enabled: true
        },
        {
            id: 'spec-2',
            name: '500ml',
            volume: 500,
            enabled: true
        },
        {
            id: 'spec-3',
            name: '1000ml',
            volume: 1000,
            enabled: true
        },
        {
            id: 'spec-4',
            name: '1.5L',
            volume: 1500,
            enabled: true
        },
        {
            id: 'spec-5',
            name: '3L',
            volume: 3000,
            enabled: true
        }
    ],
    brands: [
        {
            id: 'brand-1',
            name: 'Life in麟敬',
            enabled: true
        },
        {
            id: 'brand-2',
            name: "Don't wait不等",
            enabled: true
        }
    ],
    categories: [
        {
            id: 'cat-1',
            name: '水果',
            enabled: true
        },
        {
            id: 'cat-2',
            name: '咖啡',
            enabled: true
        },
        {
            id: 'cat-3',
            name: '草本',
            enabled: true
        },
        {
            id: 'cat-4',
            name: '香水',
            enabled: true
        },
        {
            id: 'cat-5',
            name: '其他',
            enabled: true
        },
        {
            id: 'cat-6',
            name: '原料产品',
            enabled: true
        }
    ],
    methods: [
        // 无损耗
        {
            id: 'method-1',
            name: '直接加入',
            hasLoss: false,
            enabled: true
        },
        {
            id: 'method-2',
            name: '摇和',
            hasLoss: false,
            enabled: true
        },
        {
            id: 'method-3',
            name: '搅拌',
            hasLoss: false,
            enabled: true
        },
        {
            id: 'method-4',
            name: '滤冰',
            hasLoss: false,
            enabled: true
        },
        {
            id: 'method-5',
            name: '浮层',
            hasLoss: false,
            enabled: true
        },
        {
            id: 'method-6',
            name: '打发',
            hasLoss: false,
            enabled: true
        },
        // 有损耗
        {
            id: 'method-7',
            name: '压榨',
            hasLoss: true,
            enabled: true
        },
        {
            id: 'method-8',
            name: '加热',
            hasLoss: true,
            enabled: true
        },
        {
            id: 'method-9',
            name: '烟熏',
            hasLoss: true,
            enabled: true
        },
        {
            id: 'method-10',
            name: '浸泡',
            hasLoss: true,
            enabled: true
        },
        {
            id: 'method-11',
            name: '旋转蒸馏',
            hasLoss: true,
            enabled: true
        },
        {
            id: 'method-12',
            name: '离心',
            hasLoss: true,
            enabled: true
        },
        {
            id: 'method-13',
            name: '奶洗',
            hasLoss: true,
            enabled: true
        },
        {
            id: 'method-14',
            name: '油洗',
            hasLoss: true,
            enabled: true
        }
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/workspace/projects/src/storage/database/supabase-client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSupabaseClient",
    ()=>getSupabaseClient,
    "isClient",
    ()=>isClient
]);
/**
 * Supabase 客户端初始化
 * 直接使用硬编码的 URL 和 Key，不依赖环境变量
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/@supabase+supabase-js@2.95.3/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
// Supabase 配置（硬编码）
const SUPABASE_URL = 'https://br-tidy-hare-2c5e43d3.supabase2.aidap-global.cn-beijing.volces.com';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNjI0NjI2ODMsInJvbGUiOiJhbm9uIn0.Ia-EdaOfcZmLg0WYjck71f1oHNJ_Amjq9TeElbWCzXU';
// 创建 Supabase 客户端
const supabaseClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$95$2e$3$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(SUPABASE_URL, SUPABASE_ANON_KEY);
function getSupabaseClient() {
    return supabaseClient;
}
function isClient() {
    return ("TURBOPACK compile-time value", "object") !== 'undefined';
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/workspace/projects/src/lib/storage.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "configStorage",
    ()=>configStorage,
    "costCalculator",
    ()=>costCalculator,
    "dependencyChecker",
    ()=>dependencyChecker,
    "generateId",
    ()=>generateId,
    "ingredientStorage",
    ()=>ingredientStorage,
    "productStorage",
    ()=>productStorage,
    "stockStorage",
    ()=>stockStorage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$storage$2f$database$2f$supabase$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/src/storage/database/supabase-client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/src/types/index.ts [app-client] (ecmascript)");
;
;
// Supabase 客户端获取函数（延迟初始化，仅在客户端）
const getSupabase = ()=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$storage$2f$database$2f$supabase$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isClient"])()) {
        throw new Error('Supabase operations can only be performed on the client side');
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$storage$2f$database$2f$supabase$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabaseClient"])();
};
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
// 数据库记录类型转换函数
// 产品记录转前端类型
function productRecordToModel(record) {
    return {
        id: record.id,
        name: record.name,
        category: record.category,
        brands: record.brands || [],
        standardOutput: record.total_output_ml,
        ingredients: (record.ingredients || []).map((i)=>({
                ...i
            })),
        packageSpecs: record.package_specs || [],
        cost: 0,
        // 成本需要实时计算
        isIngredientProduct: record.is_ingredient_product,
        createdAt: new Date(record.created_at).getTime(),
        updatedAt: new Date(record.updated_at).getTime()
    };
}
// 前端产品类型转数据库记录
function productModelToRecord(product) {
    return {
        name: product.name,
        category: product.category,
        brands: product.brands,
        is_ingredient_product: product.isIngredientProduct,
        total_output_ml: product.standardOutput,
        ingredients: product.ingredients,
        package_specs: product.packageSpecs,
        total_stock_ml: 0
    };
}
// 原料记录转前端类型
function ingredientRecordToModel(record) {
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
        updatedAt: new Date(record.updated_at).getTime()
    };
}
// 前端原料类型转数据库记录
function ingredientModelToRecord(ingredient) {
    console.log('[ingredientModelToRecord] 输入数据:', JSON.stringify(ingredient, null, 2));
    const record = {
        name: ingredient.name,
        category: ingredient.category,
        source: ingredient.source || 'purchase',
        min_unit: ingredient.minUnit || 'g',
        purchase_spec: ingredient.purchaseSpec || '',
        purchase_price: (ingredient.purchasePrice || 0).toString(),
        unit_price: (ingredient.minUnitPrice || 0).toString(),
        linked_product_id: ingredient.relatedProductId && ingredient.relatedProductId.trim() !== '' ? ingredient.relatedProductId : null
    };
    console.log('[ingredientModelToRecord] 输出记录:', JSON.stringify(record, null, 2));
    return record;
}
const configStorage = {
    async get () {
        // 必须在客户端执行
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$storage$2f$database$2f$supabase$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isClient"])()) {
            console.warn('[configStorage.get] SSR 环境，返回默认配置');
            return __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_CONFIG"];
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
            const configMap = new Map();
            for (const item of data || []){
                configMap.set(item.key, item.value);
            }
            console.log('[configStorage.get] 成功获取配置，数据条数:', data?.length || 0);
            // 合并默认配置
            return {
                password: configMap.get('global_password') || __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_CONFIG"].password,
                packageSpecs: configMap.get('package_specs') || __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_CONFIG"].packageSpecs,
                brands: configMap.get('brands') || __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_CONFIG"].brands,
                categories: configMap.get('categories') || __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_CONFIG"].categories,
                methods: configMap.get('methods') || __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_CONFIG"].methods
            };
        } catch (error) {
            console.error('[configStorage.get] 获取配置失败:', error);
            // 返回默认配置，但不使用 localStorage
            return __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_CONFIG"];
        }
    },
    async set (config) {
        const client = getSupabase();
        // 更新各个配置项
        const configs = [
            {
                key: 'global_password',
                value: config.password
            },
            {
                key: 'package_specs',
                value: config.packageSpecs
            },
            {
                key: 'brands',
                value: config.brands
            },
            {
                key: 'categories',
                value: config.categories
            },
            {
                key: 'methods',
                value: config.methods
            }
        ];
        for (const c of configs){
            const { error } = await client.from('settings').upsert({
                key: c.key,
                value: c.value
            }, {
                onConflict: 'key'
            });
            if (error) throw new Error(`更新配置失败: ${error.message}`);
        }
    },
    async verifyPassword (input) {
        // 必须在客户端执行
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$storage$2f$database$2f$supabase$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isClient"])()) {
            console.warn('[configStorage.verifyPassword] SSR 环境，使用默认密码验证');
            return input === __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_CONFIG"].password;
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
            return input === __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_CONFIG"].password;
        }
    },
    async updatePassword (newPassword) {
        const config = await this.get();
        config.password = newPassword;
        await this.set(config);
    }
};
const ingredientStorage = {
    async getAll () {
        // 必须在客户端执行
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$storage$2f$database$2f$supabase$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isClient"])()) {
            console.warn('[ingredientStorage.getAll] SSR 环境，返回空数组');
            return [];
        }
        // 直接调用 Supabase
        try {
            const client = getSupabase();
            const { data, error } = await client.from('ingredients').select('*').order('created_at', {
                ascending: false
            });
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
    async getById (id) {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$storage$2f$database$2f$supabase$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isClient"])()) {
            return null;
        }
        try {
            const client = getSupabase();
            const { data, error } = await client.from('ingredients').select('*').eq('id', id).maybeSingle();
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
    async add (ingredient) {
        console.log('[ingredientStorage.add] 开始添加原料');
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$storage$2f$database$2f$supabase$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isClient"])()) {
            throw new Error('[ingredientStorage.add] 必须在客户端执行');
        }
        try {
            const client = getSupabase();
            const record = ingredientModelToRecord(ingredient);
            console.log('[ingredientStorage.add] 准备插入记录:', JSON.stringify(record, null, 2));
            const { data, error } = await client.from('ingredients').insert(record).select().single();
            if (error) {
                console.error('[ingredientStorage.add] Supabase 插入错误:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                });
                throw new Error(`添加原料失败: ${error.message} (code: ${error.code})`);
            }
            console.log('[ingredientStorage.add] 成功添加原料:', data?.id);
            return ingredientRecordToModel(data);
        } catch (error) {
            console.error('[ingredientStorage.add] 添加原料失败:', {
                message: error?.message,
                stack: error?.stack,
                ingredient: JSON.stringify(ingredient, null, 2)
            });
            throw error;
        }
    },
    async update (id, updates) {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$storage$2f$database$2f$supabase$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isClient"])()) {
            throw new Error('Supabase 不可用，无法更新原料');
        }
        try {
            const client = getSupabase();
            const record = {};
            if (updates.name !== undefined) record.name = updates.name;
            if (updates.category !== undefined) record.category = updates.category;
            if (updates.purchaseSpec !== undefined) record.purchase_spec = updates.purchaseSpec;
            if (updates.purchasePrice !== undefined) record.purchase_price = updates.purchasePrice.toString();
            if (updates.minUnitPrice !== undefined) record.unit_price = updates.minUnitPrice.toString();
            if (updates.minUnit !== undefined) record.min_unit = updates.minUnit;
            if (updates.source !== undefined) record.source = updates.source;
            if (updates.relatedProductId !== undefined) record.linked_product_id = updates.relatedProductId && updates.relatedProductId.trim() !== '' ? updates.relatedProductId : null;
            const { data, error } = await client.from('ingredients').update(record).eq('id', id).select().maybeSingle();
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
    async delete (id) {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$storage$2f$database$2f$supabase$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isClient"])()) {
            throw new Error('Supabase 不可用，无法删除原料');
        }
        try {
            const client = getSupabase();
            const { error } = await client.from('ingredients').delete().eq('id', id);
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
    isUsedInProducts (id, products) {
        return products.some((p)=>p.ingredients.some((i)=>i.ingredientId === id));
    }
};
const productStorage = {
    async getAll () {
        // 必须在客户端执行
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$storage$2f$database$2f$supabase$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isClient"])()) {
            console.warn('[productStorage.getAll] SSR 环境，返回空数组');
            return [];
        }
        try {
            const client = getSupabase();
            const { data, error } = await client.from('products').select('*').order('created_at', {
                ascending: false
            });
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
    async getById (id) {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$storage$2f$database$2f$supabase$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isClient"])()) {
            return null;
        }
        try {
            const client = getSupabase();
            const { data, error } = await client.from('products').select('*').eq('id', id).maybeSingle();
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
    async add (product) {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$storage$2f$database$2f$supabase$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isClient"])()) {
            throw new Error('Supabase 不可用，无法添加产品');
        }
        try {
            const client = getSupabase();
            const record = productModelToRecord(product);
            const { data, error } = await client.from('products').insert(record).select().single();
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
    async update (id, updates) {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$storage$2f$database$2f$supabase$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isClient"])()) {
            throw new Error('Supabase 不可用，无法更新产品');
        }
        try {
            const client = getSupabase();
            const record = {};
            if (updates.name !== undefined) record.name = updates.name;
            if (updates.category !== undefined) record.category = updates.category;
            if (updates.brands !== undefined) record.brands = updates.brands;
            if (updates.standardOutput !== undefined) record.total_output_ml = updates.standardOutput;
            if (updates.ingredients !== undefined) record.ingredients = updates.ingredients;
            if (updates.packageSpecs !== undefined) record.package_specs = updates.packageSpecs;
            if (updates.isIngredientProduct !== undefined) record.is_ingredient_product = updates.isIngredientProduct;
            const { data, error } = await client.from('products').update(record).eq('id', id).select().maybeSingle();
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
    async delete (id) {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$storage$2f$database$2f$supabase$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isClient"])()) {
            throw new Error('Supabase 不可用，无法删除产品');
        }
        try {
            const client = getSupabase();
            // 先删除库存记录
            const { error: inventoryError } = await client.from('inventory').delete().eq('product_id', id);
            if (inventoryError) {
                console.error('[productStorage.delete] 删除库存错误:', inventoryError.message);
            // 继续删除产品，即使库存删除失败
            }
            // 删除产品
            const { error } = await client.from('products').delete().eq('id', id);
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
    async getIngredientProducts () {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$storage$2f$database$2f$supabase$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isClient"])()) {
            return [];
        }
        try {
            const client = getSupabase();
            const { data, error } = await client.from('products').select('*').eq('is_ingredient_product', true).order('created_at', {
                ascending: false
            });
            if (error) {
                console.error('[productStorage.getIngredientProducts] Supabase 查询错误:', error.message);
                throw new Error(`获取原料产品失败: ${error.message}`);
            }
            return (data || []).map(productRecordToModel);
        } catch (error) {
            console.error('[productStorage.getIngredientProducts] 获取原料产品失败:', error);
            return [];
        }
    }
};
const stockStorage = {
    async getAll () {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$storage$2f$database$2f$supabase$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isClient"])()) {
            return [];
        }
        try {
            const client = getSupabase();
            // 获取所有库存记录
            const { data: inventoryData, error: inventoryError } = await client.from('inventory').select('*').order('product_id');
            if (inventoryError) {
                console.error('[stockStorage.getAll] 获取库存错误:', inventoryError.message);
                throw new Error(`获取库存失败: ${inventoryError.message}`);
            }
            // 获取所有产品
            const { data: productData, error: productError } = await client.from('products').select('id, name, package_specs, total_stock_ml');
            if (productError) {
                console.error('[stockStorage.getAll] 获取产品错误:', productError.message);
                throw new Error(`获取产品失败: ${productError.message}`);
            }
            // 组装库存数据
            const stocks = [];
            const productMap = new Map();
            for (const p of productData || []){
                productMap.set(p.id, p);
            }
            // 按产品分组库存
            const inventoryByProduct = new Map();
            for (const inv of inventoryData || []){
                const list = inventoryByProduct.get(inv.product_id) || [];
                list.push(inv);
                inventoryByProduct.set(inv.product_id, list);
            }
            // 构建每个产品的库存
            for (const [productId, inventories] of inventoryByProduct){
                const product = productMap.get(productId);
                if (!product) continue;
                const packageSpecs = product.package_specs || [];
                const packages = inventories.map((inv)=>({
                        specId: `${inv.spec_ml}ml`,
                        specName: `${inv.spec_ml}ml`,
                        count: inv.quantity
                    }));
                // 计算总可用量
                let totalAvailable = product.total_stock_ml || 0;
                let looseAmount = totalAvailable;
                // 减去已装瓶量
                for (const inv of inventories){
                    looseAmount -= inv.spec_ml * inv.quantity;
                }
                stocks.push({
                    productId,
                    totalAvailable,
                    packages,
                    looseAmount: Math.max(0, looseAmount)
                });
            }
            // 补充没有库存记录的产品
            for (const [productId, product] of productMap){
                if (!inventoryByProduct.has(productId)) {
                    stocks.push({
                        productId,
                        totalAvailable: product.total_stock_ml || 0,
                        packages: [],
                        looseAmount: product.total_stock_ml || 0
                    });
                }
            }
            return stocks;
        } catch (error) {
            console.error('[stockStorage.getAll] 获取库存失败:', error);
            return [];
        }
    },
    async getByProductId (productId) {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$storage$2f$database$2f$supabase$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isClient"])()) {
            return null;
        }
        try {
            const client = getSupabase();
            // 获取产品信息
            const { data: product, error: productError } = await client.from('products').select('id, name, package_specs, total_stock_ml').eq('id', productId).maybeSingle();
            if (productError) {
                console.error('[stockStorage.getByProductId] 获取产品错误:', productError.message);
                throw new Error(`获取产品失败: ${productError.message}`);
            }
            if (!product) return null;
            // 获取库存记录
            const { data: inventoryData, error: inventoryError } = await client.from('inventory').select('*').eq('product_id', productId);
            if (inventoryError) {
                console.error('[stockStorage.getByProductId] 获取库存错误:', inventoryError.message);
                throw new Error(`获取库存失败: ${inventoryError.message}`);
            }
            const packageSpecs = product.package_specs || [];
            const packages = (inventoryData || []).map((inv)=>({
                    specId: `${inv.spec_ml}ml`,
                    specName: `${inv.spec_ml}ml`,
                    count: inv.quantity
                }));
            let totalAvailable = product.total_stock_ml || 0;
            let looseAmount = totalAvailable;
            for (const inv of inventoryData || []){
                looseAmount -= inv.spec_ml * inv.quantity;
            }
            return {
                productId,
                totalAvailable,
                packages,
                looseAmount: Math.max(0, looseAmount)
            };
        } catch (error) {
            console.error('[stockStorage.getByProductId] 获取库存失败:', error);
            return null;
        }
    },
    async updateTotalStock (productId, totalStock) {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$storage$2f$database$2f$supabase$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isClient"])()) {
            throw new Error('Supabase 不可用，无法更新库存');
        }
        try {
            const client = getSupabase();
            const { error } = await client.from('products').update({
                total_stock_ml: totalStock
            }).eq('id', productId);
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
    async updatePackageQuantity (productId, specMl, quantity) {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$storage$2f$database$2f$supabase$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isClient"])()) {
            throw new Error('Supabase 不可用，无法更新库存');
        }
        try {
            const client = getSupabase();
            // 使用 upsert 更新或创建库存记录
            const { error } = await client.from('inventory').upsert({
                product_id: productId,
                spec_ml: specMl,
                quantity
            }, {
                onConflict: 'product_id,spec_ml'
            });
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
    async delete (productId) {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$storage$2f$database$2f$supabase$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isClient"])()) {
            throw new Error('Supabase 不可用，无法删除库存');
        }
        try {
            const client = getSupabase();
            const { error } = await client.from('inventory').delete().eq('product_id', productId);
            if (error) {
                console.error('[stockStorage.delete] Supabase 删除错误:', error.message);
                throw new Error(`删除库存失败: ${error.message}`);
            }
        } catch (error) {
            console.error('[stockStorage.delete] 删除库存失败:', error);
            throw error;
        }
    }
};
const costCalculator = {
    // 计算原料最小单位单价
    calculateMinUnitPrice (purchasePrice, purchaseSpec, minUnit) {
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
    calculateProductCost (product, ingredients) {
        let totalCost = 0;
        for (const pi of product.ingredients){
            const ingredient = ingredients.find((i)=>i.id === pi.ingredientId);
            if (!ingredient) continue;
            const cost = pi.inputAmount * ingredient.minUnitPrice;
            totalCost += cost;
        }
        return totalCost;
    },
    // 计算损耗比例
    calculateLossRatio (inputAmount, resultWeight) {
        if (inputAmount === 0) return 0;
        return (inputAmount - resultWeight) / inputAmount * 100;
    },
    // 按目标出品量换算原料用量
    scaleIngredients (product, targetOutput) {
        const scale = targetOutput / product.standardOutput;
        return product.ingredients.map((pi)=>{
            const result = {
                ingredientId: pi.ingredientId,
                ingredientName: pi.ingredientName,
                originalAmount: pi.inputAmount,
                scaledAmount: pi.inputAmount * scale,
                unit: pi.inputUnit,
                method: pi.method,
                methodName: pi.methodName
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
    }
};
const dependencyChecker = {
    hasCircularDependency (productId, targetIngredientId, products) {
        const visited = new Set();
        const queue = [
            targetIngredientId
        ];
        while(queue.length > 0){
            const currentId = queue.shift();
            if (visited.has(currentId)) continue;
            visited.add(currentId);
            if (currentId === productId) return true;
            const dependentProducts = products.filter((p)=>p.isIngredientProduct && p.id === currentId);
            for (const dp of dependentProducts){
                for (const i of dp.ingredients){
                    if (i.ingredientId === productId) return true;
                    queue.push(i.ingredientId);
                }
            }
        }
        return false;
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/workspace/projects/src/hooks/use-app.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppProvider",
    ()=>AppProvider,
    "useApp",
    ()=>useApp,
    "useIngredients",
    ()=>useIngredients,
    "useMode",
    ()=>useMode,
    "usePasswordAuth",
    ()=>usePasswordAuth,
    "useProducts",
    ()=>useProducts
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/next@16.1.1_@babel+core@7.28.6_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/next@16.1.1_@babel+core@7.28.6_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/src/types/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/src/lib/storage.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature();
'use client';
;
;
;
const AppContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AppProvider({ children }) {
    _s();
    const [config, setConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_CONFIG"]);
    const [ingredients, setIngredients] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [products, setProducts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [stocks, setStocks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isAuthenticated, setIsAuthenticated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // 初始化数据（客户端）
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppProvider.useEffect": ()=>{
            refreshData().finally({
                "AppProvider.useEffect": ()=>setLoading(false)
            }["AppProvider.useEffect"]);
        }
    }["AppProvider.useEffect"], []);
    const refreshData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AppProvider.useCallback[refreshData]": async ()=>{
            try {
                const [configData, ingredientsData, productsData, stocksData] = await Promise.all([
                    __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["configStorage"].get(),
                    __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ingredientStorage"].getAll(),
                    __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["productStorage"].getAll(),
                    __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stockStorage"].getAll()
                ]);
                // 计算产品成本
                const productsWithCost = productsData.map({
                    "AppProvider.useCallback[refreshData].productsWithCost": (product)=>({
                            ...product,
                            cost: __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["costCalculator"].calculateProductCost(product, ingredientsData)
                        })
                }["AppProvider.useCallback[refreshData].productsWithCost"]);
                setConfig(configData);
                setIngredients(ingredientsData);
                setProducts(productsWithCost);
                setStocks(stocksData);
            } catch (error) {
                console.error('刷新数据失败:', error);
            }
        }
    }["AppProvider.useCallback[refreshData]"], []);
    const authenticate = async (password)=>{
        try {
            const valid = await __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["configStorage"].verifyPassword(password);
            if (valid) {
                setIsAuthenticated(true);
            }
            return valid;
        } catch (error) {
            console.error('密码验证失败:', error);
            // 如果数据库连接失败，使用默认密码
            const defaultPassword = __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_CONFIG"].password;
            if (password === defaultPassword) {
                setIsAuthenticated(true);
                return true;
            }
            return false;
        }
    };
    const clearAuth = ()=>{
        setIsAuthenticated(false);
    };
    const updateConfig = async (newConfig)=>{
        await __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["configStorage"].set(newConfig);
        setConfig(newConfig);
    };
    // 进入编辑模式（需密码验证）
    const enterEditMode = async (password)=>{
        const valid = await authenticate(password);
        if (valid) {
            setMode('edit');
        }
        return valid;
    };
    // 进入查阅模式（无需密码）
    const enterViewMode = ()=>{
        setMode('view');
        clearAuth();
    };
    // 退出当前模式
    const exitMode = ()=>{
        setMode(null);
        clearAuth();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AppContext.Provider, {
        "data-inspector-line": "119",
        "data-inspector-column": "4",
        "data-inspector-relative-path": "src/hooks/use-app.tsx",
        value: {
            config,
            ingredients,
            products,
            stocks,
            loading,
            refreshData,
            isAuthenticated,
            authenticate,
            clearAuth,
            updateConfig,
            mode,
            setMode,
            enterEditMode,
            enterViewMode,
            exitMode
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/workspace/projects/src/hooks/use-app.tsx",
        lineNumber: 108,
        columnNumber: 10
    }, this);
}
_s(AppProvider, "UXSFJThvpF8Uq7jPxYtOqk1YWDI=");
_c = AppProvider;
function useApp() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}
_s1(useApp, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
function useMode() {
    _s2();
    const { mode, setMode, enterEditMode, enterViewMode, exitMode } = useApp();
    return {
        mode,
        setMode,
        enterEditMode,
        enterViewMode,
        exitMode
    };
}
_s2(useMode, "wW0Iescz8oTNeDA1tEm+lHQK2jw=", false, function() {
    return [
        useApp
    ];
});
function usePasswordAuth() {
    _s3();
    const { isAuthenticated, authenticate, clearAuth } = useApp();
    return {
        isAuthenticated,
        authenticate,
        clearAuth
    };
}
_s3(usePasswordAuth, "u2VmqDBVovN2mMlS8Rc2UjOtQwc=", false, function() {
    return [
        useApp
    ];
});
function useIngredients() {
    _s4();
    const { ingredients, refreshData } = useApp();
    const addIngredient = async (data)=>{
        const minUnitPrice = __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["costCalculator"].calculateMinUnitPrice(data.purchasePrice, data.purchaseSpec, data.minUnit);
        const newIngredient = await __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ingredientStorage"].add({
            ...data,
            minUnitPrice
        });
        await refreshData();
        return newIngredient;
    };
    const updateIngredient = async (id, data)=>{
        const ingredient = await __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ingredientStorage"].getById(id);
        if (ingredient) {
            const updateData = {
                ...data
            };
            if (data.purchasePrice !== undefined || data.purchaseSpec !== undefined) {
                const newPrice = data.purchasePrice ?? ingredient.purchasePrice;
                const newSpec = data.purchaseSpec ?? ingredient.purchaseSpec;
                updateData.minUnitPrice = __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["costCalculator"].calculateMinUnitPrice(newPrice, newSpec, ingredient.minUnit);
            }
            const updated = await __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ingredientStorage"].update(id, updateData);
            await refreshData();
            return updated;
        }
        return null;
    };
    const deleteIngredient = async (id)=>{
        const success = await __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ingredientStorage"].delete(id);
        await refreshData();
        return success;
    };
    return {
        ingredients,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        refreshData
    };
}
_s4(useIngredients, "2B7wfWsLoKG2MIW6TQos5depzxg=", false, function() {
    return [
        useApp
    ];
});
function useProducts() {
    _s5();
    const { products, ingredients, stocks, refreshData } = useApp();
    const getProductCost = (product)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["costCalculator"].calculateProductCost(product, ingredients);
    };
    const addProduct = async (data)=>{
        // 直接从数据库读取最新的原料数据，确保成本计算准确
        const latestIngredients = await __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ingredientStorage"].getAll();
        // 创建临时对象来计算成本
        const tempProduct = {
            ...data,
            id: 'temp',
            createdAt: 0,
            updatedAt: 0,
            cost: 0
        };
        const cost = __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["costCalculator"].calculateProductCost(tempProduct, latestIngredients);
        const newProduct = await __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["productStorage"].add({
            ...data
        });
        // 如果产品勾选了'原料产品'，自动创建对应的原料（自制原料分类）
        if (data.isIngredientProduct && newProduct) {
            const minUnitPrice = data.standardOutput > 0 ? cost / data.standardOutput : 0;
            // 检查是否已存在同名自制原料（避免重复创建）
            const existingIngredient = latestIngredients.find((i)=>i.relatedProductId === newProduct.id || i.source === 'internal' && i.name === data.name);
            if (existingIngredient) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ingredientStorage"].update(existingIngredient.id, {
                    name: data.name,
                    category: '自制原料',
                    purchaseSpec: `${data.standardOutput}ml`,
                    purchasePrice: cost,
                    minUnitPrice: minUnitPrice,
                    relatedProductId: newProduct.id
                });
            } else {
                await __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ingredientStorage"].add({
                    name: data.name,
                    category: '自制原料',
                    purchaseSpec: `${data.standardOutput}ml`,
                    purchasePrice: cost,
                    purchaseUnit: 'ml',
                    minUnitPrice: minUnitPrice,
                    minUnit: 'ml',
                    source: 'internal',
                    relatedProductId: newProduct.id
                });
            }
        }
        await refreshData();
        return newProduct;
    };
    const updateProduct = async (id, data)=>{
        // 直接从数据库读取最新的原料数据
        const latestIngredients = await __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ingredientStorage"].getAll();
        const product = await __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["productStorage"].getById(id);
        if (product && data.ingredients !== undefined) {
            const cost = __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["costCalculator"].calculateProductCost({
                ...product,
                ...data
            }, latestIngredients);
        // 注意：成本在前端实时计算，不需要存入数据库
        }
        const updated = await __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["productStorage"].update(id, data);
        // 处理产品-原料联动
        if (product) {
            const wasIngredientProduct = product.isIngredientProduct;
            const nowIngredientProduct = data.isIngredientProduct !== undefined ? data.isIngredientProduct : wasIngredientProduct;
            // 计算当前成本
            const updatedProduct = updated || product;
            const currentCost = __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["costCalculator"].calculateProductCost(updatedProduct, latestIngredients);
            if (nowIngredientProduct && !wasIngredientProduct) {
                // 产品新勾选了'原料产品'，创建对应的原料
                const standardOutput = data.standardOutput !== undefined ? data.standardOutput : product.standardOutput;
                const name = data.name !== undefined ? data.name : product.name;
                const minUnitPrice = standardOutput > 0 ? currentCost / standardOutput : 0;
                // 检查是否已存在关联的自制原料
                const existingIngredient = latestIngredients.find((i)=>i.relatedProductId === id);
                if (existingIngredient) {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ingredientStorage"].update(existingIngredient.id, {
                        name: name,
                        category: '自制原料',
                        purchaseSpec: `${standardOutput}ml`,
                        purchasePrice: currentCost,
                        minUnitPrice: minUnitPrice
                    });
                } else {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ingredientStorage"].add({
                        name: name,
                        category: '自制原料',
                        purchaseSpec: `${standardOutput}ml`,
                        purchasePrice: currentCost,
                        purchaseUnit: 'ml',
                        minUnitPrice: minUnitPrice,
                        minUnit: 'ml',
                        source: 'internal',
                        relatedProductId: id
                    });
                }
            } else if (!nowIngredientProduct && wasIngredientProduct) {
                // 产品取消了'原料产品'，删除对应的原料
                const existingIngredient = latestIngredients.find((i)=>i.relatedProductId === id);
                if (existingIngredient) {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ingredientStorage"].delete(existingIngredient.id);
                }
            } else if (nowIngredientProduct && wasIngredientProduct) {
                // 产品仍然是原料产品，更新对应的原料信息
                const existingIngredient = latestIngredients.find((i)=>i.relatedProductId === id);
                if (existingIngredient) {
                    const standardOutput = data.standardOutput !== undefined ? data.standardOutput : product.standardOutput;
                    const name = data.name !== undefined ? data.name : product.name;
                    const minUnitPrice = standardOutput > 0 ? currentCost / standardOutput : 0;
                    await __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ingredientStorage"].update(existingIngredient.id, {
                        name: name,
                        purchaseSpec: `${standardOutput}ml`,
                        purchasePrice: currentCost,
                        minUnitPrice: minUnitPrice
                    });
                } else {
                    // 如果找不到关联原料，重新创建
                    const standardOutput = data.standardOutput !== undefined ? data.standardOutput : product.standardOutput;
                    const name = data.name !== undefined ? data.name : product.name;
                    const minUnitPrice = standardOutput > 0 ? currentCost / standardOutput : 0;
                    await __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ingredientStorage"].add({
                        name: name,
                        category: '自制原料',
                        purchaseSpec: `${standardOutput}ml`,
                        purchasePrice: currentCost,
                        purchaseUnit: 'ml',
                        minUnitPrice: minUnitPrice,
                        minUnit: 'ml',
                        source: 'internal',
                        relatedProductId: id
                    });
                }
            }
        }
        await refreshData();
        return updated;
    };
    const deleteProduct = async (id)=>{
        const success = await __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["productStorage"].delete(id);
        await refreshData();
        return success;
    };
    const getProductStock = (productId)=>{
        return stocks.find((s)=>s.productId === productId);
    };
    const updateProductStock = async (productId, totalAvailable, packages)=>{
        // 更新总库存
        await __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stockStorage"].updateTotalStock(productId, totalAvailable);
        // 更新各规格库存
        for (const pkg of packages){
            await __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stockStorage"].updatePackageQuantity(productId, pkg.specMl, pkg.quantity);
        }
        await refreshData();
    };
    return {
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductCost,
        getProductStock,
        updateProductStock,
        refreshData
    };
}
_s5(useProducts, "0S5sdnSin971m+Ns2BnfhjwavGc=", false, function() {
    return [
        useApp
    ];
});
var _c;
__turbopack_context__.k.register(_c, "AppProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/workspace/projects/src/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn,
    "handleNumberInput",
    ()=>handleNumberInput
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$tailwind$2d$merge$40$2$2e$6$2e$0$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/tailwind-merge@2.6.0/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$tailwind$2d$merge$40$2$2e$6$2e$0$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
function handleNumberInput(inputValue, currentValue) {
    // 将当前值转换为字符串
    const currentStr = currentValue.toString();
    // 如果输入值为空，返回空字符串
    if (inputValue === '') return '';
    // 如果输入值只包含数字（包括小数点）
    if (/^\d*\.?\d*$/.test(inputValue)) {
        // 如果当前值是0或空，且用户输入非零数字
        if ((currentValue === '0' || currentValue === 0 || currentValue === '') && inputValue.length === 1) {
            // 如果用户输入非零数字，直接返回该数字
            if (inputValue !== '0') {
                return inputValue;
            }
        }
        return inputValue;
    }
    return String(currentValue);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/workspace/projects/src/components/bottom-nav.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BottomNav",
    ()=>BottomNav
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/next@16.1.1_@babel+core@7.28.6_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/next@16.1.1_@babel+core@7.28.6_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/next@16.1.1_@babel+core@7.28.6_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wine$3e$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/lucide-react@0.468.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/wine.js [app-client] (ecmascript) <export default as Wine>");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$beaker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Beaker$3e$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/lucide-react@0.468.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/beaker.js [app-client] (ecmascript) <export default as Beaker>");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit3$3e$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/lucide-react@0.468.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/pen-line.js [app-client] (ecmascript) <export default as Edit3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/workspace/projects/node_modules/.pnpm/lucide-react@0.468.0_react@19.2.3/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$hooks$2f$use$2d$app$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/workspace/projects/src/hooks/use-app.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function BottomNav() {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const { mode } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$hooks$2f$use$2d$app$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMode"])();
    // 只显示产品库和原料库两个tab（无首页）
    const navItems = [
        {
            path: '/products',
            label: '产品库',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wine$3e$__["Wine"]
        },
        {
            path: '/ingredients',
            label: '原料库',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$beaker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Beaker$3e$__["Beaker"]
        }
    ];
    // 判断是否显示底部导航：
    // 1. 首页不显示
    // 2. 编辑页/新建页/管理页不显示
    // 3. 只有进入模式后才显示（mode 存在）
    const isHomePage = pathname === '/';
    const isEditPage = pathname.includes('/edit') || pathname.includes('/new');
    const isAdminPage = pathname.includes('/admin');
    const shouldShowNav = !isHomePage && !isEditPage && !isAdminPage && mode;
    if (!shouldShowNav) return null;
    // 获取模式显示
    const getModeDisplay = ()=>{
        if (mode === 'edit') {
            return {
                text: '编辑模式',
                color: 'text-[var(--primary)]',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit3$3e$__["Edit3"]
            };
        }
        if (mode === 'view') {
            return {
                text: '查阅模式',
                color: 'text-[var(--info)]',
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$0$2e$468$2e$0_react$40$19$2e$2$2e$3$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"]
            };
        }
        return null;
    };
    const currentMode = getModeDisplay();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-inspector-line": "60",
        "data-inspector-column": "4",
        "data-inspector-relative-path": "src/components/bottom-nav.tsx",
        className: "mobile-nav flex items-center justify-between px-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                "data-inspector-line": "62",
                "data-inspector-column": "6",
                "data-inspector-relative-path": "src/components/bottom-nav.tsx",
                className: "flex items-center gap-8",
                children: navItems.map((item)=>{
                    const isActive = pathname.startsWith(item.path);
                    const Icon = item.icon;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        "data-inspector-line": "68",
                        "data-inspector-column": "12",
                        "data-inspector-relative-path": "src/components/bottom-nav.tsx",
                        href: item.path,
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-col items-center gap-1 py-2 transition-colors', isActive ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                "data-inspector-line": "78",
                                "data-inspector-column": "14",
                                "data-inspector-relative-path": "src/components/bottom-nav.tsx",
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('h-5 w-5', isActive && 'text-[var(--primary)]')
                            }, void 0, false, {
                                fileName: "[project]/workspace/projects/src/components/bottom-nav.tsx",
                                lineNumber: 61,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                "data-inspector-line": "82",
                                "data-inspector-column": "14",
                                "data-inspector-relative-path": "src/components/bottom-nav.tsx",
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-xs', isActive && 'font-medium text-[var(--primary)]'),
                                children: item.label
                            }, void 0, false, {
                                fileName: "[project]/workspace/projects/src/components/bottom-nav.tsx",
                                lineNumber: 62,
                                columnNumber: 15
                            }, this)
                        ]
                    }, item.path, true, {
                        fileName: "[project]/workspace/projects/src/components/bottom-nav.tsx",
                        lineNumber: 60,
                        columnNumber: 16
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/workspace/projects/src/components/bottom-nav.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this),
            currentMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                "data-inspector-line": "95",
                "data-inspector-column": "8",
                "data-inspector-relative-path": "src/components/bottom-nav.tsx",
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--muted)]', currentMode.color),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(currentMode.icon, {
                        "data-inspector-line": "96",
                        "data-inspector-column": "10",
                        "data-inspector-relative-path": "src/components/bottom-nav.tsx",
                        className: "h-3.5 w-3.5"
                    }, void 0, false, {
                        fileName: "[project]/workspace/projects/src/components/bottom-nav.tsx",
                        lineNumber: 71,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        "data-inspector-line": "97",
                        "data-inspector-column": "10",
                        "data-inspector-relative-path": "src/components/bottom-nav.tsx",
                        className: "text-xs font-medium",
                        children: currentMode.text
                    }, void 0, false, {
                        fileName: "[project]/workspace/projects/src/components/bottom-nav.tsx",
                        lineNumber: 72,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/workspace/projects/src/components/bottom-nav.tsx",
                lineNumber: 70,
                columnNumber: 23
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/workspace/projects/src/components/bottom-nav.tsx",
        lineNumber: 54,
        columnNumber: 10
    }, this);
}
_s(BottomNav, "4uvAZrnRPGtKPwnP8r/94rwi04Y=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$workspace$2f$projects$2f$src$2f$hooks$2f$use$2d$app$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMode"]
    ];
});
_c = BottomNav;
var _c;
__turbopack_context__.k.register(_c, "BottomNav");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=workspace_projects_src_d6e21950._.js.map