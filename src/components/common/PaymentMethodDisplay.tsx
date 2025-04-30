
import { CreditCard } from "lucide-react";

interface PaymentMethodDisplayProps {
  paymentType: string;
  showIcon?: boolean;
  className?: string;
}

export const PaymentMethodDisplay = ({
  paymentType,
  showIcon = true,
  className = ""
}: PaymentMethodDisplayProps) => {
  // 获取支付方式图标URL
  const getPaymentMethodIcon = () => {
    if (paymentType?.includes('subscription-')) {
      return null;  // 订阅使用默认图标
    }
    
    switch (paymentType) {
      case 'wechat':
        return '/lovable-uploads/8793137a-dcfb-409f-a3de-f330a902b9d2.png';  // 微信图标
      case 'alipay':
        return '/lovable-uploads/a185f0d9-1675-40b6-8d74-c0901ba42ca4.png';  // 支付宝图标
      case 'paypal':
        return '/lovable-uploads/6452670c-8710-4177-8456-3936eea64c1d.png';  // PayPal图标
      case 'stripe':
        return '/lovable-uploads/c2529a3e-ae24-4a84-8d08-21731ee81c2e.png';  // Stripe图标
      case 'credit-card':
      case 'apple_pay':
      case 'google_pay':
        return '/lovable-uploads/37420a04-9adf-4a1d-b4d7-b70977391c53.png';  // 信用卡图标
      default:
        return null;
    }
  };

  // 格式化支付方式名称
  const getPaymentMethodName = () => {
    // 处理订阅类型
    if (paymentType?.includes('subscription-')) {
      const subscriptionType = paymentType.replace('subscription-', '');
      return subscriptionType === 'monthly' ? '月度订阅' : 
             subscriptionType === 'quarterly' ? '季度订阅' : 
             subscriptionType === 'yearly' ? '年度订阅' : 
             subscriptionType === '2years' ? '两年订阅' :
             subscriptionType === '3years' ? '三年订阅' :
             '订阅付款';
    }
    
    // 处理常规支付方式
    switch (paymentType) {
      case 'wechat': return '微信支付';
      case 'alipay': return '支付宝';
      case 'paypal': return 'PayPal';
      case 'stripe': return 'Stripe';
      case 'credit-card': return '信用卡';
      case 'apple_pay': return 'Apple Pay';
      case 'google_pay': return 'Google Pay';
      default: return paymentType || '未知支付方式';
    }
  };

  const iconUrl = getPaymentMethodIcon();
  const displayName = getPaymentMethodName();
  
  if (!showIcon) {
    return <span className={className}>{displayName}</span>;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {iconUrl ? (
        <img src={iconUrl} alt={displayName} className="h-4 w-4 object-contain" />
      ) : (
        <CreditCard className="h-4 w-4" />
      )}
      <span>{displayName}</span>
    </div>
  );
};
