import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { getSubscriptionPlans, SubscriptionPlan } from '@/lib/services/subscriptionService';
import { useQuery } from '@tanstack/react-query';
import type { PaymentMethod } from './PaymentMethodSelect';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

interface PurchaseOptionsProps {
  selectedOption: "single" | "subscription";
  onOptionChange: (value: "single" | "subscription") => void;
  selectedPlan: string;
  onPlanChange: (value: string, price: number, planName: string, discountPct: number) => void;
  paymentMethod: PaymentMethod;
  exchangeRate: number;
  course?: { 
    subscription_plans?: SubscriptionPlan[],
    price?: number,
    currency?: string
  };
}

export function PurchaseOptions({
  selectedOption,
  onOptionChange,
  selectedPlan,
  onPlanChange,
  paymentMethod,
  exchangeRate,
  course
}: PurchaseOptionsProps) {
  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: getSubscriptionPlans
  });

  // 获取课程实际价格和币种
  const coursePrice = course?.price || 49.99;
  const courseCurrency = course?.currency || 'usd';
  
  console.log("PurchaseOptions - 课程价格:", coursePrice, "币种:", courseCurrency);

  const formatPrice = (price: number) => {
    // 如果支付方式是微信，且课程币种是USD，则需要转换为CNY
    if (paymentMethod === 'wechat' && courseCurrency.toLowerCase() === 'usd') {
      const cnyPrice = price * exchangeRate;
      return formatCurrency(cnyPrice, 'CNY');
    }
    // 如果支付方式不是微信，但课程币种是CNY，则需要转换为USD
    else if (paymentMethod !== 'wechat' && courseCurrency.toLowerCase() === 'cny') {
      const usdPrice = price / exchangeRate;
      return formatCurrency(usdPrice, 'USD');
    }
    // 否则直接使用课程原始币种
    return formatCurrency(price, courseCurrency.toUpperCase());
  };

  const sortedPlans = plans ? 
    [...plans].sort((a, b) => a.display_order - b.display_order) : 
    course?.subscription_plans?.sort((a, b) => a.display_order - b.display_order) || 
    [];

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    if (!plan) {
      toast.error("未选择有效的订阅计划");
      return;
    }

    console.log("选择订阅计划:", plan);
    onOptionChange('subscription');
    onPlanChange(
      plan.interval, 
      plan.price, 
      plan.name, 
      plan.discount_percentage
    );
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold mb-6">选择付款方案</h2>
      <RadioGroup 
        value={selectedOption} 
        onValueChange={(value) => {
          if (value === 'single') {
            console.log("选择单次购买，设置课程实际价格:", coursePrice, "币种:", courseCurrency);
            onPlanChange('', coursePrice, '单次购买', 0);
          }
          onOptionChange(value as "single" | "subscription")
        }} 
        className="space-y-6"
      >
        <Card 
          className={`relative p-6 cursor-pointer transition-all hover:border-primary/50 hover:bg-gray-50 ${
            selectedOption === 'single' ? 'border-primary ring-2 ring-primary/20' : ''
          }`}
          onClick={() => {
            console.log("点击单次购买，设置课程实际价格:", coursePrice, "币种:", courseCurrency);
            onOptionChange('single');
            onPlanChange('', coursePrice, '单次购买', 0);
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem 
                value="single" 
                id="single"
                className={selectedOption === 'single' ? '[--radio-foreground:#000000]' : ''}
              />
              <div>
                <Label htmlFor="single" className="text-lg font-semibold cursor-pointer">单次购买</Label>
                <p className="text-sm text-muted-foreground mt-1">一次性付款，永久访问课程内容</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold">{formatPrice(coursePrice)}</span>
              <span className="block text-sm text-muted-foreground">单次付款</span>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">订阅计划</h3>
            <Badge variant="outline" className="bg-primary/5 text-primary">定期付费，更经济实惠</Badge>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">加载订阅计划中...</p>
              </Card>
            ) : sortedPlans.length > 0 ? (
              sortedPlans.map((plan) => {
                const isSelected = selectedOption === 'subscription' && selectedPlan === plan.interval;
                
                return (
                  <Card
                    key={plan.id}
                    className={`relative p-6 cursor-pointer transition-all hover:border-primary/50 hover:bg-gray-50 ${
                      isSelected ? 'border-primary ring-2 ring-primary/20' : ''
                    }`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={`subscription-${plan.interval}`}
                          id={`plan-${plan.id}`}
                          checked={isSelected}
                          className={isSelected ? '[--radio-foreground:#000000]' : ''}
                        />
                        <div>
                          <Label htmlFor={`plan-${plan.id}`} className="text-lg font-semibold cursor-pointer">
                            {plan.name}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">{plan.description || `${plan.interval}订阅计划`}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-2xl font-bold">{formatPrice(plan.price)}</span>
                        </div>
                        <span className="block text-sm text-muted-foreground">
                          {plan.interval === 'monthly' ? '每月' : 
                           plan.interval === 'quarterly' ? '每季度' : 
                           plan.interval === 'yearly' ? '每年' : 
                           plan.interval === '2years' ? '每两年' : 
                           plan.interval === '3years' ? '每三年' : '按订阅周期'}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <Badge variant="secondary" className="absolute top-3 right-3">
                        当前选择
                      </Badge>
                    )}
                    {plan.discount_percentage > 0 && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        节省 {plan.discount_percentage}%
                      </Badge>
                    )}
                  </Card>
                );
              })
            ) : (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">暂无可用的订阅计划</p>
              </Card>
            )}
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}
