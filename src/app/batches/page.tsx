'use client';

import { useState, useEffect } from 'react';
import { useApp, useMode } from '@/hooks/use-app';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Batch } from '@/types';
import { batchStorage } from '@/lib/storage';

type ViewMode = 'batch' | 'bottled';

export default function BatchesPage() {
  const { products, config } = useApp();
  const { mode } = useMode();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('batch');
  const [filterProductId, setFilterProductId] = useState<string>('');

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    const data = await batchStorage.getAll();
    setBatches(data.sort((a, b) => b.productionDate - a.productionDate));
  };

  const getProduct = (productId: string) => products?.find(p => p.id === productId);

  const getDaysRemaining = (batch: Batch): number | null => {
    if (!batch.shelfLifeExpiry) return null;
    const now = Date.now();
    const diff = batch.shelfLifeExpiry - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (batch: Batch) => {
    const daysRemaining = getDaysRemaining(batch);
    switch (batch.status) {
      case 'pending':
        return <Badge variant="outline" className="text-xs">待灌装</Badge>;
      case 'partial':
        return <Badge className="text-xs bg-blue-600 text-white">部分灌装</Badge>;
      case 'completed':
        return <Badge className="text-xs bg-green-600 text-white">已灌完</Badge>;
      case 'cleared':
        return <Badge variant="secondary" className="text-xs">已清</Badge>;
    }
  };

  const getExpiryDisplay = (batch: Batch) => {
    if (!batch.shelfLifeExpiry) return '无期限';
    const daysRemaining = getDaysRemaining(batch);
    const expiryDate = new Date(batch.shelfLifeExpiry).toLocaleDateString('zh-CN');
    if (daysRemaining !== null) {
      if (daysRemaining <= 0) return { text: `已过期 (${expiryDate})`, warn: true };
      if (daysRemaining <= 7) return { text: `剩余${daysRemaining}天 (${expiryDate})`, warn: true };
      if (daysRemaining <= 30) return { text: `剩余${daysRemaining}天 (${expiryDate})`, warn: false };
      return { text: `剩余${daysRemaining}天 (${expiryDate})`, warn: false };
    }
    return expiryDate;
  };

  const filteredBatches = filterProductId
    ? batches.filter(b => b.productId === filterProductId)
    : batches;

  // 已灌装视角：按产品汇总
  const bottledByProduct = new Map<string, {
    productName: string;
    totalBottled: number;
    batches: Array<{ batch: Batch; bottles: number }>;
  }>();

  batches.forEach(batch => {
    if (batch.bottledAmount <= 0) return;
    const product = getProduct(batch.productId);
    if (!product) return;
    const existing = bottledByProduct.get(batch.productId) || {
      productName: product.name,
      totalBottled: 0,
      batches: [],
    };
    existing.totalBottled += batch.bottledAmount;
    // 统计已灌装瓶数（按规格）
    batch.bottlingRecords.forEach(br => {
      existing.batches.push({ batch, bottles: br.count });
    });
    bottledByProduct.set(batch.productId, existing);
  });

  return (
    <div className="min-h-screen pb-20">
      {/* 顶部 */}
      <div className="sticky top-0 z-10 bg-[var(--background)]/95 backdrop-blur border-b border-[var(--border)] px-4 py-3">
        <h1 className="text-lg font-bold mb-2">批次追踪</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'batch' ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setViewMode('batch')}
          >
            批次视角
          </Button>
          <Button
            variant={viewMode === 'bottled' ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setViewMode('bottled')}
          >
            已灌装视角
          </Button>
          <select
            value={filterProductId}
            onChange={(e) => setFilterProductId(e.target.value)}
            className="ml-auto text-xs bg-[var(--input)] border border-[var(--border)] rounded px-2 py-1 h-7"
          >
            <option value="">全部产品</option>
            {products?.filter(p => !p.isIngredientProduct).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {filteredBatches.length === 0 && viewMode === 'batch' && (
          <div className="text-center py-12 text-[var(--muted-foreground)]">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">暂无批次记录</p>
            <p className="text-xs mt-1">完成制作并灌装后，批次会自动创建</p>
          </div>
        )}

        {/* 批次视角 */}
        {viewMode === 'batch' && filteredBatches.map(batch => {
          const product = getProduct(batch.productId);
          const expiryInfo = getExpiryDisplay(batch);
          const isWarning = typeof expiryInfo === 'object' && expiryInfo.warn;

          return (
            <Card key={batch.id} className={`glass-card ${isWarning ? 'border-yellow-500/50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{product?.name || '未知产品'}</span>
                      {getStatusBadge(batch)}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      生产日期：{new Date(batch.productionDate).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  {isWarning && (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="text-center p-2 rounded bg-[var(--muted)]">
                    <p className="text-xs text-[var(--muted-foreground)]">总产量</p>
                    <p className="number-font text-sm font-medium">{batch.totalProduced}ml</p>
                  </div>
                  <div className="text-center p-2 rounded bg-[var(--muted)]">
                    <p className="text-xs text-[var(--muted-foreground)]">已灌装</p>
                    <p className="number-font text-sm font-medium">{batch.bottledAmount}ml</p>
                  </div>
                  <div className="text-center p-2 rounded bg-[var(--muted)]">
                    <p className="text-xs text-[var(--muted-foreground)]">剩余</p>
                    <p className="number-font text-sm font-medium">{batch.remainingAmount}ml</p>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-[var(--muted-foreground)]">
                    保质期：{typeof expiryInfo === 'object' ? expiryInfo.text : expiryInfo}
                  </span>
                  {batch.bottlingRecords.length > 0 && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      灌装{batch.bottlingRecords.length}次
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* 已灌装视角 */}
        {viewMode === 'bottled' && (
          <>
            {bottledByProduct.size === 0 && (
              <div className="text-center py-12 text-[var(--muted-foreground)]">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">暂无已灌装库存</p>
              </div>
            )}
            {Array.from(bottledByProduct.entries()).map(([productId, data]) => (
              <Card key={productId} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{data.productName}</span>
                    <span className="number-font text-sm text-[var(--primary)]">{data.totalBottled}ml</span>
                  </div>
                  <div className="space-y-1">
                    {data.batches.map(({ batch, bottles }, idx) => {
                      const expiryInfo = getExpiryDisplay(batch);
                      const isWarning = typeof expiryInfo === 'object' && expiryInfo.warn;
                      return (
                        <div key={idx} className={`flex items-center justify-between text-xs p-2 rounded ${isWarning ? 'bg-yellow-500/10' : 'bg-[var(--muted)]'}`}>
                          <span className="text-[var(--muted-foreground)]">
                            {new Date(batch.productionDate).toLocaleDateString('zh-CN')} 产
                          </span>
                          <span>{bottles}瓶</span>
                          <span className={isWarning ? 'text-yellow-600' : ''}>
                            {typeof expiryInfo === 'object' ? expiryInfo.text : expiryInfo}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
