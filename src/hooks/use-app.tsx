'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { GlobalConfig, DEFAULT_CONFIG, Ingredient, Product, ProductStock } from '@/types';
import { configStorage, ingredientStorage, productStorage, stockStorage, costCalculator } from '@/lib/storage';

// 应用模式：编辑模式或查阅模式
export type AppMode = 'edit' | 'view' | null;

interface AppContextType {
  config: GlobalConfig;
  ingredients: Ingredient[];
  products: Product[];
  stocks: ProductStock[];
  loading: boolean;
  refreshData: () => Promise<void>;
  isAuthenticated: boolean;
  authenticate: (password: string) => Promise<boolean>;
  clearAuth: () => void;
  updateConfig: (config: GlobalConfig) => Promise<void>;
  // 新增：模式管理
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  enterEditMode: (password: string) => Promise<boolean>;
  enterViewMode: () => void;
  exitMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<GlobalConfig>(DEFAULT_CONFIG);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mode, setMode] = useState<AppMode>(null);

  // 初始化数据（客户端）
  useEffect(() => {
    refreshData().finally(() => setLoading(false));
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [configData, ingredientsData, productsData, stocksData] = await Promise.all([
        configStorage.get(),
        ingredientStorage.getAll(),
        productStorage.getAll(),
        stockStorage.getAll(),
      ]);
      
      // 计算产品成本
      const productsWithCost = productsData.map(product => ({
        ...product,
        cost: costCalculator.calculateProductCost(product, ingredientsData),
      }));
      
      setConfig(configData);
      setIngredients(ingredientsData);
      setProducts(productsWithCost);
      setStocks(stocksData);
    } catch (error) {
      console.error('刷新数据失败:', error);
    }
  }, []);

  const authenticate = async (password: string): Promise<boolean> => {
    try {
      const valid = await configStorage.verifyPassword(password);
      if (valid) {
        setIsAuthenticated(true);
      }
      return valid;
    } catch (error) {
      console.error('密码验证失败:', error);
      // 如果数据库连接失败，使用默认密码
      const defaultPassword = DEFAULT_CONFIG.password;
      if (password === defaultPassword) {
        setIsAuthenticated(true);
        return true;
      }
      return false;
    }
  };

  const clearAuth = () => {
    setIsAuthenticated(false);
  };

  const updateConfig = async (newConfig: GlobalConfig) => {
    await configStorage.set(newConfig);
    setConfig(newConfig);
  };

  // 进入编辑模式（需密码验证）
  const enterEditMode = async (password: string): Promise<boolean> => {
    const valid = await authenticate(password);
    if (valid) {
      setMode('edit');
    }
    return valid;
  };

  // 进入查阅模式（无需密码）
  const enterViewMode = () => {
    setMode('view');
    clearAuth();
  };

  // 退出当前模式
  const exitMode = () => {
    setMode(null);
    clearAuth();
  };

  return (
    <AppContext.Provider
      value={{
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
        exitMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// 模式管理 Hook
export function useMode() {
  const { mode, setMode, enterEditMode, enterViewMode, exitMode } = useApp();
  return { mode, setMode, enterEditMode, enterViewMode, exitMode };
}

// 密码验证 Hook
export function usePasswordAuth() {
  const { isAuthenticated, authenticate, clearAuth } = useApp();
  return { isAuthenticated, authenticate, clearAuth };
}

// 原料数据 Hook
export function useIngredients() {
  const { ingredients, refreshData } = useApp();
  
  const addIngredient = async (data: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt' | 'minUnitPrice'>) => {
    const minUnitPrice = costCalculator.calculateMinUnitPrice(data.purchasePrice, data.purchaseSpec, data.minUnit);
    const newIngredient = await ingredientStorage.create({ ...data, minUnitPrice });
    await refreshData();
    return newIngredient;
  };

  const updateIngredient = async (id: string, data: Partial<Omit<Ingredient, 'id' | 'createdAt'>>) => {
    const ingredient = await ingredientStorage.getById(id);
    if (ingredient) {
      const updateData: any = { ...data };
      if (data.purchasePrice !== undefined || data.purchaseSpec !== undefined || data.minUnit !== undefined) {
        const newPrice = data.purchasePrice ?? ingredient.purchasePrice;
        const newSpec = data.purchaseSpec ?? ingredient.purchaseSpec;
        const newMinUnit = data.minUnit ?? ingredient.minUnit;
        updateData.minUnitPrice = costCalculator.calculateMinUnitPrice(newPrice, newSpec, newMinUnit);
      }
      const updated = await ingredientStorage.update(id, updateData);
      await refreshData();
      return updated;
    }
    return null;
  };

  const deleteIngredient = async (id: string) => {
    const success = await ingredientStorage.delete(id);
    await refreshData();
    return success;
  };

  return {
    ingredients,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    refreshData,
  };
}

// 产品数据 Hook
export function useProducts() {
  const { products, ingredients, stocks, refreshData } = useApp();

  const getProductCost = (product: Product) => {
    return costCalculator.calculateProductCost(product, ingredients);
  };

  const addProduct = async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'cost'>) => {
    // 直接从数据库读取最新的原料数据，确保成本计算准确
    const latestIngredients = await ingredientStorage.getAll();
    
    // 创建临时对象来计算成本
    const tempProduct: Product = {
      ...data,
      id: 'temp',
      createdAt: 0,
      updatedAt: 0,
      cost: 0,
    };
    const cost = costCalculator.calculateProductCost(tempProduct, latestIngredients);
    const newProduct = await productStorage.create({ ...data });
    
    // 如果产品勾选了'原料产品'，自动创建对应的原料（自制原料分类）
    if (data.isIngredientProduct && newProduct) {
      const minUnitPrice = data.standardOutput > 0 ? cost / data.standardOutput : 0;
      
      // 检查是否已存在同名自制原料（避免重复创建）
      const existingIngredient = latestIngredients.find(
        (i) => i.relatedProductId === newProduct.id || (i.source === 'internal' && i.name === data.name)
      );
      
      if (existingIngredient) {
        await ingredientStorage.update(existingIngredient.id, {
          name: data.name,
          category: '自制原料',
          purchaseSpec: `${data.standardOutput}ml`,
          purchasePrice: cost,
          minUnitPrice: minUnitPrice,
          relatedProductId: newProduct.id,
        });
      } else {
        await ingredientStorage.create({
          name: data.name,
          category: '自制原料',
          purchaseSpec: `${data.standardOutput}ml`,
          purchasePrice: cost,
          purchaseUnit: 'ml',
          minUnitPrice: minUnitPrice,
          minUnit: 'ml',
          source: 'internal',
          relatedProductId: newProduct.id,
          abv: 0,
        });
      }
    }
    
    await refreshData();
    return newProduct;
  };

  const updateProduct = async (id: string, data: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
    // 直接从数据库读取最新的原料数据
    const latestIngredients = await ingredientStorage.getAll();
    
    const product = await productStorage.getById(id);
    if (product && data.ingredients !== undefined) {
      const cost = costCalculator.calculateProductCost({ ...product, ...data }, latestIngredients);
      // 注意：成本在前端实时计算，不需要存入数据库
    }
    const updated = await productStorage.update(id, data);
    
    // 处理产品-原料联动
    if (product) {
      const wasIngredientProduct = product.isIngredientProduct;
      const nowIngredientProduct = data.isIngredientProduct !== undefined ? data.isIngredientProduct : wasIngredientProduct;
      
      // 计算当前成本
      const updatedProduct = updated || product;
      const currentCost = costCalculator.calculateProductCost(updatedProduct, latestIngredients);
      
      if (nowIngredientProduct && !wasIngredientProduct) {
        // 产品新勾选了'原料产品'，创建对应的原料
        const standardOutput = data.standardOutput !== undefined ? data.standardOutput : product.standardOutput;
        const name = data.name !== undefined ? data.name : product.name;
        const minUnitPrice = standardOutput > 0 ? currentCost / standardOutput : 0;
        
        // 检查是否已存在关联的自制原料
        const existingIngredient = latestIngredients.find((i) => i.relatedProductId === id);
        if (existingIngredient) {
          await ingredientStorage.update(existingIngredient.id, {
            name: name,
            category: '自制原料',
            purchaseSpec: `${standardOutput}ml`,
            purchasePrice: currentCost,
            minUnitPrice: minUnitPrice,
          });
        } else {
          await ingredientStorage.create({
            name: name,
            category: '自制原料',
            purchaseSpec: `${standardOutput}ml`,
            purchasePrice: currentCost,
            purchaseUnit: 'ml',
            minUnitPrice: minUnitPrice,
            minUnit: 'ml',
            source: 'internal',
            relatedProductId: id,
            abv: 0,
          });
        }
      } else if (!nowIngredientProduct && wasIngredientProduct) {
        // 产品取消了'原料产品'，删除对应的原料
        const existingIngredient = latestIngredients.find((i) => i.relatedProductId === id);
        if (existingIngredient) {
          await ingredientStorage.delete(existingIngredient.id);
        }
      } else if (nowIngredientProduct && wasIngredientProduct) {
        // 产品仍然是原料产品，更新对应的原料信息
        const existingIngredient = latestIngredients.find((i) => i.relatedProductId === id);
        if (existingIngredient) {
          const standardOutput = data.standardOutput !== undefined ? data.standardOutput : product.standardOutput;
          const name = data.name !== undefined ? data.name : product.name;
          const minUnitPrice = standardOutput > 0 ? currentCost / standardOutput : 0;
          await ingredientStorage.update(existingIngredient.id, {
            name: name,
            purchaseSpec: `${standardOutput}ml`,
            purchasePrice: currentCost,
            minUnitPrice: minUnitPrice,
          });
        } else {
          // 如果找不到关联原料，重新创建
          const standardOutput = data.standardOutput !== undefined ? data.standardOutput : product.standardOutput;
          const name = data.name !== undefined ? data.name : product.name;
          const minUnitPrice = standardOutput > 0 ? currentCost / standardOutput : 0;
          await ingredientStorage.create({
            name: name,
            category: '自制原料',
            purchaseSpec: `${standardOutput}ml`,
            purchasePrice: currentCost,
            purchaseUnit: 'ml',
            minUnitPrice: minUnitPrice,
            minUnit: 'ml',
            source: 'internal',
            relatedProductId: id,
            abv: 0,
          });
        }
      }
    }
    
    await refreshData();
    return updated;
  };

  const deleteProduct = async (id: string) => {
    const success = await productStorage.delete(id);
    await refreshData();
    return success;
  };

  const getProductStock = (productId: string) => {
    return stocks.find((s) => s.productId === productId);
  };

  const updateProductStock = async (productId: string, totalAvailable: number, packages: Array<{ specMl: number; quantity: number }>) => {
    // 更新总库存
    await stockStorage.updateTotalStock(productId, totalAvailable);
    
    // 更新各规格库存
    for (const pkg of packages) {
      await stockStorage.updatePackageQuantity(productId, pkg.specMl, pkg.quantity);
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
    refreshData,
  };
}