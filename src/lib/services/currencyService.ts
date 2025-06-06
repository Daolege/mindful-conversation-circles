/**
 * Currency and payment utility functions
 */
import { Order } from '../types/order';
import { TFunction } from 'i18next';
import { ExchangeRate } from '../supabaseUtils';

/**
 * Format an amount with the correct currency symbol
 */
export const formatAmount = (amount?: number | string | null, currency?: string): string => {
  if (amount === undefined || amount === null) return '0.00';
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Default to CNY if no currency is provided
  const currencyCode = currency?.toUpperCase() || 'CNY';
  
  try {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currencyCode,
    }).format(numericAmount);
  } catch (e) {
    // Fallback if the currency is not supported
    return `${currencyCode} ${numericAmount.toFixed(2)}`;
  }
};

/**
 * Format the pre-payment amount (before checkout)
 */
export const formatPrePaymentAmount = (amount?: number): string => {
  if (amount === undefined || amount === null) {
    return '¥0.00';
  }
  
  return `¥${amount.toFixed(2)}`;
};

/**
 * Calculate the savings amount (discount)
 */
export const calculateSavings = (order: Order): number => {
  // If there is an original amount and a (lower) final amount
  if (order.original_amount && order.amount && order.amount < order.original_amount) {
    return order.original_amount - order.amount;
  }
  
  // No savings
  return 0;
};

/**
 * Get the savings percentage
 */
export const getSavingsPercentage = (order: Order): number => {
  if (order.original_amount && order.amount && order.amount < order.original_amount) {
    return Math.round(((order.original_amount - order.amount) / order.original_amount) * 100);
  }
  
  return 0;
};

/**
 * Get the payment method display text
 */
export const getPaymentMethodDisplay = (paymentMethod?: string, t?: TFunction): string => {
  if (!paymentMethod) return t ? t('orders:unknown') : '未知';
  
  switch(paymentMethod.toLowerCase()) {
    case 'wechat':
      return t ? t('orders:wechatPay') : '微信支付';
    case 'alipay':
      return t ? t('orders:alipay') : '支付宝';
    case 'creditcard':
    case 'credit_card':
      return t ? t('orders:creditCard') : '信用卡';
    case 'stripe':
      return 'Stripe';
    case 'paypal':
      return 'PayPal';
    default:
      if (paymentMethod.startsWith('subscription')) {
        return t ? t('orders:typeSubscription') : '订阅服务';
      }
      return paymentMethod;
  }
};

/**
 * Format the exchange rate display
 */
export const getExchangeRateDisplay = (
  fromCurrency?: string,
  toCurrency?: string,
  exchangeRate?: number
): string => {
  if (!fromCurrency || !toCurrency || !exchangeRate) {
    return '';
  }
  
  return `${fromCurrency.toUpperCase()} → ${toCurrency.toUpperCase()} (${exchangeRate})`;
};

/**
 * Get the actual payment amount to display
 */
export const getActualPaymentAmount = (order: Order): { amount: number, currency: string } => {
  // Default values
  const defaultCurrency = order.currency || 'CNY';
  
  // If we have amount and currency, use them
  if (order.amount !== undefined && order.amount !== null) {
    return {
      amount: order.amount,
      currency: defaultCurrency
    };
  }
  
  // Otherwise, use total_amount if available
  if (order.total_amount !== undefined && order.total_amount !== null) {
    return {
      amount: order.total_amount,
      currency: defaultCurrency
    };
  }
  
  // Last resort
  return {
    amount: 0,
    currency: defaultCurrency
  };
};

/**
 * Default exchange rate function
 */
export const getDefaultExchangeRate = (): number => {
  return 7.23; // CNY to USD default exchange rate
};

/**
 * Convert currency function
 */
export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string, exchangeRate: number = 7.23): number => {
  if (fromCurrency.toLowerCase() === toCurrency.toLowerCase()) {
    return amount;
  }
  
  if (fromCurrency.toLowerCase() === 'cny' && toCurrency.toLowerCase() === 'usd') {
    return amount / exchangeRate;
  }
  
  if (fromCurrency.toLowerCase() === 'usd' && toCurrency.toLowerCase() === 'cny') {
    return amount * exchangeRate;
  }
  
  // Default case
  return amount;
};

/**
 * Get the latest exchange rate from a list of rates
 */
export const getLatestExchangeRate = (rates: ExchangeRate[] | undefined | null, fromCurrency: string = 'CNY', toCurrency: string = 'USD'): number => {
  if (!rates || rates.length === 0) {
    return getDefaultExchangeRate();
  }
  
  // Look for an exact match first
  const exactMatch = rates.find(
    rate => 
      rate.from_currency?.toLowerCase() === fromCurrency.toLowerCase() && 
      rate.to_currency?.toLowerCase() === toCurrency.toLowerCase()
  );
  
  if (exactMatch) {
    return exactMatch.rate;
  }
  
  // For backwards compatibility, check for CNY to USD using the legacy field
  if (fromCurrency.toLowerCase() === 'cny' && toCurrency.toLowerCase() === 'usd') {
    const legacyMatch = rates.find(rate => rate.cny_to_usd !== undefined);
    if (legacyMatch && legacyMatch.cny_to_usd) {
      return legacyMatch.cny_to_usd;
    }
  }
  
  // If no exact match, check for reverse match
  const reverseMatch = rates.find(
    rate => 
      rate.from_currency?.toLowerCase() === toCurrency.toLowerCase() && 
      rate.to_currency?.toLowerCase() === fromCurrency.toLowerCase()
  );
  
  if (reverseMatch) {
    return 1 / reverseMatch.rate; // Invert the rate for reverse conversion
  }
  
  // Return default if no match found
  return getDefaultExchangeRate();
};

/**
 * Format exchange rate value with fixed decimal places
 */
export const formatExchangeRate = (rate?: number): string => {
  if (rate === undefined || rate === null) {
    return '0.00';
  }
  
  // Format with up to 4 decimal places, but trim trailing zeros
  return rate.toFixed(4).replace(/\.?0+$/, '');
};

/**
 * Get the currency pair display in readable format
 */
export const getCurrencyPairDisplay = (fromCurrency?: string, toCurrency?: string): string => {
  if (!fromCurrency || !toCurrency) {
    return '';
  }
  
  return `${fromCurrency.toUpperCase()}/${toCurrency.toUpperCase()}`;
};
