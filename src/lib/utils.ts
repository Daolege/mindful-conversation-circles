
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price to display currency
export const formatPrice = (price: number, currency: string = 'usd', exchangeRate: number = 1) => {
  const amount = currency.toLowerCase() === 'usd' ? price : price * exchangeRate;
  const currencySymbol = currency.toLowerCase() === 'usd' ? '$' : '¥';
  
  return `${currencySymbol}${amount.toFixed(2)}`;
};

// Format currency with symbol based on currency code
export const formatCurrency = (amount: number, currency: string = 'usd') => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    console.warn('Invalid amount provided to formatCurrency:', amount);
    amount = 0;
  }

  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return formatter.format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    // 回退方案
    const symbol = currency.toLowerCase() === 'cny' ? '¥' : '$';
    return `${symbol}${amount.toFixed(2)}`;
  }
};

// 生成订单号
export function generateOrderNumber() {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `ORD${year}${month}${day}${random}`;
}

// 将美元转换为人民币
export function usdToCny(amountUsd: number, exchangeRate: number = 7.23): number {
  return amountUsd * exchangeRate;
}

// 将人民币转换为美元
export function cnyToUsd(amountCny: number, exchangeRate: number = 7.23): number {
  return amountCny / exchangeRate;
}
