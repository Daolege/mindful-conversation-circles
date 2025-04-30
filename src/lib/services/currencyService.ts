
/**
 * Currency conversion and formatting services
 */

// Define supported currencies
export type SupportedCurrency = 'cny' | 'usd' | 'eur' | 'gbp' | 'jpy';

// Currency formatting with symbols
export function formatAmount(amount: number, currency: string): string {
  const normalizedCurrency = currency.toLowerCase();
  
  switch(normalizedCurrency) {
    case 'cny':
      return `¥${amount.toFixed(2)}`;
    case 'usd':
      return `$${amount.toFixed(2)}`;
    case 'eur':
      return `€${amount.toFixed(2)}`;
    case 'gbp':
      return `£${amount.toFixed(2)}`;
    case 'jpy':
      return `¥${amount.toFixed(0)}`;
    default:
      // Default to USD if currency not recognized
      return `$${amount.toFixed(2)}`;
  }
}

// Convert currency based on exchange rate
export function convertCurrency(
  amount: number, 
  fromCurrency: SupportedCurrency, 
  toCurrency: SupportedCurrency, 
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  if (fromCurrency === 'usd' && toCurrency === 'cny') {
    return amount * exchangeRate;
  }
  
  if (fromCurrency === 'cny' && toCurrency === 'usd') {
    return amount / exchangeRate;
  }
  
  return amount;
}

// Get default exchange rate (can be updated with real-time rates)
export function getDefaultExchangeRate(): number {
  return 7.2; // Default USD to CNY rate, should be replaced with real-time data
}

// Format pre-payment amount with appropriate currency symbol
export function formatPrePaymentAmount(amount: number, currency: string): string {
  return formatAmount(amount, currency);
}

// Get payment method display name
export function getPaymentMethodDisplay(paymentType?: string): string {
  if (!paymentType) return '未知支付方式';
  
  if (paymentType.includes('subscription-')) {
    return '订阅付款';
  }
  
  switch(paymentType.toLowerCase()) {
    case 'wechat':
      return '微信支付';
    case 'alipay':
      return '支付宝';
    case 'paypal':
      return 'PayPal';
    case 'stripe':
      return 'Stripe';
    case 'credit-card':
      return '信用卡';
    case 'google-pay':
      return 'Google Pay';
    case 'apple-pay':
      return 'Apple Pay';
    default:
      return paymentType;
  }
}

// Get exchange rate display text
export function getExchangeRateDisplay(
  fromCurrency?: string,
  toCurrency?: string,
  exchangeRate?: number
): string {
  if (!fromCurrency || !toCurrency || !exchangeRate) {
    return '';
  }
  
  return `汇率: 1 ${fromCurrency.toUpperCase()} = ${exchangeRate} ${toCurrency.toUpperCase()}`;
}

// Get actual payment amount and currency based on order information
export function getActualPaymentAmount(order: any): { amount: number; currency: string } {
  if (!order) {
    return { amount: 0, currency: 'usd' };
  }
  
  // Use total_amount if available, otherwise fall back to amount
  const amount = order.total_amount || order.amount || 0;
  const currency = order.currency || 'usd';
  
  return { 
    amount,
    currency
  };
}
