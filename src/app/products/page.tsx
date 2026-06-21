'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts, useApp, useMode } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Plus, Search, Settings, ChevronRight, Edit2, Lock, Home, Trash2 } from 'lucide-react';

export default function ProductsPage() {
  const router = useRouter();
  const { products, deleteProduct, refreshData } = useProducts();
  const { config, stocks } = useApp();
  const { mode, exitMode } = useMode();

  const [search, setSearch] = useState('');
  const [showIngredientProducts, setShowIngredientProducts] = useState(false);

  // 每次页面挂载或获得焦点时刷新数据，确保编辑后列表同步
  useEffect(() => {
    refreshData();
    const handleFocus = () => refreshData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshData]);

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');

  // 是否处于编辑模式
  const isEditMode = mode === 'edit';

  // 返回首页并退出当前模式
  const handleGoHome = () => {
    exitMode();
    router.push('/');
  };

  // 过滤产品
  const filteredProducts = useMemo(() => {
    return (products || []).filter((product) => {
      const matchSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchBrand =
        brandFilter === 'all' || product.brands.includes(brandFilter);
      const matchIngredient = showIngredientProducts || !product.isIngredientProduct;
      return matchSearch && matchCategory && matchBrand && matchIngredient;
    });
  }, [products, search, categoryFilter, brandFilter, showIngredientProducts]);

  // 获取分类名称
  const getCategoryName = (categoryId: string) => {
    const cat = config.categories.find((c) => c.id === categoryId);
    return cat?.name || '未分类';
  };

  // 获取品牌名称
  const getBrandNames = (brandIds: string[]) => {
    return brandIds
      .map((id) => config.brands.find((b) => b.id === id)?.name)
      .filter(Boolean)
      .join(' / ');
  };

  // 获取库存信息
  const getProductStock = (productId: string) => {
    return stocks.find((s) => s.productId === productId);
  };

  // 处理新建产品 - 编辑模式跳转新建页，查阅模式显示提示
  const handleAdd = () => {
    if (isEditMode) {
      router.push('/products/new/edit');
    }
  };

  // 处理查看产品详情
  const handleView = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  // 处理编辑产品 - 只有编辑模式可用
  const handleEdit = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditMode) {
      router.push(`/products/${productId}/edit`);
    }
  };

  // 处理删除产品 - 只有编辑模式可用
  const handleDelete = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditMode) {
      if (confirm('确定要删除该产品吗？')) {
        await deleteProduct(productId);
      }
    }
  };

  // 处理管理配置 - 编辑模式跳转管理页，查阅模式显示提示
  const handleAdmin = () => {
    if (isEditMode) {
      router.push('/admin');
    }
  };

  // 启用的分类
  const enabledCategories = config.categories.filter((c) => c.enabled);
  // 启用的品牌
  const enabledBrands = config.brands.filter((b) => b.enabled);

  return (
    <TooltipProvider>
      <div className="content-area">
        {/* 顶部导航 */}
        <div className="mobile-header flex items-center justify-between px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoHome}
            className="h-10 px-2 gap-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <Home className="h-4 w-4" />
            <span className="text-sm">首页</span>
          </Button>

          <h1 className="text-lg font-semibold absolute left-1/2 -translate-x-1/2">产品库</h1>

          <div className="flex items-center gap-2">
            {isEditMode ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAdmin}
                className="h-10 w-10"
              >
                <Settings className="h-5 w-5" />
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleAdmin}
                    className="h-10 w-10 opacity-50"
                  >
                    <Lock className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>需要进入编辑模式才能操作</p>
                </TooltipContent>
              </Tooltip>
            )}
            {isEditMode ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAdd}
                className="h-10 w-10"
              >
                <Plus className="h-5 w-5" />
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleAdd}
                    className="h-10 w-10 opacity-50"
                  >
                    <Lock className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>需要进入编辑模式才能操作</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="px-4 pt-4 pb-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              placeholder="搜索产品..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[var(--input)]"
            />
          </div>
          <div className="flex gap-2 items-center">
            <Combobox
              options={[
                { value: 'all', label: '全部分类' },
                ...enabledCategories.filter((cat) => cat.id).map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                })),
              ]}
              value={categoryFilter}
              onChange={setCategoryFilter}
              placeholder="分类"
              searchPlaceholder="搜索分类..."
              className="w-[140px] bg-[var(--input)]"
            />
            <Combobox
              options={[
                { value: 'all', label: '全部品牌' },
                ...enabledBrands.filter((brand) => brand.id).map((brand) => ({
                  value: brand.id,
                  label: brand.name,
                })),
              ]}
              value={brandFilter}
              onChange={setBrandFilter}
              placeholder="品牌"
              searchPlaceholder="搜索品牌..."
              className="w-[140px] bg-[var(--input)]"
            />
            {/* 显示原料产品勾选 */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap text-xs text-[var(--muted-foreground)] ml-auto">
              <input
                type="checkbox"
                checked={showIngredientProducts}
                onChange={(e) => setShowIngredientProducts(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
              />
              显示原料产品
            </label>
          </div>
        </div>

        {/* 产品列表 */}
        <div className="px-4 space-y-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-[var(--muted-foreground)]">
              {search || categoryFilter !== 'all' || brandFilter !== 'all' || !showIngredientProducts
                ? '未找到匹配的产品'
                : '暂无产品，点击右上角 + 添加'}
            </div>
          ) : (
            filteredProducts.map((product) => {
              const stock = getProductStock(product.id);
              return (
                <Card
                  key={product.id}
                  className="glass-card group"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => handleView(product.id)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{product.name}</h3>
                          {product.isIngredientProduct && (
                            <Badge variant="outline" className="text-xs border-[var(--primary)] text-[var(--primary)]">
                              原料产品
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                          <Badge variant="outline" className="text-xs">{getCategoryName(product.category)}</Badge>
                          {product.brands.length > 0 && (
                            <span className="truncate">{getBrandNames(product.brands)}</span>
                          )}
                        </div>
                        {product.standardOutput && (
                          <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                            出品量：{product.standardOutput}ml
                          </div>
                        )}
                        {stock && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-[var(--muted-foreground)]">可用：</span>
                            <span className="text-xs font-medium text-[var(--primary)] number-font">
                              {stock.totalAvailable}ml
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {isEditMode && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                            onClick={(e) => handleDelete(product.id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {isEditMode ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[var(--muted-foreground)] hover:text-[var(--primary)]"
                            onClick={(e) => handleEdit(product.id, e)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-50"
                                onClick={(e) => handleEdit(product.id, e)}
                              >
                                <Lock className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>需要进入编辑模式才能操作</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        <ChevronRight className="h-5 w-5 text-[var(--muted-foreground)]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
