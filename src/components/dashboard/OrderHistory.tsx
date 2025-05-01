
import { useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { OrderItem } from "@/types/dashboard";
import { Button } from "../ui/button";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslations } from "@/hooks/useTranslations";

const orderStatusMap: Record<string, { label: string; className: string }> = {
  completed: { label: "已完成", className: "bg-gray-700 text-white hover:bg-gray-800" },
  processing: { label: "处理中", className: "bg-gray-400 text-white hover:bg-gray-500" },
  pending: { label: "处理中", className: "bg-gray-400 text-white hover:bg-gray-500" },
  cancelled: { label: "已取消", className: "bg-gray-500 text-white hover:bg-gray-600" },
  failed: { label: "失败", className: "bg-gray-600 text-white hover:bg-gray-700" },
};

interface OrderHistoryProps {
  orders: OrderItem[];
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  showAll?: boolean;
}

export function OrderHistory({
  orders,
  statusFilter,
  onStatusFilterChange,
  showAll = false,
}: OrderHistoryProps) {
  const navigate = useNavigate();
  const { t } = useTranslations();
  
  const getStatusBadge = useCallback((status: string) => {
    const statusInfo = orderStatusMap[status] || { label: status, className: "bg-gray-500 text-white hover:bg-gray-600" };
    
    return (
      <Badge className={statusInfo.className}>
        {t(`orders:status${status.charAt(0).toUpperCase() + status.slice(1)}`)}
      </Badge>
    );
  }, [t]);

  const getFormattedDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'yyyy-MM-dd HH:mm:ss');
    } catch (e) {
      return dateStr;
    }
  };

  const getOrderItemsText = (order: OrderItem) => {
    if (order.order_items && order.order_items.length > 0) {
      return order.order_items
        .filter(item => item.courses)
        .map(item => item.courses?.title || t('courses:unknownCourse'))
        .join(", ");
    }
    
    // If no course items found, return order ID
    return `${t('orders:orderNumber')} ${order.id.substring(0, 8)}`;
  };
  
  // Function to get appropriate amount field from order
  const getOrderAmount = (order: OrderItem) => {
    // Use total_amount if available, otherwise fall back to amount
    return order.total_amount !== undefined ? order.total_amount : order.amount;
  };
  
  // Function to get payment method consistently
  const getPaymentMethod = (order: OrderItem) => {
    // Return payment_method if available, otherwise fall back to payment_type
    const paymentType = order.payment_method || order.payment_type || t('orders:unknown');
    
    if (paymentType === 'wechat') {
      return t('orders:wechatPay');
    } else if (paymentType === 'alipay') {
      return t('orders:alipay'); 
    } else if (paymentType === 'creditcard') {
      return t('orders:creditCard');
    }
    
    return paymentType;
  };

  // Handle view order details
  const handleViewOrderDetails = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <div>
      {orders.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">{t('orders:orderNumber')}</TableHead>
                <TableHead>{t('orders:product')}</TableHead>
                <TableHead className="w-[100px]">{t('orders:orderAmount')}</TableHead>
                <TableHead className="w-[120px]">{t('orders:paymentMethod')}</TableHead>
                <TableHead className="w-[100px]">{t('orders:orderStatus')}</TableHead>
                <TableHead className="w-[180px]">{t('orders:orderDate')}</TableHead>
                <TableHead className="w-[100px]">{t('orders:actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    {order.id}
                  </TableCell>
                  <TableCell>
                    {getOrderItemsText(order)}
                  </TableCell>
                  <TableCell>
                    {getOrderAmount(order)} {order.currency?.toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {getPaymentMethod(order)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell>
                    {getFormattedDate(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-24" 
                      onClick={() => handleViewOrderDetails(order.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {t('orders:viewDetails')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground">{t('orders:noOrders')}</p>
        </div>
      )}
    </div>
  );
}
