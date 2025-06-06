
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { PaymentMethod } from './PaymentMethodSelect';
import { formatAmount, convertCurrency } from '@/lib/services/currencyService';
import { useTranslations } from "@/hooks/useTranslations";

interface OrderSummaryProps {
  orderNumber?: string;
  orderDate?: string;
  originalPrice: number;
  discount: number;
  tax: number;
  total: number;
  onPayClick: () => void;
  loading?: boolean;
  isSubscription?: boolean;
  paymentMethod: PaymentMethod;
  exchangeRate: number;
  subscriptionPlanName?: string;
  currency: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  orderNumber = "ORD202504180868",
  orderDate = "2025-04-18",
  originalPrice,
  discount,
  tax,
  total,
  onPayClick,
  loading,
  isSubscription,
  paymentMethod,
  exchangeRate,
  subscriptionPlanName,
  currency = 'usd'
}) => {
  const navigate = useNavigate();
  const { t } = useTranslations();
  
  // 标准化货币为小写
  const normalizedCurrency = currency.toLowerCase();
  
  console.log("OrderSummary - 价格:", originalPrice, "币种:", normalizedCurrency, "支付方式:", paymentMethod);

  const handlePayClick = () => {
    if (paymentMethod === "paypal") {
      navigate('/payment-failed', {
        state: {
          errorDetails: {
            errorCode: 'PAYPAL_PROCESSING_ERROR',
            paymentMethod: paymentMethod,
            errorMessage: t('checkout:paymentFailed'),
            courseId: null
          }
        }
      });
      return;
    }

    onPayClick();
  };

  const getFormattedPrice = (amount: number) => {
    // 标准化支付方式为小写再判断
    const paymentMethodLower = paymentMethod.toLowerCase();
    const currencyLower = normalizedCurrency;
    
    if (paymentMethodLower === 'wechat' && currencyLower === 'usd') {
      return formatAmount(amount * exchangeRate, 'cny');
    }
    else if (paymentMethodLower !== 'wechat' && currencyLower === 'cny') {
      return formatAmount(amount / exchangeRate, 'usd');
    }
    return formatAmount(amount, normalizedCurrency);
  };

  const getPayDisplayAmount = () => {
    // 标准化支付方式为小写再判断
    const paymentMethodLower = paymentMethod.toLowerCase();
    const currencyLower = normalizedCurrency;
    
    const displayCurrency = paymentMethodLower === 'wechat' || paymentMethodLower === 'alipay' ? 'cny' : 'usd';
    let displayAmount = total;
    
    // 确保货币转换正确
    if (paymentMethodLower === 'wechat' || paymentMethodLower === 'alipay') {
      // 如果使用中国支付方式
      displayAmount = currencyLower === 'usd' ? total * exchangeRate : total;
    } else {
      // 如果使用国际支付方式
      displayAmount = currencyLower === 'cny' ? total / exchangeRate : total;
    }
    
    return formatAmount(displayAmount, displayCurrency);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">{t('checkout:orderSummary')}</h2>
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('checkout:orderNumber')}</span>
          <span>{orderNumber}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('checkout:orderDate')}</span>
          <span>{orderDate}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('checkout:originalPrice')}</span>
          <span>{getFormattedPrice(originalPrice)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-500">
            <span>{t('checkout:discount')}</span>
            <span>-{getFormattedPrice(discount)}</span>
          </div>
        )}
        {tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('checkout:tax')}</span>
            <span>{getFormattedPrice(tax)}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between font-semibold text-lg">
          <span>{t('checkout:total')}</span>
          <span>{getFormattedPrice(total)}</span>
        </div>
        
        {isSubscription && subscriptionPlanName && (
          <p className="text-sm text-gray-500 text-center">
            {subscriptionPlanName}{t('checkout:cancelAnytime')}
          </p>
        )}

        <div className="space-y-3">
          <Button 
            className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white h-12 text-base font-medium"
            onClick={handlePayClick}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('checkout:processing')}
              </>
            ) : (
              `${t('checkout:payNow')} ${getPayDisplayAmount()}`
            )}
          </Button>
        </div>

        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-center gap-4">
            <img src="/lovable-uploads/148b1149-2643-4e8c-b18a-658de84ead30.png" alt="Visa" className="h-6" />
            <img src="/lovable-uploads/6452670c-8710-4177-8456-3936eea64c1d.png" alt="Mastercard" className="h-6" />
            <img src="/lovable-uploads/c2529a3e-ae24-4a84-8d08-21731ee81c2e.png" alt="American Express" className="h-6" />
            <img src="/lovable-uploads/37420a04-9adf-4a1d-b4d7-b70977391c53.png" alt="Union Pay" className="h-6" />
          </div>
          
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span>{t('checkout:securePayment')}</span>
            <span>{t('checkout:encryptedProtection')}</span>
            <span>{t('checkout:customerSupport')}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OrderSummary;
