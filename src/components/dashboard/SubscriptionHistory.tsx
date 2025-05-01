import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSubscriptionPlans, createTestSubscription } from "@/lib/services/subscriptionService";
import { useAuth } from "@/contexts/authHooks";
import { SubscriptionItem } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarIcon, Clock, Loader2, Plus, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { SubscriptionPeriod } from "@/lib/types/course-new";

export function SubscriptionHistory() {
  const { user } = useAuth();
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const [periodOption, setPeriodOption] = useState<SubscriptionPeriod>("monthly");
  
  // 查询当前订阅
  const { 
    data: currentSubscription,
    isLoading: isLoadingCurrent,
    refetch: refetchCurrent
  } = useQuery({
    queryKey: ['current-subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        const { data } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            subscription_plans (*)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .lte('start_date', new Date().toISOString())
          .gte('end_date', new Date().toISOString())
          .single();
        return data || null;
      } catch (error) {
        console.error('Error fetching user subscription:', error);
        return null;
      }
    },
    enabled: !!user?.id,
  });

  // 查询订阅历史
  const { 
    data: subscriptionHistory = [],
    isLoading: isLoadingHistory,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ['subscription-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const { data } = await supabase
          .from('subscription_history')
          .select(`
            *,
            new_plan:new_plan_id (*),
            old_plan:old_plan_id (*)
          `)
          .eq('user_id', user.id)
          .order('effective_date', { ascending: false });
        
        return data || [];
      } catch (error) {
        console.error('Error fetching subscription history:', error);
        return [];
      }
    },
    enabled: !!user?.id,
  });

  const isLoading = isLoadingCurrent || isLoadingHistory;

  const handleGenerateData = async () => {
    if (!user?.id || isGeneratingData) return;
    
    setIsGeneratingData(true);
    try {
      const result = await createTestSubscription(user.id, periodOption);
      
      if (result.success) {
        toast.success("订阅测试数据已生成", {
          description: "您的订阅历史和当前订阅已更新"
        });
        
        await Promise.all([
          refetchCurrent(),
          refetchHistory()
        ]);
      } else {
        toast.error("生成订阅数据失败", {
          description: "请稍后再试"
        });
      }
    } catch (err) {
      console.error("生成订阅测试数据错误:", err);
      toast.error("生成订阅数据时发生错误", {
        description: "请联系管理员"
      });
    } finally {
      setIsGeneratingData(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "未知日期";
    return format(new Date(dateString), 'yyyy年MM月dd日');
  };

  // 渲染订阅状态徽章
  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">有效</Badge>;
      case 'canceled':
        return <Badge variant="secondary">已取消</Badge>;
      case 'expired':
        return <Badge variant="outline" className="border-amber-500 text-amber-700">已过期</Badge>;
      default:
        return <Badge variant="outline">未知状态</Badge>;
    }
  };

  // 渲染事件类型
  const renderEventType = (type?: string) => {
    switch (type) {
      case 'subscription_created':
        return '新订阅';
      case 'plan_changed':
        return '更改计划';
      case 'subscription_cancelled':
        return '取消订阅';
      case 'subscription_renewed':
        return '续订';
      default:
        return '状态变更';
    }
  };

  const hasSubscriptionData = currentSubscription || (subscriptionHistory && subscriptionHistory.length > 0);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-knowledge-primary" />
      </div>
    );
  }

  if (!hasSubscriptionData) {
    return (
      <div className="bg-muted/50 border rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium mb-2">暂无订阅记录</h3>
        <p className="text-muted-foreground mb-6">您尚未购买任何订阅计划</p>
        
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center max-w-md">
            <Select
              value={periodOption}
              onValueChange={(value) => setPeriodOption(value as SubscriptionPeriod)}
              disabled={isGeneratingData}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="请选择订阅类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">月度订阅</SelectItem>
                <SelectItem value="quarterly">季度订阅</SelectItem>
                <SelectItem value="yearly">年度订阅</SelectItem>
                <SelectItem value="2years">两年订阅</SelectItem>
                <SelectItem value="3years">三年订阅</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleGenerateData} 
              disabled={isGeneratingData}
              className="w-full sm:w-auto"
            >
              {isGeneratingData ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              添加示例数据
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            添加示例数据后可查看订阅功能
          </p>
        </div>
      </div>
    );
  }

  // Fix the features rendering for currentSubscription
  const hasFeatures = currentSubscription?.subscription_plans && 
                      Array.isArray(currentSubscription.subscription_plans.features) && 
                      currentSubscription.subscription_plans.features.length > 0;

  // Fix the rendering of subscription plans features and description
  const renderPlanInfo = (plan: any) => {
    if (!plan) return null;
    
    return (
      <>
        <h4 className="font-medium">{plan.name || "未知计划"}</h4>
        <p className="text-sm text-muted-foreground">
          {plan.description || ""}
        </p>
      </>
    );
  };

  return (
    <div className="space-y-8">
      {currentSubscription && (
        <Card className="border-knowledge-primary/20">
          <CardHeader className="bg-gradient-to-r from-knowledge-primary/5 to-knowledge-secondary/5">
            <CardTitle className="flex items-center justify-between">
              <span>当前订阅</span>
              {renderStatusBadge(currentSubscription.status)}
            </CardTitle>
            <CardDescription>
              您当前的订阅计划信息
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                {renderPlanInfo(currentSubscription.subscription_plans)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>开始日期：{formatDate(currentSubscription.start_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>到期日期：{formatDate(currentSubscription.end_date)}</span>
                </div>
              </div>
              
              {hasFeatures && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2">包含特权</h5>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {currentSubscription.subscription_plans.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {!currentSubscription.auto_renew && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm">
                  此订阅将在当前计费周期结束后自动取消
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {subscriptionHistory && subscriptionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>订阅历史记录</CardTitle>
            <CardDescription>
              您的订阅变更历史记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {subscriptionHistory.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b last:border-0 last:pb-0 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">{renderEventType(item.change_type)}</Badge>
                      <h4 className="font-medium">
                        {item.new_plan?.name || "未知计划"}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.new_plan?.description || (item.change_type === 'subscription_cancelled' ? "订阅已取消" : "")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(item.effective_date)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <p className="text-sm text-muted-foreground">需要添加更多示例数据？</p>
                <Select
                  value={periodOption}
                  onValueChange={(value) => setPeriodOption(value as SubscriptionPeriod)}
                  disabled={isGeneratingData}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="请选择订阅类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">月度订阅</SelectItem>
                    <SelectItem value="quarterly">季度订阅</SelectItem>
                    <SelectItem value="yearly">年度订阅</SelectItem>
                    <SelectItem value="2years">两年订阅</SelectItem>
                    <SelectItem value="3years">三年订阅</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline"
                  onClick={handleGenerateData}
                  disabled={isGeneratingData}
                >
                  {isGeneratingData ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="mr-2 h-4 w-4" />
                  )}
                  {isGeneratingData ? '添加中...' : '添加更多示例'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
