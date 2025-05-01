import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Plus, Check, X, AlertCircle, AlertTriangle, Shield } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SubscriptionPeriod, SubscriptionPlan } from '@/lib/types/course-new';
import { forceDeleteSubscriptionPlan } from '@/lib/services/subscriptionService';

export function SubscriptionPlanManagement() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteErrorDialogOpen, setDeleteErrorDialogOpen] = useState(false);
  const [forceDeleteDialogOpen, setForceDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [isForceDeleting, setIsForceDeleting] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: 'interval' | 'price' | 'discount_percentage' | 'display_order' | 'is_active' | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string;
    interval: SubscriptionPeriod;
    discount_percentage: string;
    currency: string;
    is_active: boolean;
    display_order: string;
  }>({
    name: '',
    description: '',
    price: '',
    interval: 'monthly',
    discount_percentage: '',
    currency: 'usd',
    is_active: true,
    display_order: ''
  });

  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin-subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (error) {
        console.error('Error fetching subscription plans:', error);
        toast({
          title: '获取订阅计划失败',
          description: error.message,
          variant: 'destructive'
        });
        return [];
      }
      
      return data as SubscriptionPlan[];
    }
  });

  const addMutation = useMutation({
    mutationFn: async (planData: {
      name: string;
      description: string | null;
      price: number;
      interval: string;
      discount_percentage: number;
      currency: string;
      is_active: boolean;
      display_order: number;
      features?: string[];
    }) => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert(planData)
        .select()
        .single();
        
      if (error) throw error;
      return data as SubscriptionPlan;
    },
    onSuccess: () => {
      toast({
        title: '添加成功',
        description: '订阅计划已添加',
        variant: 'default'
      });
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Error adding plan:', error);
      toast({
        title: '添加失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...planData }: SubscriptionPlan) => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .update(planData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data as SubscriptionPlan;
    },
    onSuccess: () => {
      toast({
        title: '更新成功',
        description: '订阅计划已更新',
        variant: 'default'
      });
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Error updating plan:', error);
      toast({
        title: '更新失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Starting normal delete for plan ID:", id);
      
      const { data: subscriptions, error: checkError } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('plan_id', id)
        .limit(1);
        
      if (checkError) {
        console.error('检查订阅关联时出错:', checkError);
        throw new Error('检查订阅关联时出错: ' + checkError.message);
      }
      
      const { data: history, error: historyError } = await supabase
        .from('subscription_history')
        .select('id')
        .or(`previous_plan_id.eq.${id},new_plan_id.eq.${id}`)
        .limit(1);
        
      if (historyError) {
        console.error('检查订阅历史时出错:', historyError);
        throw new Error('检查订阅历史时出错: ' + historyError.message);
      }
      
      console.log("Check results - Subscriptions:", subscriptions, "History:", history);
      
      if (subscriptions && subscriptions.length > 0) {
        throw new Error('无法删除：此计划有用户正在使用。请先取消相关用户的订阅，或将用户迁移到其他计划。如果您确定要删除此计划及其所有关联数据，请使用强制删除功能。');
      }
      
      if (history && history.length > 0) {
        throw new Error('无法删除：此计划在订阅历史记录中被引用。请考虑禁用而不是删除此计划。如果您确定要删除此计划及其所有关联数据，请使用强制删除功能。');
      }

      console.log("Proceeding with deletion for plan ID:", id);
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('删除计划时出错:', error);
        throw error;
      }
      
      console.log("Plan deleted successfully");
      return id;
    },
    onSuccess: () => {
      toast({
        title: '删除成功',
        description: '订阅计划已删除',
        variant: 'default'
      });
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      setDeleteDialogOpen(false);
      setCurrentPlan(null);
    },
    onError: (error) => {
      console.error('Error deleting plan:', error);
      setDeleteDialogOpen(false);
      setDeleteErrorMessage(error instanceof Error ? error.message : '删除失败：未知错误');
      setDeleteErrorDialogOpen(true);
    }
  });

  const forceDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Starting force delete for plan ID:", id);
      const result = await forceDeleteSubscriptionPlan(id);
      if (!result.success) {
        console.error("Force delete failed:", result.error);
        throw new Error(result.error || '强制删除失败');
      }
      return id;
    },
    onSuccess: () => {
      toast({
        title: '强制删除成功',
        description: '订阅计划及其所有关联数据已被完全删除',
        variant: 'default'
      });
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      setForceDeleteDialogOpen(false);
      setCurrentPlan(null);
      setIsForceDeleting(false);
    },
    onError: (error) => {
      console.error('Error force deleting plan:', error);
      toast({
        title: '强制删除失败',
        description: error instanceof Error ? error.message : '发生未知错误',
        variant: 'destructive'
      });
      setForceDeleteDialogOpen(false);
      setIsForceDeleting(false);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      interval: 'monthly',
      discount_percentage: '',
      currency: 'usd',
      is_active: true,
      display_order: ''
    });
    setIsEditing(false);
    setCurrentPlan(null);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setIsEditing(true);
    setCurrentPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price.toString(),
      interval: plan.interval as SubscriptionPeriod,
      discount_percentage: plan.discount_percentage.toString(),
      currency: plan.currency,
      is_active: plan.is_active,
      display_order: plan.display_order.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDeletePlan = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan);
    setDeleteDialogOpen(true);
  };

  const handleForceDelete = () => {
    if (currentPlan) {
      console.log("Executing force delete for plan:", currentPlan.id, currentPlan.name);
      setIsForceDeleting(true);
      forceDeleteMutation.mutate(currentPlan.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast({
        title: '表单不完整',
        description: '请填写所有必填字段',
        variant: 'destructive'
      });
      return;
    }
    
    const planData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      interval: formData.interval,
      discount_percentage: parseInt(formData.discount_percentage || '0'),
      currency: formData.currency,
      is_active: formData.is_active,
      display_order: parseInt(formData.display_order || '0')
    };
    
    if (isEditing && currentPlan) {
      updateMutation.mutate({ id: currentPlan.id, ...planData } as SubscriptionPlan);
    } else {
      addMutation.mutate(planData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name: string, value: SubscriptionPeriod | string) => {
    if (name === 'interval') {
      setFormData(prev => ({
        ...prev,
        [name]: value as SubscriptionPeriod
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const getIntervalDisplayName = (interval: string) => {
    switch (interval) {
      case 'monthly': return '月付';
      case 'quarterly': return '季付';
      case 'yearly': return '年付';
      case '2years': return '2年付';
      case '3years': return '3年付';
      default: return interval;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return currency.toLowerCase() === 'usd' 
      ? `$${amount.toFixed(2)}` 
      : `¥${amount.toFixed(2)}`;
  };

  const handleSort = (key: typeof sortConfig.key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedPlans = (plans: SubscriptionPlan[] | undefined) => {
    if (!plans || !sortConfig.key) return plans;
    
    return [...plans].sort((a, b) => {
      if (sortConfig.key === 'interval') {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (sortConfig.key === 'price' || sortConfig.key === 'discount_percentage' || sortConfig.key === 'display_order') {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        return sortConfig.direction === 'asc' 
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }
      
      if (sortConfig.key === 'is_active') {
        return sortConfig.direction === 'asc'
          ? Number(b.is_active) - Number(a.is_active)
          : Number(a.is_active) - Number(b.is_active);
      }
      
      return 0;
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>订阅计划管理</CardTitle>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" />
          添加计划
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead 
                  onClick={() => handleSort('interval')}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  周期 {sortConfig.key === 'interval' && (
                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead 
                  onClick={() => handleSort('price')}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  价格 {sortConfig.key === 'price' && (
                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead 
                  onClick={() => handleSort('discount_percentage')}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  折扣 {sortConfig.key === 'discount_percentage' && (
                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead 
                  onClick={() => handleSort('display_order')}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  排序 {sortConfig.key === 'display_order' && (
                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead 
                  onClick={() => handleSort('is_active')}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  状态 {sortConfig.key === 'is_active' && (
                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <div className="py-8 text-center">加载中...</div>
              ) : getSortedPlans(plans) && getSortedPlans(plans)!.length > 0 ? (
                getSortedPlans(plans)!.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>{getIntervalDisplayName(plan.interval)}</TableCell>
                    <TableCell>{formatCurrency(plan.price, plan.currency)}</TableCell>
                    <TableCell>{plan.discount_percentage > 0 ? `${plan.discount_percentage}%` : '-'}</TableCell>
                    <TableCell>{plan.display_order}</TableCell>
                    <TableCell>
                      {plan.is_active ? (
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-1" />
                          <span>启用</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <X className="h-4 w-4 text-red-500 mr-1" />
                          <span>禁用</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditPlan(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeletePlan(plan)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    暂无订阅计划
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? '编辑订阅计划' : '添加订阅计划'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">计划名称 *</Label>
                    <Input 
                      id="name" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="如：月度订阅"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="interval">订阅周期 *</Label>
                    <Select 
                      value={formData.interval} 
                      onValueChange={(value) => handleSelectChange('interval', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择周期" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">月付</SelectItem>
                        <SelectItem value="quarterly">季付</SelectItem>
                        <SelectItem value="yearly">年付</SelectItem>
                        <SelectItem value="2years">2年付</SelectItem>
                        <SelectItem value="3years">3年付</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">价格 *</Label>
                    <Input 
                      id="price" 
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">货币 *</Label>
                    <Select 
                      value={formData.currency} 
                      onValueChange={(value) => handleSelectChange('currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择货币" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">美元 (USD)</SelectItem>
                        <SelectItem value="cny">人民币 (CNY)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount_percentage">折扣百分比</Label>
                    <Input 
                      id="discount_percentage" 
                      name="discount_percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount_percentage}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="display_order">排序</Label>
                    <Input 
                      id="display_order" 
                      name="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">计划描述</Label>
                    <Input 
                      id="description" 
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="输入计划描述"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="is_active" 
                      name="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active">启用计划</Label>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => { setIsDialogOpen(false); resetForm(); }}
                >
                  取消
                </Button>
                <Button 
                  type="submit"
                  disabled={addMutation.isPending || updateMutation.isPending}
                >
                  {addMutation.isPending || updateMutation.isPending
                    ? '保存中...'
                    : isEditing ? '更新' : '添加'
                  }
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                您确定要删除"{currentPlan?.name}"订阅计划吗？此操作不可撤销，但不会影响已使用此计划的用户。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => currentPlan && deleteMutation.mutate(currentPlan.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? '删除中...' : '删除'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <AlertDialog open={deleteErrorDialogOpen} onOpenChange={setDeleteErrorDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 text-destructive mr-2" />
                删除失败
              </AlertDialogTitle>
              <AlertDialogDescription>
                {deleteErrorMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              {deleteErrorMessage.includes('请使用强制删除') && (
                <Button
                  variant="destructive"
                  className="mr-auto"
                  onClick={() => {
                    setDeleteErrorDialogOpen(false);
                    setForceDeleteDialogOpen(true);
                  }}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  强制删除
                </Button>
              )}
              <AlertDialogAction onClick={() => setDeleteErrorDialogOpen(false)}>
                确定
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <AlertDialog open={forceDeleteDialogOpen} onOpenChange={setForceDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-[#ff9500] mr-2" />
                确认强制删除
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p className="font-semibold text-destructive">警告：此操作不可逆！</p>
                <p>
                  强制删除将移除"{currentPlan?.name}"计划以及所有关联的：
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>用户订阅记录</li>
                  <li>交易记录</li>
                  <li>订阅历史</li>
                </ul>
                <p>这可能导致数据不一致，并影响已订阅此计划的用户。</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isForceDeleting}>取消</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleForceDelete}
                disabled={isForceDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isForceDeleting ? '删除中...' : '强制删除'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
