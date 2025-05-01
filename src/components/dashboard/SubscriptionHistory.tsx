
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/authHooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserSubscriptionHistory, getUserActiveSubscription, getSubscriptionPlans, createTestSubscription } from "@/lib/services/subscriptionService";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { format } from "date-fns";
import { ArrowRightCircle, CheckCircle, AlertCircle, Clock, Loader2, Plus } from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function SubscriptionHistory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['subscription-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await getUserSubscriptionHistory(user.id);
    },
    enabled: !!user
  });
  
  const { data: currentSubscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['current-subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return await getUserActiveSubscription(user.id);
    },
    enabled: !!user
  });
  
  const { data: allPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      return await getSubscriptionPlans();
    }
  });

  const isLoading = historyLoading || subscriptionLoading || plansLoading;
  
  // Get the current plan's details
  const currentPlan = useMemo(() => {
    if (!currentSubscription || !allPlans) return null;
    return allPlans.find(plan => plan.id === currentSubscription.plan_id);
  }, [currentSubscription, allPlans]);
  
  const handleCreateTestSub = async () => {
    if (!user?.id || isCreatingTest) return;
    
    setIsCreatingTest(true);
    try {
      const result = await createTestSubscription(user.id);
      
      if (result.success) {
        toast.success('测试订阅已创建', {
          description: '刷新页面可以查看订阅详情'
        });
        
        // Invalidate queries to refresh data
        await queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
        await queryClient.invalidateQueries({ queryKey: ['subscription-history'] });
        
      } else {
        toast.error('创建测试订阅失败', {
          description: result.error || '请稍后重试'
        });
      }
    } catch (err) {
      console.error('Error creating test subscription:', err);
      toast.error('创建测试订阅时发生错误');
    } finally {
      setIsCreatingTest(false);
    }
  };

  // Helper function to safely access features with null check
  const getFeatures = (plan: any) => {
    return plan?.features || [];
  };

  if (isLoading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-knowledge-primary" />
      </div>
    );
  }

  if (!currentSubscription && (!history || history.length === 0)) {
    return (
      <div className="bg-muted/50 border rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium mb-2">无订阅记录</h3>
        <p className="text-muted-foreground mb-6">您尚未订阅任何内容</p>
        
        <div className="flex justify-center">
          <Button 
            onClick={handleCreateTestSub} 
            disabled={isCreatingTest}
            className="inline-flex items-center"
          >
            {isCreatingTest ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            添加测试订阅
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {currentSubscription && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>当前订阅</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{currentPlan?.name || '标准订阅'}</h3>
                  <p className="text-muted-foreground">{currentPlan?.description || '所有课程的完整访问权限'}</p>
                </div>
                <Badge variant="success" className="px-3 py-1.5 text-base">
                  当前激活
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">订阅价格</p>
                  <p className="font-medium">
                    {currentPlan?.price || '?'} {currentPlan?.currency?.toUpperCase() || 'CNY'}/{currentPlan?.interval || '月'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">到期时间</p>
                  <p className="font-medium">
                    {currentSubscription.end_date ? format(new Date(currentSubscription.end_date), 'yyyy-MM-dd') : '未知'}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">包含功能</h4>
                <ul className="space-y-1">
                  {getFeatures(currentPlan).map((feature: string, index: number) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      {feature}
                    </li>
                  ))}
                  {getFeatures(currentPlan).length === 0 && (
                    <li className="text-muted-foreground">无详细功能信息</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {history && history.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>订阅历史记录</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="relative space-y-4">
              {history.map((record, index) => {
                // Find plan details if available
                const oldPlan = record.old_plan || record.previous_plan;
                const newPlan = record.new_plan;
                
                return (
                  <div key={index} className="relative pl-6 pb-6">
                    {index < history.length - 1 && (
                      <div className="absolute left-2.5 top-3 w-px bg-gray-200 h-full"></div>
                    )}
                    
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <div className={cn(
                          "absolute left-0 w-5 h-5 rounded-full flex items-center justify-center",
                          record.event_type === 'subscription_created' ? "bg-green-100" : 
                          record.event_type === 'subscription_cancelled' ? "bg-red-100" : "bg-blue-100"
                        )}>
                          {record.event_type === 'subscription_created' ? 
                            <CheckCircle className="h-3 w-3 text-green-600" /> : 
                            record.event_type === 'subscription_cancelled' ? 
                            <AlertCircle className="h-3 w-3 text-red-600" /> : 
                            <Clock className="h-3 w-3 text-blue-600" />
                          }
                        </div>
                        
                        <h4 className="font-medium">
                          {record.event_type === 'subscription_created' ? '订阅开始' : 
                           record.event_type === 'subscription_cancelled' ? '订阅取消' : 
                           record.event_type === 'plan_changed' ? '更改订阅计划' : '订阅变更'}
                        </h4>
                        
                        <span className="ml-auto text-sm text-muted-foreground">
                          {record.effective_date ? format(new Date(record.effective_date), 'yyyy-MM-dd') : ''}
                        </span>
                      </div>
                      
                      <div className="mt-2 pl-2">
                        {record.event_type === 'plan_changed' && oldPlan && newPlan ? (
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                            <div className="px-3 py-1.5 bg-muted rounded-md">
                              <p className="text-sm font-medium">{oldPlan?.name || '旧计划'}</p>
                              <p className="text-xs text-muted-foreground">{getFeatures(oldPlan).join(', ') || '无详情'}</p>
                            </div>
                            <ArrowRightCircle className="hidden md:block h-4 w-4 mx-1 text-muted-foreground" />
                            <div className="px-3 py-1.5 bg-green-50 border border-green-100 rounded-md">
                              <p className="text-sm font-medium">{newPlan?.name || '新计划'}</p>
                              <p className="text-xs text-muted-foreground">{getFeatures(newPlan).join(', ') || '无详情'}</p>
                            </div>
                          </div>
                        ) : record.event_type === 'subscription_created' && newPlan ? (
                          <div className="px-3 py-1.5 bg-green-50 border border-green-100 rounded-md inline-block">
                            <p className="text-sm font-medium">{newPlan?.name || '订阅计划'}</p>
                            <p className="text-xs text-muted-foreground">{getFeatures(newPlan).join(', ') || '无详情'}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {record.notes || '无详细信息'}
                          </p>
                        )}
                        
                        {record.amount && (
                          <p className="mt-1 text-sm">
                            金额: {record.amount} {record.currency?.toUpperCase() || 'CNY'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>订阅历史记录</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-center py-8">
            <p className="text-muted-foreground">暂无订阅历史记录</p>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-center mt-4">
        <Button 
          onClick={handleCreateTestSub} 
          variant="outline"
          disabled={isCreatingTest}
          className="inline-flex items-center"
        >
          {isCreatingTest ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          添加更多测试数据
        </Button>
      </div>
    </div>
  );
}
