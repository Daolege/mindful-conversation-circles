
import React from 'react';
import { Order } from '@/lib/types/order';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { CheckCircle, CreditCard, FileText } from 'lucide-react';
import Logo from '@/components/Logo';
import { siteConfig } from '@/config/site';
import { calculateSavings, getSavingsPercentage } from '@/lib/services/currencyService';

interface OrderReceiptProps {
  order: Order;
}

export const OrderReceipt = ({ order }: OrderReceiptProps) => {
  // Get course information
  const getCourseTitle = () => {
    if (!order.courses) return '课程已删除';
    
    if (Array.isArray(order.courses)) {
      return order.courses.length > 0 ? order.courses[0].title : '课程已删除';
    }
    
    return order.courses.title || '课程已删除';
  };

  // Get course description
  const getCourseDescription = () => {
    if (!order.courses) return '';
    
    if (Array.isArray(order.courses)) {
      return order.courses.length > 0 ? order.courses[0].description || '' : '';
    }
    
    return order.courses.description || '';
  };
  
  // Calculate savings amount
  const savingsAmount = calculateSavings(order);
  const savingsPercentage = getSavingsPercentage(order);
  const hasSavings = savingsAmount > 0;
  
  // Format credit card number if available (show only last 4 digits)
  const formatCardNumber = () => {
    if (!order.payment_method || !order.payment_method.includes('*')) {
      return null;
    }
    
    // If payment_method contains a card number with asterisks
    if (order.payment_method.match(/\*+\d{4}/)) {
      return order.payment_method;
    }
    
    return null;
  };
  
  // Get transaction ID for WeChat/Alipay payments
  const getTransactionId = () => {
    if (order.payment_type === 'wechat' || order.payment_type === 'alipay') {
      // This would ideally come from the order object
      // For now we'll use order ID as a fallback
      return order.id.substring(0, 16);
    }
    return null;
  };
  
  // Get payment method display name
  const getPaymentMethodName = () => {
    switch (order.payment_type) {
      case 'wechat': return '微信支付';
      case 'alipay': return '支付宝';
      case 'credit-card': return '信用卡';
      case 'paypal': return 'PayPal';
      case 'stripe': return 'Stripe';
      default: 
        if (order.payment_type?.includes('subscription')) return '订阅付款';
        return order.payment_method || '在线支付';
    }
  };
  
  return (
    <div className="bg-white rounded-lg max-w-4xl mx-auto print:w-full print:mx-0 print:p-0">
      <div className="flex justify-between items-start mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">支付凭证</h1>
          <p className="text-sm text-muted-foreground">Payment Receipt</p>
        </div>
        <div className="print:grayscale">
          <Logo showText={false} size="small" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
        <div>
          <h3 className="font-semibold mb-3">商家信息</h3>
          <div className="space-y-1 text-muted-foreground">
            <p className="text-foreground">{siteConfig.name}</p>
            <p>{siteConfig.creator}</p>
            <p>contact@example.com</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-3">客户信息</h3>
          <div className="space-y-1 text-muted-foreground">
            <p className="text-foreground">{order.profiles?.full_name || '未提供姓名'}</p>
            <p>{order.profiles?.email || '未提供邮箱'}</p>
            
            {/* Credit card billing address if available */}
            {order.payment_type === 'credit-card' && (
              <p className="mt-1 text-xs">账单地址: {order.billing_address || '未提供'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment method details */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <CreditCard className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium">支付方式: {getPaymentMethodName()}</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">支付时间</p>
            <p>{order.created_at ? format(new Date(order.created_at), 'yyyy-MM-dd HH:mm:ss') : '未知'}</p>
          </div>
          
          {formatCardNumber() && (
            <div>
              <p className="text-muted-foreground">卡号信息</p>
              <p>{formatCardNumber()}</p>
            </div>
          )}
          
          {getTransactionId() && (
            <div>
              <p className="text-muted-foreground">交易号</p>
              <p className="font-mono">{getTransactionId()}</p>
            </div>
          )}
          
          {order.payment_type?.includes('subscription') && (
            <div>
              <p className="text-muted-foreground">订阅周期</p>
              <p>{order.payment_type.replace('subscription-', '')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-semibold mb-4">购买详情</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">描述</th>
              <th className="text-center py-3 px-4">数量</th>
              <th className="text-right py-3 px-4">单价</th>
              <th className="text-right py-3 px-4">金额</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-4 px-4">
                <div>
                  <p className="font-medium">{getCourseTitle()}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{getCourseDescription()}</p>
                </div>
              </td>
              <td className="text-center py-4 px-4">1</td>
              <td className="text-right py-4 px-4">
                {order.original_amount 
                  ? formatCurrency(order.original_amount, order.currency)
                  : formatCurrency(order.amount || 0, order.currency)}
              </td>
              <td className="text-right py-4 px-4">
                {formatCurrency(order.amount || 0, order.currency)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="space-y-2 text-sm ml-auto w-full max-w-xs">
        {hasSavings && (
          <>
            <div className="flex justify-between">
              <span>原价</span>
              <span>{formatCurrency(order.original_amount || 0, order.currency)}</span>
            </div>
            <div className="flex justify-between text-green-600 font-medium">
              <span>节省金额 ({savingsPercentage}%)</span>
              <span>-{formatCurrency(savingsAmount, order.currency)}</span>
            </div>
          </>
        )}
        
        <div className="flex justify-between border-t pt-2 mt-2 text-base font-medium">
          <span>实付金额</span>
          <span>{formatCurrency(order.amount || 0, order.currency)}</span>
        </div>

        {order.exchange_rate && order.currency === 'cny' && (
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-gray-50 rounded">
            <p>汇率: 1 USD = {order.exchange_rate} CNY</p>
            <p>折合美元: ${(order.amount / (order.exchange_rate || 1)).toFixed(2)}</p>
          </div>
        )}
      </div>

      <div className="mt-12 pt-4 border-t text-sm text-center text-muted-foreground">
        {order.status === 'completed' ? (
          <div className="flex items-center justify-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <p>此订单已完成支付 - {format(new Date(order.updated_at || order.created_at), 'yyyy-MM-dd HH:mm:ss')}</p>
          </div>
        ) : (
          <p>订单状态：{
            order.status === 'pending' ? '待处理' :
            order.status === 'processing' ? '处理中' :
            order.status === 'failed' ? '支付失败' :
            order.status === 'cancelled' ? '已取消' :
            order.status
          }</p>
        )}
        
        <p className="mt-2 text-xs text-gray-400">本凭证作为支付证明，非正式发票</p>
      </div>

      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-receipt, .print-receipt * {
              visibility: visible;
            }
            .print-receipt {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .print-hide {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};
