
/**
 * Formats an amount according to the specified currency
 * @param amount The amount to format
 * @param currency The currency code (default: CNY)
 * @returns Formatted amount string
 */
export const formatAmount = (amount: number, currency: string = 'CNY'): string => {
  if (typeof amount !== 'number') {
    console.warn('Invalid amount provided to formatAmount:', amount);
    return '0.00';
  }

  try {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency || 'CNY',
      minimumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${amount.toFixed(2)} ${currency}`;
  }
};

/**
 * Converts an amount from one currency to another using the exchange rate
 * @param amount The amount to convert
 * @param exchangeRate The exchange rate to apply
 * @returns Converted amount
 */
export const convertCurrency = (amount: number, exchangeRate: number): number => {
  if (typeof amount !== 'number' || typeof exchangeRate !== 'number') {
    console.warn('Invalid parameters for convertCurrency:', { amount, exchangeRate });
    return 0;
  }
  return amount * exchangeRate;
};
