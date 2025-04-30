
/**
 * Currency conversion and formatting services
 */

// Define supported currencies
export type SupportedCurrency = 'cny' | 'usd';

// Currency formatting with symbols
export function formatAmount(amount: number, currency: string): string {
  const normalizedCurrency = currency.toLowerCase();
  
  if (normalizedCurrency === 'cny') {
    return `¥${amount.toFixed(2)}`;
  } else if (normalizedCurrency === 'usd') {
    return `$${amount.toFixed(2)}`;
  } 
  
  // Default to USD if currency not recognized
  return `$${amount.toFixed(2)}`;
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
