
import React, { useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Info } from "lucide-react";
import { getSubscriptionPlans } from '@/lib/services/subscriptionService';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SubscriptionPeriod, SubscriptionPlan } from '@/lib/types/course-new';

// Re-export the SubscriptionPeriod type
export type { SubscriptionPeriod };

interface SubscriptionPlansProps {
  selectedPlan: SubscriptionPeriod;
  onPlanChange: (plan: SubscriptionPeriod, price: number, planName: string, discountPercentage: number) => void;
  paymentMethod: string;
  exchangeRate: number;
}

export function SubscriptionPlans({ selectedPlan, onPlanChange, paymentMethod, exchangeRate }: SubscriptionPlansProps) {
  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: getSubscriptionPlans,
  });

  useEffect(() => {
    if (error) {
      toast.error("加载订阅计划失败", {
        description: "无法获取订阅计划信息，请刷新页面重试"
      });
    }
  }, [error]);
  
  useEffect(() => {
    if (selectedPlan && plans && plans.length > 0) {
      const selectedPlanObj = plans.find(p => {
        const planInterval = p.interval || '';
        return planInterval === selectedPlan || 
          (planInterval === '' && (
            (selectedPlan === 'monthly' && p.name.includes('月')) ||
            (selectedPlan === 'quarterly' && p.name.includes('季')) ||
            (selectedPlan === '2years' && p.name.includes('2年')) ||
            (selectedPlan === '3years' && p.name.includes('3年')) ||
            (selectedPlan === 'yearly' && p.name.includes('年') && 
              !p.name.includes('2年') && !p.name.includes('3年'))
          ));
      });
      
      if (selectedPlanObj) {
        onPlanChange(
          selectedPlan, 
          selectedPlanObj.price, 
          selectedPlanObj.name,
          selectedPlanObj.discount_percentage || 0
        );
      }
    }
  }, [plans, selectedPlan, onPlanChange]);
  
  const formatPrice = (price: number) => {
    if (paymentMethod === 'wechat' || paymentMethod === 'alipay') {
      const cnyPrice = price * exchangeRate;
      return `¥${cnyPrice.toFixed(2)}`;
    }
    return `$${price.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <Card className="p-6 flex justify-center items-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
        <span className="ml-2">加载订阅计划中...</span>
      </Card>
    );
  }

  if (error || !plans || plans.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">订阅计划</h2>
        <Alert variant="warning" className="mb-4">
          <Info className="h-5 w-5" />
          <AlertDescription>
            {error ? "无法加载订阅计划，请稍后再试" : "暂无可用的订阅计划"}
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  const getPlanDisplayName = (interval: string): string => {
    switch (interval) {
      case 'monthly': return '月付';
      case 'quarterly': return '季付';
      case 'yearly': return '年付';
      case '2years': return '2年付';
      case '3years': return '3年付';
      default: return interval;
    }
  };

  const sortedPlans = plans && plans.length > 0 ? [...plans].sort((a, b) => a.display_order - b.display_order) : [];

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    console.log("SubscriptionPlans - Selecting plan:", plan);
    
    let interval = plan.interval;
    
    if (!interval || interval.trim() === '') {
      console.log("计划interval为空，根据名称判断订阅周期");
      if (plan.name.includes("月") || plan.name.includes("月付")) {
        interval = "monthly";
      } else if (plan.name.includes("季") || plan.name.includes("季付") || plan.name.includes("季度")) {
        interval = "quarterly";
      } else if (plan.name.includes("2年") || plan.name.includes("2年付")) {
        interval = "2years";
      } else if (plan.name.includes("3年") || plan.name.includes("3年付")) {
        interval = "3years";
      } else if (plan.name.includes("年") || plan.name.includes("年付")) {
        interval = "yearly";
      } else {
        interval = "monthly";
      }
    }
    
    console.log("设置订阅周期为:", interval);
    onPlanChange(interval as SubscriptionPeriod, plan.price, plan.name, plan.discount_percentage || 0);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">选择订阅周期</h2>
      <RadioGroup 
        value={selectedPlan} 
        onValueChange={(value) => {
          const selectedPlanObj = sortedPlans.find(p => p.interval === value || 
            (p.name.includes(value === "quarterly" ? "季" : 
             value === "monthly" ? "月" : 
             value === "2years" ? "2年" : 
             value === "3years" ? "3年" : "年")));
          
          if (selectedPlanObj) {
            handlePlanSelect(selectedPlanObj);
          }
        }}
        className="space-y-4"
      >
        {sortedPlans.map((plan) => {
          let planInterval = plan.interval;
          if (!planInterval || planInterval.trim() === '') {
            if (plan.name.includes("月") || plan.name.includes("月付")) {
              planInterval = "monthly";
            } else if (plan.name.includes("季") || plan.name.includes("季度") || plan.name.includes("季付")) {
              planInterval = "quarterly";
            } else if (plan.name.includes("2年") || plan.name.includes("2年付")) {
              planInterval = "2years";
            } else if (plan.name.includes("3年") || plan.name.includes("3年付")) {
              planInterval = "3years";
            } else if (plan.name.includes("年") || plan.name.includes("年付")) {
              planInterval = "yearly";
            } else {
              planInterval = "monthly";
            }
          }
          
          console.log(`计划 ${plan.name} 的interval值为: ${planInterval}`);
          
          const isSelected = selectedPlan === planInterval;
          
          return (
            <div 
              key={plan.id}
              className={`
                relative p-4 border rounded-10 cursor-pointer transition-all duration-300
                ${isSelected 
                  ? "bg-gray-900 border-gray-700" 
                  : "hover:bg-gray-50 border-gray-200"
                }
              `}
              onClick={() => handlePlanSelect(plan)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value={planInterval} 
                    id={`plan-${plan.id}`} 
                    checked={isSelected}
                    className={`
                      ${isSelected 
                        ? "border-white text-white" 
                        : ""
                      }
                    `}
                  />
                  <Label 
                    htmlFor={`plan-${plan.id}`} 
                    className={`
                      cursor-pointer 
                      ${isSelected ? "text-white" : ""}
                    `}
                  >
                    <div className="font-medium">{plan.name}</div>
                    <p className={`
                      text-sm
                      ${isSelected ? "text-gray-300" : "text-muted-foreground"}
                    `}>
                      {plan.description || `${getPlanDisplayName(planInterval)}订阅计划`}
                    </p>
                  </Label>
                </div>
                <div className="text-right">
                  <div className={`
                    text-lg font-bold 
                    ${isSelected ? "text-white" : ""}
                  `}>
                    {formatPrice(plan.price)}
                  </div>
                  {plan.discount_percentage > 0 && (
                    <div className={`
                      text-sm 
                      ${isSelected 
                        ? "text-gray-300" 
                        : "text-gray-500"
                      }
                    `}>
                      节省 {plan.discount_percentage}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </RadioGroup>
    </Card>
  );
}
