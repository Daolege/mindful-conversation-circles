
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/authHooks";
import { SubscriptionPlans } from './SubscriptionPlans';
import { createSubscription, getSubscriptionPlans, getUserActiveSubscription, SubscriptionPeriod } from '@/lib/services/subscriptionService';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface SubscriptionCheckoutProps {
  paymentMethod: string;
  exchangeRate: number;
  onCheckout?: () => void;
}

export function SubscriptionCheckout({ paymentMethod, exchangeRate, onCheckout }: SubscriptionCheckoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPeriod>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 获取订阅计划
  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: getSubscriptionPlans
  });

  // 获取用户当前活跃的订阅
  const { data: activeSubscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['active-subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return await getUserActiveSubscription(user.id);
    },
    enabled: !!user?.id
  });

  // 确保有默认选择的计划
  useEffect(() => {
    if (plans && plans.length > 0 && (!selectedPlan || !plans.some(p => p.interval === selectedPlan))) {
      console.log("SubscriptionCheckout - Setting default plan:", plans[0].interval);
      setSelectedPlan(plans[0].interval);
    }
  }, [plans, selectedPlan]);

  // 处理订阅计划变更
  const handlePlanChange = (plan: SubscriptionPeriod) => {
    console.log("SubscriptionCheckout - Selected plan changed to:", plan);
    setSelectedPlan(plan);
    // 清除之前的错误
    setErrorMessage(null);
  };

  // 处理订阅购买
  const handleSubscribe = async () => {
    if (!user) {
      toast.error("请先登录", { description: "您需要登录才能订阅" });
      navigate('/auth');
      return;
    }

    if (!selectedPlan) {
      toast.error("请选择订阅计划", { description: "您需要选择一个订阅计划才能继续" });
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    
    // 显示开始处理的提示
    const loadingToast = toast.loading("正在处理您的订阅请求...");
    
    try {
      console.log("开始创建订阅，选中计划:", selectedPlan, "支付方式:", paymentMethod);
      
      const result = await createSubscription(user, selectedPlan, paymentMethod);
      console.log("创建订阅结果:", result);
      
      // 关闭加载提示
      toast.dismiss(loadingToast);
      
      if (result.success) {
        toast.success("订阅成功", {
          description: `您已成功订阅${selectedPlan === 'monthly' ? '月度' : selectedPlan === 'quarterly' ? '季度' : '年度'}计划`
        });
        
        if (onCheckout) {
          onCheckout();
        } else {
          navigate('/dashboard?tab=subscriptions');
        }
      } else {
        // 设置错误信息
        setErrorMessage(result.error || "订阅创建失败，请稍后重试");
        
        toast.error("订阅失败", { 
          description: result.error || "处理您的订阅时出现问题，请稍后再试" 
        });
      }
    } catch (error) {
      // 关闭加载提示
      toast.dismiss(loadingToast);
      
      console.error('Subscription error:', error);
      const errorMessage = error instanceof Error ? error.message : "处理您的订阅时出现意外错误";
      setErrorMessage(errorMessage);
      
      toast.error("订阅失败", {
        description: "处理您的订阅时出现问题，请稍后再试"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 根据当前订阅状态展示不同的内容
  const renderContent = () => {
    if (isLoadingPlans || isLoadingSubscription) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-knowledge-primary mb-4" />
          <p>加载中...</p>
        </div>
      );
    }

    if (activeSubscription) {
      return (
        <div className="flex flex-col items-center p-6 text-center">
          <Badge variant="outline" className="bg-green-50 text-green-700 mb-4 px-3 py-1">已订阅</Badge>
          <h3 className="text-xl font-semibold mb-2">您已订阅 {activeSubscription.subscription_plans?.name || '未知计划'}</h3>
          <p className="text-muted-foreground mb-4">
            订阅有效期至 {new Date(activeSubscription.end_date).toLocaleDateString()}
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard?tab=subscriptions')}
          >
            管理我的订阅
          </Button>
        </div>
      );
    }

    if (!plans || plans.length === 0) {
      return (
        <div className="flex flex-col items-center p-6 text-center">
          <p className="text-muted-foreground mb-4">暂无可用的订阅计划</p>
        </div>
      );
    }

    return (
      <>
        <CardContent className="p-6">
          <SubscriptionPlans 
            selectedPlan={selectedPlan}
            onPlanChange={handlePlanChange}
            paymentMethod={paymentMethod}
            exchangeRate={exchangeRate}
          />
          
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 text-red-800 rounded border border-red-200">
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            取消
          </Button>
          <Button 
            onClick={handleSubscribe} 
            disabled={isSubmitting || !selectedPlan}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                处理中...
              </>
            ) : '确认订阅'}
          </Button>
        </CardFooter>
      </>
    );
  };

  return (
    <Card className="w-full">
      {renderContent()}
    </Card>
  );
}
