
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from 'lucide-react';
import { SubscriptionPlan } from '@/lib/types/course-new';

interface PurchaseOptionsProps {
  onSelectSingle: () => void;
  onSelectSubscription: () => void;
  coursePrice: number;
  subscriptionPrice?: number;
  currency?: string;
  courseTitle?: string;
}

export function PurchaseOptions({
  onSelectSingle,
  onSelectSubscription,
  coursePrice,
  subscriptionPrice,
  currency = 'CNY',
  courseTitle = '课程'
}: PurchaseOptionsProps) {
  const formatPrice = (price?: number) => {
    if (!price && price !== 0) return '免费';
    return currency === 'CNY' || currency === 'cny' 
      ? `¥${price.toFixed(2)}` 
      : `$${price.toFixed(2)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="relative hover:shadow-lg transition-shadow border-2">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-xl font-semibold">单次购买</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="text-3xl font-bold mb-2">{formatPrice(coursePrice)}</div>
            <p className="text-muted-foreground">一次性付款</p>
          </div>
          
          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>永久访问《{courseTitle}》</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>完整课程内容</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>课后作业和练习</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>支持随时观看回放</span>
            </li>
          </ul>
          
          <Button 
            className="w-full"
            onClick={onSelectSingle}
            size="lg"
          >
            立即购买
          </Button>
        </CardContent>
      </Card>
      
      <Card className="relative hover:shadow-lg transition-shadow border-2 border-knowledge-primary">
        <div className="absolute top-0 right-0 -translate-y-1/2 bg-knowledge-primary text-white py-1 px-4 rounded-full text-sm font-medium">
          推荐
        </div>
        
        <CardHeader className="bg-knowledge-primary/10">
          <CardTitle className="text-xl font-semibold">订阅计划</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="text-3xl font-bold mb-2">
              {formatPrice(subscriptionPrice || coursePrice * 0.8)}
              <span className="text-sm font-normal text-muted-foreground ml-1">/ 月起</span>
            </div>
            <p className="text-muted-foreground">灵活订阅，随时可取消</p>
          </div>
          
          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-knowledge-primary mt-0.5 flex-shrink-0" />
              <span>访问全站所有课程</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-knowledge-primary mt-0.5 flex-shrink-0" />
              <span>新课程优先体验</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-knowledge-primary mt-0.5 flex-shrink-0" />
              <span>专属学习社区</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-knowledge-primary mt-0.5 flex-shrink-0" />
              <span>季付/年付更多优惠</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-knowledge-primary mt-0.5 flex-shrink-0" />
              <span>随时取消，无长期绑定</span>
            </li>
          </ul>
          
          <Button 
            variant="default"
            className="w-full bg-knowledge-primary hover:bg-knowledge-primary/90"
            onClick={onSelectSubscription}
            size="lg"
          >
            选择订阅
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
