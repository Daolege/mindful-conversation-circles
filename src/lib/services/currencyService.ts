/**
 * Currency Service
 * Provides utility functions for working with currencies, formatting amounts, and exchange rates
 */

import { Order } from '@/lib/types/order';

/**
 * Format a monetary amount with the appropriate currency symbol
 */
export const formatAmount = (amount: number | string | undefined, currency: string = 'cny'): string => {
  if (amount === undefined || amount === null) {
    return '0.00';
  }
  
  // Convert to number if string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Format the number according to currency
  const currencyLower = (currency || 'cny').toLowerCase();
  
  switch (currencyLower) {
    case 'usd':
      return `$${numAmount.toFixed(2)}`;
    case 'eur':
      return `€${numAmount.toFixed(2)}`;
    case 'gbp':
      return `£${numAmount.toFixed(2)}`;
    case 'jpy':
      return `¥${Math.round(numAmount)}`;
    case 'cny':
    case 'rmb':
      return `¥${numAmount.toFixed(2)}`;
    default:
      return `${numAmount.toFixed(2)} ${currencyLower.toUpperCase()}`;
  }
};

/**
 * Format pre-payment amount (for display before payment)
 */
export const formatPrePaymentAmount = (amount: number, currency: string = 'cny'): string => {
  return formatAmount(amount, currency);
};

/**
 * Get display text for exchange rate
 */
export const getExchangeRateDisplay = (
  originalCurrency?: string,
  targetCurrency?: string,
  rate?: number
): string => {
  if (!originalCurrency || !targetCurrency || !rate) {
    return '';
  }
  
  return `${originalCurrency.toUpperCase()} → ${targetCurrency.toUpperCase()} @ ${rate.toFixed(4)}`;
};

/**
 * Get the payment method display text
 */
export const getPaymentMethodDisplay = (method?: string): string => {
  if (!method) return '未知支付方式';
  
  const methodLower = method.toLowerCase();
  
  switch (methodLower) {
    case 'wechat':
    case 'wechatpay':
      return '微信支付';
    case 'alipay':
      return '支付宝';
    case 'creditcard':
    case 'credit_card':
    case 'credit-card':
      return '信用卡';
    case 'paypal':
      return 'PayPal';
    case 'stripe':
      return 'Stripe';
    case 'bank_transfer':
    case 'bank-transfer':
      return '银行转账';
    default:
      if (methodLower.startsWith('subscription')) {
        return '订阅';
      }
      return method;
  }
};

/**
 * Get actual payment amount and currency from order
 */
export const getActualPaymentAmount = (order: Order): { amount: number; currency: string } => {
  if (!order) {
    return { amount: 0, currency: 'cny' };
  }
  
  // If there's an original amount and currency (pre-conversion), use that
  if (order.original_amount !== undefined && order.original_currency) {
    return { 
      amount: order.original_amount, 
      currency: order.original_currency 
    };
  }
  
  // Otherwise use the order amount and currency
  return { 
    amount: order.amount || order.total_amount || 0, 
    currency: order.currency || 'cny' 
  };
};
