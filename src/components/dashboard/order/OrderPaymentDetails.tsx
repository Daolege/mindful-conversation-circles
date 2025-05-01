
import { Order } from '@/lib/types/order';
import { format } from 'date-fns';
import { CreditCard, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  formatAmount,
  getPaymentMethodDisplay,
  getExchangeRateDisplay,
  getActualPaymentAmount
} from '@/lib/services/currencyService';
import { useTranslations } from '@/hooks/useTranslations';

interface OrderPaymentDetailsProps {
  order: Order;
}

export const OrderPaymentDetails = ({ order }: OrderPaymentDetailsProps) => {
  const { t } = useTranslations();
  
  // 处理支付方式图标
  const getPaymentMethodIcon = () => {
    switch(order.payment_type) {
      case 'wechat':
        return '/lovable-uploads/8793137a-dcfb-409f-a3de-f330a902b9d2.png';  // 微信图标
      case 'alipay':
        return '/lovable-uploads/a185f0d9-1675-40b6-8d74-c0901ba42ca4.png';  // 支付宝图标
      case 'paypal':
        return '/lovable-uploads/6452670c-8710-4177-8456-3936eea64c1d.png';  // PayPal图标
      case 'stripe':
        return '/lovable-uploads/c2529a3e-ae24-4a84-8d08-21731ee81c2e.png';  // Stripe图标
      default:
        return '/lovable-uploads/37420a04-9adf-4a1d-b4d7-b70977391c53.png';  // 默认信用卡图标
    }
  };

  // 格式化支付方式名称
  const getPaymentMethodName = () => {
    if (order.payment_type?.includes('subscription-')) {
      return t('orders:typeSubscription');
    }
    
    return getPaymentMethodDisplay(order.payment_type, t);
  };

  // 获取实际支付的金额和币种
  const { amount: displayAmount, currency: displayCurrency } = getActualPaymentAmount(order);
  
  const hasExchangeRate = order.exchange_rate && order.exchange_rate !== 1 && 
                          order.original_currency && order.original_currency !== order.currency;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
          {order.payment_type?.startsWith('subscription') ? (
            <CreditCard className="h-5 w-5 text-gray-600" />
          ) : (
            <img 
              src={getPaymentMethodIcon()} 
              alt={getPaymentMethodName()}
              className="h-6 w-6 object-contain"
            />
          )}
        </div>
        <div>
          <h3 className="font-medium">{getPaymentMethodName()}</h3>
          <p className="text-sm text-muted-foreground">
            {order.created_at && format(new Date(order.created_at), 'yyyy-MM-dd HH:mm:ss')}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">{t('orders:transactionStatus')}</p>
            <div className="mt-1">
              <Badge variant={order.status === 'completed' ? 'success' : 
                          order.status === 'pending' ? 'warning' : 
                          'destructive'}>
                {t(`orders:status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`)}
              </Badge>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">{t('orders:orderNumber')}</p>
            <p className="font-medium">{order.order_number || order.id}</p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <h3 className="font-medium">{t('orders:paymentDetails')}</h3>
          
          <div className="flex justify-between items-center font-medium">
            <span>{t('orders:paymentAmount')}</span>
            <span>{formatAmount(displayAmount, displayCurrency)}</span>
          </div>
          
          {hasExchangeRate && (
            <div className="text-xs text-muted-foreground mt-2 p-2 bg-gray-100 rounded">
              <p>{getExchangeRateDisplay(
                order.original_currency,
                order.currency,
                order.exchange_rate
              )}</p>
              <p>{t('orders:originalAmount')}: {formatAmount(order.original_amount, order.original_currency)}</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {order.is_paid || order.status === 'completed' ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm">
            {order.is_paid || order.status === 'completed' 
              ? t('orders:paymentCompleted')
              : order.status === 'pending'
                ? t('orders:paymentPending')
                : t('orders:paymentFailed')}
          </span>
        </div>
      </div>
    </div>
  );
};
