
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/authHooks";
import { Loader2, CreditCard, Plus, Trash2, Clock, AlertTriangle } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function SubscriptionHistory() {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);

  // Fetch user's subscription history
  const {
    data: subscriptionHistory,
    isLoading: isLoadingHistory,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ['subscription-history', user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) return { data: [], error: null };

        const { data, error } = await supabase
          .from('subscription_history')
          .select(`
            *,
            new_plan:new_plan_id(
              id, name, price, interval, features
            ),
            old_plan:previous_plan_id(
              id, name, price, interval, features
            )
          `)
          .eq('user_id', user.id)
          .order('effective_date', { ascending: false });

        if (error) {
          console.error('Error fetching subscription history:', error);
          return { data: [], error };
        }

        return { data: data || [], error: null };
      } catch (error) {
        console.error('Error in subscription history query:', error);
        return { data: [], error };
      }
    },
    enabled: !!user?.id
  });

  // Fetch user's current subscription
  const {
    data: currentSubscription,
    isLoading: isLoadingSubscription,
    refetch: refetchSubscription
  } = useQuery({
    queryKey: ['current-subscription', user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) return { data: null, error: null };

        const { data, error } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            subscription_plans(*)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (error && !error.message?.includes('No rows found')) {
          console.error('Error fetching current subscription:', error);
          return { data: null, error };
        }

        return { data: data || null, error: null };
      } catch (error) {
        console.error('Error in current subscription query:', error);
        return { data: null, error };
      }
    },
    enabled: !!user?.id
  });

  const handleGenerateHistory = async () => {
    if (!user?.id || generating) return;

    setGenerating(true);
    toast.loading('生成订阅历史记录...', { id: 'generate-history' });

    try {
      // Generate 1-3 random history entries
      const count = Math.floor(Math.random() * 3) + 1;
      
      // Get a random plan to use
      const { data: plans } = await supabase
        .from('subscription_plans')
        .select('id, name')
        .limit(3);
      
      if (!plans || plans.length === 0) {
        toast.error('没有可用的订阅计划');
        setGenerating(false);
        toast.dismiss('generate-history');
        return;
      }
      
      // Create random history entries
      for (let i = 0; i < count; i++) {
        const plan = plans[Math.floor(Math.random() * plans.length)];
        const changeTypes = ['subscription_created', 'plan_changed', 'subscription_cancelled', 'subscription_renewed'];
        const changeType = changeTypes[Math.floor(Math.random() * changeTypes.length)];
        
        // Create a date between 1 and 365 days ago
        const daysAgo = Math.floor(Math.random() * 365) + 1;
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        
        await supabase
          .from('subscription_history')
          .insert({
            user_id: user.id,
            change_type: changeType,
            new_plan_id: changeType !== 'subscription_cancelled' ? plan.id : null,
            previous_plan_id: changeType === 'plan_changed' ? plans[0].id : null,
            subscription_id: `sub-mock-${Date.now()}-${i}`,
            amount: Math.floor(Math.random() * 500) + 100,
            currency: 'CNY',
            effective_date: date.toISOString()
          });
      }
      
      toast.dismiss('generate-history');
      toast.success('示例订阅历史已生成');
      
      // Refresh data
      refetchHistory();
      refetchSubscription();
    } catch (error) {
      console.error('Error generating subscription history:', error);
      toast.dismiss('generate-history');
      toast.error('生成订阅历史失败');
    } finally {
      setGenerating(false);
    }
  };

  const handleClearHistory = async () => {
    if (!user?.id || generating) return;

    if (!confirm('确定要清除所有订阅历史记录吗？此操作不可逆。')) {
      return;
    }

    setGenerating(true);
    toast.loading('清除订阅历史...', { id: 'clear-history' });

    try {
      await supabase
        .from('subscription_history')
        .delete()
        .eq('user_id', user.id);
      
      toast.dismiss('clear-history');
      toast.success('订阅历史已清除');
      
      // Refresh data
      refetchHistory();
    } catch (error) {
      console.error('Error clearing subscription history:', error);
      toast.dismiss('clear-history');
      toast.error('清除订阅历史失败');
    } finally {
      setGenerating(false);
    }
  };

  // Helper function to get appropriate icon based on change_type
  const getEventIcon = (changeType: string) => {
    switch (changeType) {
      case 'subscription_created':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case 'plan_changed': 
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'subscription_cancelled':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'subscription_renewed':
        return <Clock className="h-4 w-4 text-green-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  // Helper function to get event type label
  const getEventTypeLabel = (changeType: string) => {
    switch (changeType) {
      case 'subscription_created':
        return '订阅创建';
      case 'plan_changed':
        return '计划变更';
      case 'subscription_cancelled':
        return '订阅取消';
      case 'subscription_renewed':
        return '订阅续费';
      default:
        return '未知事件';
    }
  };

  // Function to safely access plan data
  const getPlanName = (planData: any) => {
    if (!planData) return '未知计划';
    if (typeof planData === 'object' && 'name' in planData) return planData.name;
    return '未知计划';
  };

  // Helper function to format description based on event type
  const getEventDescription = (event: any) => {
    if (!event) return '';
    
    switch (event.change_type) {
      case 'subscription_created':
        return `开始订阅${getPlanName(event.new_plan)}`;
      case 'plan_changed':
        return `从${getPlanName(event.old_plan)}变更为${getPlanName(event.new_plan)}`;
      case 'subscription_cancelled':
        return `取消了订阅`;
      case 'subscription_renewed':
        return `续订了${getPlanName(event.new_plan)}`;
      default:
        return event.notes || '无详细信息';
    }
  };

  // Loading state
  if (isLoadingHistory || isLoadingSubscription) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-knowledge-primary" />
      </div>
    );
  }

  // Check if there's no history and no current subscription
  const hasNoData = 
    (!subscriptionHistory?.data || subscriptionHistory.data.length === 0) && 
    !currentSubscription?.data;

  // Empty state with option to generate sample data
  if (hasNoData) {
    return (
      <div className="bg-muted/50 border rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium mb-2">暂无订阅记录</h3>
        <p className="text-muted-foreground mb-6">您还没有任何订阅记录</p>
        
        <Button 
          onClick={handleGenerateHistory} 
          disabled={generating}
          className="inline-flex items-center"
        >
          {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          生成示例数据
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Card */}
      {currentSubscription?.data && (
        <Card className="p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">当前订阅</h3>
            <Badge variant={currentSubscription.data.status === 'active' ? 'default' : 'secondary'}>
              {currentSubscription.data.status === 'active' ? '已激活' : '未激活'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">订阅计划</p>
              <p className="font-medium">{currentSubscription.data.subscription_plans?.name || '未知计划'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">价格</p>
              <p className="font-medium">
                {currentSubscription.data.subscription_plans?.price || 0} 
                {(currentSubscription.data.currency || 'CNY').toUpperCase()} / 
                {currentSubscription.data.subscription_plans?.interval === 'monthly' ? '月' : 
                 currentSubscription.data.subscription_plans?.interval === 'yearly' ? '年' : 
                 currentSubscription.data.subscription_plans?.interval || '期'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">开始时间</p>
              <p className="font-medium">
                {currentSubscription.data.start_date ? 
                  format(new Date(currentSubscription.data.start_date), 'yyyy-MM-dd') : 
                  '未知'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">下次续费时间</p>
              <p className="font-medium">
                {currentSubscription.data.end_date ? 
                  format(new Date(currentSubscription.data.end_date), 'yyyy-MM-dd') : 
                  '未知'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Subscription History */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">订阅历史</h3>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGenerateHistory}
              disabled={generating}
            >
              {generating ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Plus className="mr-1 h-3 w-3" />}
              添加示例
            </Button>
            {(subscriptionHistory?.data && subscriptionHistory.data.length > 0) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearHistory}
                disabled={generating}
                className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                清除记录
              </Button>
            )}
          </div>
        </div>

        {(subscriptionHistory?.data && subscriptionHistory.data.length > 0) ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">日期</TableHead>
                  <TableHead className="w-[100px]">类型</TableHead>
                  <TableHead>详情</TableHead>
                  <TableHead className="w-[100px] text-right">金额</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptionHistory.data.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      {event.effective_date && format(new Date(event.effective_date), 'yyyy-MM-dd')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {getEventIcon(event.change_type)}
                        <span className="text-xs whitespace-nowrap">{getEventTypeLabel(event.change_type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getEventDescription(event)}
                    </TableCell>
                    <TableCell className="text-right">
                      {event.amount} {event.currency}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 border rounded-lg">
            <p className="text-muted-foreground">暂无订阅历史记录</p>
          </div>
        )}
      </div>
    </div>
  );
}
