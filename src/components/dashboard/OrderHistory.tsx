
import { useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { OrderItem } from "@/types/dashboard";
import { Button } from "../ui/button";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const orderStatusMap: Record<string, { label: string; className: string }> = {
  completed: { label: "已完成", className: "bg-green-500 hover:bg-green-600" },
  processing: { label: "处理中", className: "bg-yellow-500 hover:bg-yellow-600" },
  cancelled: { label: "已取消", className: "bg-gray-500 hover:bg-gray-600" },
  failed: { label: "失败", className: "bg-red-500 hover:bg-red-600" },
  refunded: { label: "已退款", className: "bg-blue-500 hover:bg-blue-600" },
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
  
  const getStatusBadge = useCallback((status: string) => {
    const statusInfo = orderStatusMap[status] || { label: status, className: "bg-gray-500 hover:bg-gray-600" };
    
    return (
      <Badge className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  }, []);

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
        .map(item => item.courses?.title || '未知课程')
        .join(", ");
    }
    
    // If no course items found, return order ID
    return `订单 ${order.id.substring(0, 8)}`;
  };
  
  // Function to get appropriate amount field from order
  const getOrderAmount = (order: OrderItem) => {
    // Use total_amount if available, otherwise fall back to amount
    return order.total_amount !== undefined ? order.total_amount : order.amount;
  };
  
  // Function to get payment method consistently
  const getPaymentMethod = (order: OrderItem) => {
    // Return payment_method if available, otherwise fall back to payment_type
    return order.payment_method || order.payment_type || '未知';
  };

  // Handle view order details
  const handleViewOrderDetails = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <div>
      {/* Removed "全部" button and related container div */}

      {orders.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">订单号</TableHead>
                <TableHead>商品</TableHead>
                <TableHead className="w-[100px]">金额</TableHead>
                <TableHead className="w-[120px]">支付方式</TableHead>
                <TableHead className="w-[100px]">状态</TableHead>
                <TableHead className="w-[180px]">下单时间</TableHead>
                <TableHead className="w-[100px]">操作</TableHead>
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
                    {getPaymentMethod(order) === 'wechat' ? '微信支付' : 
                     getPaymentMethod(order) === 'alipay' ? '支付宝' : 
                     getPaymentMethod(order) === 'creditcard' ? '信用卡' : 
                     getPaymentMethod(order)}
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
                      查看详情
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground">暂无订单记录</p>
        </div>
      )}
    </div>
  );
}
