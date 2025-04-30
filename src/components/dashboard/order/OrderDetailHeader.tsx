import { Badge } from "@/components/ui/badge";
import { Order } from "@/lib/types/order";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, AlertTriangle, Clock, ExternalLink, RefreshCw, XCircle } from "lucide-react";
import { format } from "date-fns";
import { OrderStatusActions } from "./OrderStatusActions";

interface OrderDetailHeaderProps {
  order: Order;
  onOrderUpdate?: () => void;
}

export const OrderDetailHeader = ({ order, onOrderUpdate }: OrderDetailHeaderProps) => {
  // 判断是否为订阅订单
  const isSubscription = order.payment_type?.includes('subscription-');
  const subscriptionType = isSubscription ? 
    order.payment_type?.replace('subscription-', '') : null;

  // 增强状态图标展示
  const getStatusIcon = () => {
    switch (order.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  // 增强状态展示样式
  const getStatusBadgeVariant = () => {
    switch (order.status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'cancelled':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // 获取状态文本
  const getStatusText = () => {
    switch (order.status) {
      case 'completed':
        return '已完成';
      case 'pending':
        return '待支付';
      case 'processing':
        return '处理中';
      case 'failed':
        return '支付失败';
      case 'cancelled':
        return '已取消';
      default:
        return order.status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">订单号:</span>
            <span className="text-sm font-medium">{order.order_number || order.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">下单时间:</span>
            <span className="text-sm font-medium">
              {format(new Date(order.created_at), 'yyyy-MM-dd HH:mm:ss')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">订单类型:</span>
            <span className="text-sm font-medium">
              {isSubscription ? 
                `订阅服务 (${subscriptionType === 'monthly' ? '月' : 
                  subscriptionType === 'quarterly' ? '季' : 
                  subscriptionType === 'yearly' ? '年' : 
                  subscriptionType === '2years' ? '两年' :
                  subscriptionType === '3years' ? '三年' :
                  subscriptionType})` : 
                '单次购买'}
            </span>
          </div>
          {order.profiles?.email && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">用户邮箱:</span>
              <span className="text-sm font-medium">{order.profiles.email}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">支付方式:</span>
            <span className="text-sm font-medium">
              {order.payment_type === 'wechat' ? '微信支付' :
              order.payment_type === 'alipay' ? '支付宝' :
              order.payment_type === 'paypal' ? 'PayPal' :
              order.payment_type === 'stripe' ? 'Stripe' :
              order.payment_type === 'credit-card' ? '信用卡' : 
              isSubscription ? '订阅付款' :
              order.payment_method || order.payment_type || '未知支付方式'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">支付货币:</span>
            <span className="text-sm font-medium">{order.currency?.toUpperCase() || 'USD'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">支付金额:</span>
            <span className="text-sm font-bold">
              {formatCurrency(order.total_amount || order.amount || 0, order.currency || 'USD')}
            </span>
          </div>
          {order.original_amount && order.original_amount !== (order.total_amount || order.amount) && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">原价:</span>
              <span className="text-sm line-through text-gray-500">
                {formatCurrency(order.original_amount, order.currency || 'USD')}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center border-t pt-4 mt-2">
        <span className="text-sm font-medium mr-2">支付状态:</span>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <Badge variant={getStatusBadgeVariant()}>
            {getStatusText()}
          </Badge>
          {order.status === 'processing' && (
            <span className="text-xs text-muted-foreground ml-2">
              正在等待支付确认...
            </span>
          )}
          <div className="ml-auto">
            <OrderStatusActions
              orderId={order.id}
              currentStatus={order.status}
              onStatusUpdate={onOrderUpdate}
            />
          </div>
        </div>
        {order.updated_at && (
          <span className="ml-auto text-xs text-muted-foreground">
            最近更新: {format(new Date(order.updated_at), 'yyyy-MM-dd HH:mm')}
          </span>
        )}
      </div>

      {isSubscription && (
        <div className="mt-2 bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start">
            <RefreshCw className="mr-2 h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium mb-2">订阅信息</h3>
              <p className="text-sm text-muted-foreground">
                您已订阅{subscriptionType === 'monthly' ? '月度' : 
                      subscriptionType === 'quarterly' ? '季度' : 
                      subscriptionType === 'yearly' ? '年度' : 
                      subscriptionType === '2years' ? '两年期' :
                      subscriptionType === '3years' ? '三年期' :
                      subscriptionType}计划。您可以在订阅期间无限制地访问所有课程内容。
              </p>
              <div className="mt-3 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">下次扣款时间:</span>
                  <span className="font-medium">
                    {order.updated_at ? format(new Date(new Date(order.updated_at).setMonth(new Date(order.updated_at).getMonth() + 
                      (subscriptionType === 'monthly' ? 1 : 
                       subscriptionType === 'quarterly' ? 3 : 
                       subscriptionType === 'yearly' ? 12 :
                       subscriptionType === '2years' ? 24 :
                       subscriptionType === '3years' ? 36 : 1))), 
                      'yyyy-MM-dd') : '未知'}
                  </span>
                </div>
                <div className="mt-2">
                  <a href="/dashboard?tab=subscriptions" className="text-blue-600 hover:underline flex items-center gap-0.5 text-sm">
                    查看订阅管理
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {order.refund_status && order.refund_status !== 'none' && (
        <div className="mt-2 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2 flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
            退款信息
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-muted-foreground">退款状态:</p>
              <Badge variant={
                order.refund_status === 'approved' || order.refund_status === 'processed' ? 'success' :
                order.refund_status === 'rejected' ? 'destructive' : 'warning'
              } className="mt-1">
                {order.refund_status === 'pending' ? '处理中' :
                 order.refund_status === 'approved' ? '已批准' :
                 order.refund_status === 'rejected' ? '已拒绝' : 
                 order.refund_status === 'processed' ? '已退款' : '未知'}
              </Badge>
            </div>
            {order.refund_reason && (
              <div>
                <p className="text-sm text-muted-foreground">退款原因:</p>
                <p className="text-sm mt-1">{order.refund_reason}</p>
              </div>
            )}
            {order.refund_applied_at && (
              <div>
                <p className="text-sm text-muted-foreground">申请时间:</p>
                <p className="text-sm mt-1">{format(new Date(order.refund_applied_at), 'yyyy-MM-dd HH:mm')}</p>
              </div>
            )}
            {order.refund_processed_at && (
              <div>
                <p className="text-sm text-muted-foreground">处理时间:</p>
                <p className="text-sm mt-1">{format(new Date(order.refund_processed_at), 'yyyy-MM-dd HH:mm')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {order.admin_notes && (
        <div className="mt-2 bg-amber-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">管理员备注</h3>
          <p className="text-sm text-muted-foreground">{order.admin_notes}</p>
        </div>
      )}
    </div>
  );
};
