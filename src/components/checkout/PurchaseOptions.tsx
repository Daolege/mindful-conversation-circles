
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from 'lucide-react';
import { SubscriptionPlan } from '@/lib/types/course-new';
import { useTranslations } from "@/hooks/useTranslations";

interface PurchaseOptionsProps {
  onSelectSingle: () => void;
  onSelectSubscription: () => void;
  coursePrice: number;
  subscriptionPrice?: number;
  currency?: string;
  courseTitle?: string;
  selectedPlan?: string;
  selectedOption?: string;
  onOptionChange?: (option: string) => void;
  onPlanChange?: (period: string, price: number, name: string, discountPct: number) => void;
  paymentMethod?: string;
  exchangeRate?: number;
  course?: any;
}

export function PurchaseOptions({
  onSelectSingle,
  onSelectSubscription,
  coursePrice,
  subscriptionPrice,
  currency = 'CNY',
  courseTitle = '课程',
  selectedOption,
  selectedPlan,
  onOptionChange,
  onPlanChange,
  paymentMethod,
  exchangeRate,
  course
}: PurchaseOptionsProps) {
  const { t } = useTranslations();
  
  const formatPrice = (price?: number) => {
    if (!price && price !== 0) return t('courses:free');
    return currency === 'CNY' || currency === 'cny' 
      ? `¥${price.toFixed(2)}` 
      : `$${price.toFixed(2)}`;
  };

  // Handle option change if the prop is provided
  const handleOptionChange = (option: string) => {
    if (onOptionChange) {
      onOptionChange(option);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className={`relative hover:shadow-lg transition-shadow border-2 ${selectedOption === 'single' ? 'border-primary' : ''}`}>
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-xl font-semibold">{t('checkout:singlePurchase')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="text-3xl font-bold mb-2">{formatPrice(coursePrice)}</div>
            <p className="text-muted-foreground">{t('checkout:permanentAccess')}</p>
          </div>
          
          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{t('checkout:permanentAccess')} «{courseTitle}»</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{t('checkout:fullCourseContent')}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{t('checkout:homeworkAndExercises')}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{t('checkout:replayAnytime')}</span>
            </li>
          </ul>
          
          <Button 
            className="w-full"
            onClick={() => {
              if (onOptionChange) handleOptionChange('single');
              onSelectSingle();
            }}
            size="lg"
            variant={selectedOption === 'single' ? 'default' : 'outline'}
          >
            {t('checkout:buyNow')}
          </Button>
        </CardContent>
      </Card>
      
      <Card className={`relative hover:shadow-lg transition-shadow border-2 ${selectedOption === 'subscription' ? 'border-knowledge-primary' : 'border-knowledge-primary/30'}`}>
        <div className="absolute top-0 right-0 -translate-y-1/2 bg-knowledge-primary text-white py-1 px-4 rounded-full text-sm font-medium">
          {t('checkout:recommended')}
        </div>
        
        <CardHeader className="bg-knowledge-primary/10">
          <CardTitle className="text-xl font-semibold">{t('checkout:subscriptionPlan')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="text-3xl font-bold mb-2">
              {formatPrice(subscriptionPrice || coursePrice * 0.8)}
              <span className="text-sm font-normal text-muted-foreground ml-1">/ {t('dates:months')}</span>
            </div>
            <p className="text-muted-foreground">{t('checkout:flexibleSubscription')}</p>
          </div>
          
          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-knowledge-primary mt-0.5 flex-shrink-0" />
              <span>{t('checkout:accessAllCourses')}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-knowledge-primary mt-0.5 flex-shrink-0" />
              <span>{t('checkout:earlyAccessNewCourses')}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-knowledge-primary mt-0.5 flex-shrink-0" />
              <span>{t('checkout:exclusiveLearnCommunity')}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-knowledge-primary mt-0.5 flex-shrink-0" />
              <span>{t('checkout:quarterlyYearlyDiscounts')}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-knowledge-primary mt-0.5 flex-shrink-0" />
              <span>{t('checkout:cancelAnytime')}</span>
            </li>
          </ul>
          
          <Button 
            variant="default"
            className="w-full bg-knowledge-primary hover:bg-knowledge-primary/90"
            onClick={() => {
              if (onOptionChange) handleOptionChange('subscription');
              onSelectSubscription();
            }}
            size="lg"
          >
            {t('checkout:chooseSubscription')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
