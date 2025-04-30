import { Order } from "@/lib/types/order";

/**
 * 货币服务 - 处理汇率和货币转换相关功能
 */

/**
 * 根据汇率将金额从一种货币转换为另一种货币
 */
export const convertCurrency = (
  amount: number,
  exchangeRate: number = 7.23,
  reverse: boolean = false
): number => {
  if (!amount || isNaN(amount)) return 0;
  const rate = exchangeRate > 0 ? exchangeRate : 7.23;
  return reverse ? amount / rate : amount * rate;
};

/**
 * 格式化金额显示，带有币种符号
 */
export const formatAmount = (amount: number, currency: string = 'usd'): string => {
  if (!amount || isNaN(amount)) return formatCurrencySymbol(currency) + '0.00';
  
  // 标准化货币为小写
  const currencyLower = currency?.toLowerCase() || 'usd';
  const formattedAmount = amount.toFixed(2);
  
  // 增加日志，帮助调试货币格式化问题
  console.log(`formatAmount: 格式化 ${amount} ${currency} 为 ${formatCurrencySymbol(currencyLower)}${formattedAmount}`);
  
  return formatCurrencySymbol(currencyLower) + formattedAmount;
};

/**
 * 获取货币符号
 */
export const formatCurrencySymbol = (currencyCode: string | undefined): string => {
  if (!currencyCode) return '$';
  
  // 标准化为小写后比较
  const currencyCodeLower = currencyCode.toLowerCase();
  switch (currencyCodeLower) {
    case 'cny':
    case 'rmb':
      return '¥';
    case 'usd':
      return '$';
    case 'eur':
      return '€';
    case 'gbp':
      return '£';
    default:
      console.log(`未知货币代码: ${currencyCode}，使用默认符号 $`);
      return '$';
  }
};

/**
 * 获取支付方式的显示名称
 */
export const getPaymentMethodDisplay = (paymentType: string | undefined): string => {
  if (!paymentType) return '未知支付方式';
  
  // 标准化为小写后检查订阅
  const paymentTypeLower = paymentType.toLowerCase();
  
  if (paymentTypeLower.includes('subscription')) return '订阅';
  
  switch (paymentTypeLower) {
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
    case 'apple_pay':
      return 'Apple Pay';
    case 'google_pay':
      return 'Google Pay';
    default:
      return paymentType;
  }
};

/**
 * 确定订单的显示货币
 * 微信和支付宝支付通常使用人民币，其他方式使用美元
 */
export const determineOrderCurrency = (paymentMethod: string | undefined): string => {
  if (!paymentMethod) return 'usd';
  
  // 标准化为小写进行比较
  const paymentMethodLower = paymentMethod.toLowerCase();
  return ['wechat', 'alipay'].includes(paymentMethodLower) ? 'cny' : 'usd';
};

/**
 * 格式化预支付金额显示
 */
export const formatPrePaymentAmount = (
  amount: number,
  originalCurrency: string | undefined,
  targetCurrency: string | undefined,
  exchangeRate: number
): string => {
  if (!amount || isNaN(amount)) return formatAmount(0, targetCurrency);
  
  // 标准化为小写进行比较
  const origCurrency = originalCurrency?.toLowerCase() || 'usd';
  const tgtCurrency = targetCurrency?.toLowerCase() || 'usd';
  
  // 当原始货币与目标货币不同时进行转换
  const shouldConvert = origCurrency !== tgtCurrency;
  const convertedAmount = shouldConvert ? convertCurrency(amount, exchangeRate) : amount;
  
  return formatAmount(convertedAmount, tgtCurrency);
};

/**
 * 获取汇率显示文本
 */
export const getExchangeRateDisplay = (
  fromCurrency: string | undefined,
  toCurrency: string | undefined,
  rate: number
): string => {
  if (!fromCurrency || !toCurrency || !rate) return '';
  
  // 汇率展示标准大写
  const from = (fromCurrency || '').toUpperCase();
  const to = (toCurrency || '').toUpperCase();
  return `1 ${from} = ${rate.toFixed(2)} ${to}`;
};

/**
 * 获取实际支付金额（考虑汇率转换）
 */
export const getActualPaymentAmount = (
  order: Order
): { amount: number, currency: string } => {
  if (!order) {
    console.log("getActualPaymentAmount: 收到空订单对象");
    return { amount: 0, currency: 'usd' };
  }

  try {
    // 标准化支付类型和币种为小写，处理 undefined/null 情况
    const paymentType = (order.payment_type || '').toLowerCase();
    
    // 确保我们始终有一个有效的货币代码，默认为 'usd'
    const orderCurrency = order.currency ? order.currency.toLowerCase() : 'usd';
    const originalCurrency = order.original_currency ? order.original_currency.toLowerCase() : orderCurrency;
    
    // 增加日志以便跟踪
    console.log(`getActualPaymentAmount: 处理订单 ${order.id}, 支付类型: ${paymentType}, 货币: ${orderCurrency}, 原始货币: ${originalCurrency}`);
    
    // 根据支付方式决定显示的币种
    const isChinaPayment = ['wechat', 'alipay'].includes(paymentType);
    const paymentCurrency = isChinaPayment ? 'cny' : orderCurrency;
    
    // 如果存在汇率转换和原始货币不同
    if (order.exchange_rate && order.exchange_rate !== 1 && 
        originalCurrency && originalCurrency !== orderCurrency) {
      
      console.log(`getActualPaymentAmount: 检测到汇率转换 - 汇率: ${order.exchange_rate}, 原始货币: ${originalCurrency}, 订单货币: ${orderCurrency}`);
      
      // 确保使用正确的金额和币种
      const amount = paymentCurrency === originalCurrency
        ? (order.original_amount || order.amount || 0) 
        : (order.amount || 0);
        
      console.log(`getActualPaymentAmount: 确定金额 ${amount} ${paymentCurrency}`);
      
      return { 
        amount: amount, 
        currency: paymentCurrency 
      };
    }
    
    // 无汇率转换或边界情况的处理
    console.log(`getActualPaymentAmount: 无汇率转换 - 使用金额 ${order.amount || 0} ${paymentCurrency}`);
    return { 
      amount: order.amount || 0, 
      currency: paymentCurrency 
    };
  } catch (error) {
    console.error('getActualPaymentAmount 处理错误:', error);
    return { 
      amount: order.amount || 0, 
      currency: order.currency || 'usd' 
    };
  }
};
