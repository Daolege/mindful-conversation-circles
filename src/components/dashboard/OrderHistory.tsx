
import { useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { OrderItem } from "@/types/dashboard";

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
    if (!order.order_items || order.order_items.length === 0) {
      return "无商品信息";
    }
    
    return order.order_items.map(item => item.courses?.title || '未知课程').join(", ");
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            className={`px-4 py-2 rounded-md ${statusFilter === 'all' ? 'bg-knowledge-primary text-white' : 'bg-gray-100'}`}
            onClick={() => onStatusFilterChange('all')}
          >
            全部
          </button>
          {Object.keys(orderStatusMap).map(status => (
            <button
              key={status}
              className={`px-4 py-2 rounded-md ${statusFilter === status ? 'bg-knowledge-primary text-white' : 'bg-gray-100'}`}
              onClick={() => onStatusFilterChange(status)}
            >
              {orderStatusMap[status].label}
            </button>
          ))}
        </div>
      </div>

      {orders.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">订单号</TableHead>
                <TableHead>商品</TableHead>
                <TableHead className="w-[100px]">金额</TableHead>
                <TableHead className="w-[120px]">支付方式</TableHead>
                <TableHead className="w-[100px]">状态</TableHead>
                <TableHead className="w-[180px]">下单时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    {order.id.split('-')[0]}...
                  </TableCell>
                  <TableCell>
                    {getOrderItemsText(order)}
                  </TableCell>
                  <TableCell>
                    {order.total_amount} {order.currency.toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {order.payment_method === 'wechat' ? '微信支付' : 
                     order.payment_method === 'alipay' ? '支付宝' : 
                     order.payment_method === 'creditcard' ? '信用卡' : 
                     order.payment_method}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell>
                    {getFormattedDate(order.created_at)}
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
