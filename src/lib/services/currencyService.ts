import { formatCurrency } from "@/lib/utils";
import { Order } from "@/lib/types/order";

// Format amount with currency symbol
export const formatAmount = (amount: number | undefined, currency: string | undefined) => {
  if (amount === undefined) return '-';
  return formatCurrency(amount, currency || 'usd');
};

// Get display name for payment method
export const getPaymentMethodDisplay = (paymentType: string | undefined) => {
  if (!paymentType) return '未知支付方式';

  switch (paymentType) {
    case 'wechat':
      return '微信支付';
    case 'alipay':
      return '支付宝';
    case 'credit-card':
      return '信用卡';
    case 'paypal':
      return 'PayPal';
    case 'stripe':
      return 'Stripe';
    default:
      if (paymentType?.includes('subscription')) {
        return '订阅付款';
      }
      return paymentType;
  }
};

// Get exchange rate display string
export const getExchangeRateDisplay = (
  fromCurrency: string | undefined,
  toCurrency: string | undefined,
  rate: number | undefined
) => {
  if (!fromCurrency || !toCurrency || !rate) return '';
  
  return `汇率: 1 ${fromCurrency.toUpperCase()} = ${rate} ${toCurrency.toUpperCase()}`;
};

// Get actual payment amount considering original currency
export const getActualPaymentAmount = (order: Order) => {
  // If we have original currency and amount, use that
  if (order.original_currency && order.original_amount !== undefined) {
    return {
      amount: order.original_amount,
      currency: order.original_currency
    };
  }
  
  // Otherwise use the stored amount and currency
  return {
    amount: order.amount || 0,
    currency: order.currency || 'usd'
  };
};

// Calculate savings amount
export const calculateSavings = (order: Order) => {
  if (!order.original_amount || !order.amount) return 0;
  if (order.original_amount <= order.amount) return 0;
  
  return order.original_amount - order.amount;
};

// Get savings percentage
export const getSavingsPercentage = (order: Order) => {
  if (!order.original_amount || !order.amount || order.original_amount <= order.amount) return 0;
  
  return Math.round((order.original_amount - order.amount) / order.original_amount * 100);
};
