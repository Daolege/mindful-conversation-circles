
import { Order } from "@/lib/types/order"
import { Badge } from "@/components/ui/badge"
import { Eye, Clock, Check, X } from "lucide-react"
import { Link } from "react-router-dom"
import { format } from "date-fns"
import { 
  formatAmount, 
  formatPrePaymentAmount,
  getExchangeRateDisplay,
  getPaymentMethodDisplay,
  getActualPaymentAmount 
} from "@/lib/services/currencyService"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { useTranslations } from "@/hooks/useTranslations"

interface OrderItemProps {
  order: Order;
  getOrderType: (order: Order) => string;
  getStatusName: (status: string) => string;
  getStatusBadgeVariant: (status: string) => string;
  getOrderTypeBadgeVariant: (type: string) => string;
  getOrderCourseTitle: (order: Order) => string;
}

export const OrderItem = ({
  order,
  getOrderType,
  getStatusName,
  getStatusBadgeVariant,
  getOrderTypeBadgeVariant,
  getOrderCourseTitle,
}: OrderItemProps) => {
  const { t } = useTranslations();
  
  // 获取订单状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-3 w-3" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-3 w-3" />;
      case 'failed':
      case 'cancelled':
        return <X className="h-3 w-3" />;
      default:
        return null;
    }
  };
  
  // 确保order.id存在且为字符串格式
  const orderId = order?.id?.toString() || '';

  // 获取实际支付的金额和币种
  const { amount: displayAmount, currency: displayCurrency } = getActualPaymentAmount(order);
  
  const orderType = getOrderType(order);
  const hasExchangeRate = order.exchange_rate && order.exchange_rate !== 1 && 
                          order.original_currency && order.original_currency !== order.currency;
                          
  // 增强日志记录，更容易调试
  console.log(`OrderItem: 显示订单 ${order.id}, 金额: ${displayAmount}, 货币: ${displayCurrency}, 支付方式: ${order.payment_type}, 状态: ${order.status}, 用户: ${order.user_id}`);
  
  if (!order) {
    console.error('OrderItem: 接收到空订单对象');
    return null;
  }
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg hover:bg-gray-50/50 transition-colors">
      <div className="space-y-1 mb-3 sm:mb-0">
        <h4 className="font-medium">
          {getOrderCourseTitle(order)}
        </h4>
        <div className="flex items-center gap-2 flex-wrap">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={getStatusBadgeVariant(order.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
                  {t(`orders:status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`)}
                </span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('orders:orderStatus')}: {t(`orders:status${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`)}</p>
              <p className="text-xs text-muted-foreground">
                {t('common:lastUpdated')}: {order.updated_at ? format(new Date(order.updated_at), 'yyyy-MM-dd HH:mm') : t('common:unknown')}
              </p>
            </TooltipContent>
          </Tooltip>
          
          <Badge variant="outline" className={getOrderTypeBadgeVariant(orderType)}>
            {orderType === 'Single Purchase' ? t('orders:typeSingle') : 
             orderType === 'Subscription' ? t('orders:typeSubscription') : 
             orderType}
          </Badge>
          
          <Badge variant="outline">
            {getPaymentMethodDisplay(order.payment_type, t)}
          </Badge>
          
          <span className="text-sm text-muted-foreground">
            {order.created_at && format(new Date(order.created_at), 'yyyy-MM-dd')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">
            {formatAmount(displayAmount, displayCurrency)}
          </p>
          
          {hasExchangeRate && (
            <Tooltip>
              <TooltipTrigger>
                <span className="text-xs text-muted-foreground">
                  ({getExchangeRateDisplay(
                    order.original_currency,
                    order.currency,
                    order.exchange_rate
                  )})
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('orders:originalAmount')}: {formatAmount(order.original_amount, order.original_currency)}</p>
                <p>{t('orders:exchangeRate')}: {order.exchange_rate}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      <Link 
        to={`/orders/${order.id}`}
        className="inline-flex items-center justify-center gap-1 px-4 py-2 text-sm font-medium transition-colors border rounded-md shadow-sm hover:bg-accent hover:text-accent-foreground border-input bg-background"
      >
        <Eye className="h-4 w-4" />
        {t('orders:viewDetails')}
      </Link>
    </div>
  );
}
