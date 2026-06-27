'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, useMode } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, ChevronRight, Package, AlertCircle, Check, Clock, XCircle, Trash2 } from 'lucide-react';
import { ProductionTask, ProductionTaskItem, TaskStatus, ProductTaskStatus, PlannedSpec } from '@/types';
import { taskStorage, batchStorage, generateId } from '@/lib/storage';

export default function TasksPage() {
  const router = useRouter();
  const { products, config } = useApp();
  const { mode } = useMode();
  const [tasks, setTasks] = useState<ProductionTask[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const data = await taskStorage.getAll();
    setTasks(data.sort((a, b) => b.createdAt - a.createdAt));
  };

  // 创建任务对话框状态
  const [newTaskRemark, setNewTaskRemark] = useState('');
  const [taskItems, setTaskItems] = useState<Array<{
    productId: string;
    specs: Array<{ specId: string; count: number }>;
  }>>([{ productId: '', specs: [{ specId: '', count: 1 }] }]);

  const addTaskItem = () => {
    setTaskItems([...taskItems, { productId: '', specs: [{ specId: '', count: 1 }] }]);
  };

  const removeTaskItem = (index: number) => {
    setTaskItems(taskItems.filter((_, i) => i !== index));
  };

  const updateTaskItemProduct = (index: number, productId: string) => {
    const updated = [...taskItems];
    updated[index].productId = productId;
    setTaskItems(updated);
  };

  const addSpecToItem = (index: number) => {
    const updated = [...taskItems];
    updated[index].specs.push({ specId: '', count: 1 });
    setTaskItems(updated);
  };

  const removeSpecFromItem = (itemIndex: number, specIndex: number) => {
    const updated = [...taskItems];
    updated[itemIndex].specs = updated[itemIndex].specs.filter((_, i) => i !== specIndex);
    setTaskItems(updated);
  };

  const updateSpec = (itemIndex: number, specIndex: number, field: 'specId' | 'count', value: string | number) => {
    const updated = [...taskItems];
    (updated[itemIndex].specs[specIndex] as any)[field] = value;
    setTaskItems(updated);
  };

  const handleCreateTask = async () => {
    const validItems = taskItems.filter(item => item.productId && item.specs.some(s => s.specId && s.count > 0));
    if (validItems.length === 0) {
      alert('请至少添加一个产品和规格');
      return;
    }

    const enabledSpecs = config.packageSpecs.filter(s => s.enabled);
    const taskItemsData: ProductionTaskItem[] = validItems.map(item => {
      const product = products?.find(p => p.id === item.productId);
      const plannedSpecs: PlannedSpec[] = item.specs
        .filter(s => s.specId && s.count > 0)
        .map(s => {
          const spec = enabledSpecs.find(es => es.id === s.specId);
          return {
            specId: s.specId,
            specName: spec?.name || s.specId,
            specVolume: spec?.volume || 0,
            count: s.count,
          };
        });
      const plannedAmount = plannedSpecs.reduce((sum, s) => sum + s.specVolume * s.count, 0);

      return {
        id: generateId(),
        productId: item.productId,
        productName: product?.name || '',
        plannedAmount,
        plannedSpecs,
        productStatus: 'prep' as ProductTaskStatus,
        ingredientChecklist: [],
        prepCompleted: false,
        sourceBatchIds: [],
        failureRecords: [],
        bottlingRecordIds: [],
      };
    });

    const task: ProductionTask = {
      id: generateId(),
      createdAt: Date.now(),
      remark: newTaskRemark,
      status: 'not_started',
      items: taskItemsData,
    };

    await taskStorage.create(task);
    await loadTasks();
    setShowCreateDialog(false);
    setNewTaskRemark('');
    setTaskItems([{ productId: '', specs: [{ specId: '', count: 1 }] }]);
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'not_started':
        return <Badge variant="secondary" className="text-xs">未开始</Badge>;
      case 'in_progress':
        return <Badge className="text-xs bg-[var(--info)] text-white">进行中</Badge>;
      case 'completed':
        return <Badge className="text-xs bg-green-600 text-white">已完结</Badge>;
    }
  };

  const getProductStatusBadge = (status: ProductTaskStatus) => {
    switch (status) {
      case 'prep':
        return <Badge variant="outline" className="text-xs">原料筹备</Badge>;
      case 'producing':
        return <Badge className="text-xs bg-yellow-600 text-white">制作中</Badge>;
      case 'bottling':
        return <Badge className="text-xs bg-blue-600 text-white">灌装入库</Badge>;
      case 'done':
        return <Badge className="text-xs bg-green-600 text-white">已完成</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="text-xs">已取消</Badge>;
    }
  };

  const forceCompleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const unfinished = task.items.filter(i => i.productStatus !== 'done' && i.productStatus !== 'cancelled');
    if (unfinished.length > 0) {
      const confirm = window.confirm(`尚有 ${unfinished.length} 个产品未完成，是否强制完结？未完成产品将不会入库。`);
      if (!confirm) return;
    }
    await taskStorage.update(taskId, { status: 'completed' });
    await loadTasks();
  };

  const deleteTask = async (taskId: string) => {
    if (!window.confirm('确定删除此任务？')) return;
    await taskStorage.delete(taskId);
    await loadTasks();
  };

  const enabledSpecs = config.packageSpecs.filter(s => s.enabled);

  return (
    <div className="min-h-screen pb-20">
      {/* 顶部 */}
      <div className="sticky top-0 z-10 bg-[var(--background)]/95 backdrop-blur border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">制作任务</h1>
          {mode === 'edit' && (
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              新建任务
            </Button>
          )}
        </div>
      </div>

      {/* 任务列表 */}
      <div className="px-4 py-4 space-y-3">
        {tasks.length === 0 && (
          <div className="text-center py-12 text-[var(--muted-foreground)]">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">暂无制作任务</p>
            <p className="text-xs mt-1">点击「新建任务」开始创建</p>
          </div>
        )}

        {tasks.map(task => (
          <Card key={task.id} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(task.status)}
                    {task.remark && (
                      <span className="text-sm font-medium">{task.remark}</span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    {new Date(task.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                {mode === 'edit' && task.status !== 'completed' && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-green-600"
                      onClick={() => forceCompleteTask(task.id)}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      完结
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-red-500"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <Separator className="my-2" />

              {/* 产品列表 */}
              <div className="space-y-2">
                {task.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{item.productName}</span>
                        {getProductStatusBadge(item.productStatus)}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        {item.plannedSpecs.map(s => `${s.specName}×${s.count}`).join('、') || `${item.plannedAmount}ml`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 创建任务对话框 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[420px] max-h-[80vh] overflow-y-auto bg-[var(--popover)] border-[var(--border)]">
          <DialogHeader>
            <DialogTitle>新建制作任务</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm">备注</Label>
              <Input
                value={newTaskRemark}
                onChange={(e) => setNewTaskRemark(e.target.value)}
                placeholder="如：张三要货单"
                className="bg-[var(--input)] mt-1"
              />
            </div>

            <Separator />

            {taskItems.map((item, itemIdx) => (
              <div key={itemIdx} className="space-y-2 p-3 rounded-lg bg-[var(--muted)]">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">产品 {itemIdx + 1}</Label>
                  {taskItems.length > 1 && (
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-red-500" onClick={() => removeTaskItem(itemIdx)}>
                      移除
                    </Button>
                  )}
                </div>
                <Select value={item.productId} onValueChange={(v) => updateTaskItemProduct(itemIdx, v)}>
                  <SelectTrigger className="bg-[var(--input)]">
                    <SelectValue placeholder="选择产品" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.filter(p => !p.isIngredientProduct).map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {item.specs.map((spec, specIdx) => (
                  <div key={specIdx} className="flex items-center gap-2">
                    <Select value={spec.specId} onValueChange={(v) => updateSpec(itemIdx, specIdx, 'specId', v)}>
                      <SelectTrigger className="bg-[var(--input)] flex-1">
                        <SelectValue placeholder="规格" />
                      </SelectTrigger>
                      <SelectContent>
                        {enabledSpecs.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={spec.count}
                      onChange={(e) => updateSpec(itemIdx, specIdx, 'count', parseInt(e.target.value) || 0)}
                      className="bg-[var(--input)] w-[70px] number-font"
                      placeholder="数量"
                      min="1"
                    />
                    {item.specs.length > 1 && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => removeSpecFromItem(itemIdx, specIdx)}>
                        ×
                      </Button>
                    )}
                  </div>
                ))}

                <Button variant="ghost" size="sm" className="text-xs" onClick={() => addSpecToItem(itemIdx)}>
                  <Plus className="h-3 w-3 mr-1" />
                  添加规格
                </Button>
              </div>
            ))}

            <Button variant="outline" size="sm" className="w-full" onClick={addTaskItem}>
              <Plus className="h-4 w-4 mr-1" />
              添加产品
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>取消</Button>
            <Button onClick={handleCreateTask}>创建任务</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
