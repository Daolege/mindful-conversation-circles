
import { Order } from '@/lib/types/order';
import { format, addMonths } from 'date-fns';
import { CalendarIcon, RefreshCcw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getActualPaymentAmount } from '@/lib/services/currencyService';

interface OrderSubscriptionDetailsProps {
  order: Order;
}

export const OrderSubscriptionDetails = ({ order }: OrderSubscriptionDetailsProps) => {
  // 处理订阅类型
  const getSubscriptionType = () => {
    if (!order.payment_type?.includes('subscription-')) {
      return null;
    }
    
    const subscriptionType = order.payment_type.replace('subscription-', '');
    
    switch (subscriptionType) {
      case 'monthly': return { name: '月度计划', interval: 1, unit: '月', period: '每月' };
      case 'quarterly': return { name: '季度计划', interval: 3, unit: '月', period: '每季度' };
      case 'yearly': return { name: '年度计划', interval: 12, unit: '月', period: '每年' };
      case '2years': return { name: '两年计划', interval: 24, unit: '月', period: '每两年' };
      case '3years': return { name: '三年计划', interval: 36, unit: '月', period: '每三年' };
      default: return { name: '订阅计划', interval: 1, unit: '期', period: '每期' };
    }
  };
  
  const subscriptionInfo = getSubscriptionType();
  
  if (!subscriptionInfo) {
    return (
      <div className="p-4 bg-amber-50 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <p>此订单不是订阅类型</p>
        </div>
      </div>
    );
  }
  
  // 计算下次续费日期
  const getNextBillingDate = () => {
    if (!order.created_at && !order.updated_at) return '未知';
    
    const startDate = order.updated_at ? new Date(order.updated_at) : new Date(order.created_at);
    const nextDate = addMonths(startDate, subscriptionInfo.interval);
    
    return format(nextDate, 'yyyy-MM-dd');
  };

  // 获取实际支付的金额和币种
  const { amount: displayAmount, currency: displayCurrency } = getActualPaymentAmount(order);
  
  // 格式化金额显示
  const formatDisplayAmount = (amount: number, currency: string) => {
    const symbol = currency.toLowerCase() === 'cny' ? '¥' : '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <RefreshCcw className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium">{subscriptionInfo.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              此订单是一个{subscriptionInfo.name}订阅，{subscriptionInfo.period}自动续费一次
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-muted-foreground">订阅周期</p>
          <p className="font-medium mt-1">{subscriptionInfo.interval} {subscriptionInfo.unit}</p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-muted-foreground">订阅费用</p>
          <p className="font-medium mt-1">
            {formatDisplayAmount(displayAmount, displayCurrency)}/{subscriptionInfo.period}
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-muted-foreground">订阅开始日</p>
          <div className="flex items-center gap-2 mt-1">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {order.created_at ? format(new Date(order.created_at), 'yyyy-MM-dd') : '未知'}
            </span>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-muted-foreground">下次扣款日</p>
          <div className="flex items-center gap-2 mt-1">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {getNextBillingDate()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-4 border border-dashed rounded-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <h4 className="font-medium">订阅状态: 活跃</h4>
              <p className="text-sm text-muted-foreground">您的订阅目前处于活跃状态</p>
            </div>
          </div>
          <Button asChild variant="outline" className="whitespace-nowrap">
            <Link to="/dashboard?tab=subscriptions">
              管理订阅
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
