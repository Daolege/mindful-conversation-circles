
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, RefreshCw } from "lucide-react"
import { Order } from "@/lib/types/order"
import { memo, useState } from "react"
import { DateRange } from "react-day-picker"
import { Link } from "react-router-dom"
import { OrderFilterBar } from "./order/OrderFilterBar"
import { OrderItem } from "./order/OrderItem"
import { EmptyOrderState } from "./order/EmptyOrderState"
import { PaginatedContent } from "./common/PaginatedContent"
import { getOrderCourseTitle } from "@/lib/types/order"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

const ORDERS_PER_PAGE = 10;

export const OrderHistory = memo(({
  orders,
  statusFilter,
  onStatusFilterChange,
  showAll = false
}: {
  orders: Order[]
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  showAll?: boolean
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'failed':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'pending':
        return '处理中';
      case 'failed':
        return '失败';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };
  
  const getOrderType = (order: Order): string => {
    if (order.payment_type?.includes('subscription-')) {
      const subscriptionType = order.payment_type?.replace('subscription-', '');
      return subscriptionType === 'monthly' ? '月度订阅' :
        subscriptionType === 'quarterly' ? '季度订阅' :
        subscriptionType === 'yearly' ? '年度订阅' : '订阅服务';
    }
    return '单次购买';
  };

  const getOrderTypeBadgeVariant = (type: string): string => {
    if (type.includes('订阅')) {
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    }
    return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    
    if (orderTypeFilter !== 'all') {
      const isSubscription = order.payment_type?.includes('subscription-');
      if ((orderTypeFilter === 'subscription' && !isSubscription) ||
          (orderTypeFilter === 'single' && isSubscription)) {
        return false;
      }
    }

    if (dateRange?.from && dateRange?.to) {
      const orderDate = new Date(order.created_at);
      if (orderDate < dateRange.from || orderDate > dateRange.to) {
        return false;
      }
    }

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const courseTitle = getOrderCourseTitle(order).toLowerCase();
      const orderNumberMatch = order.order_number ? order.order_number.toLowerCase().includes(searchLower) : false;
      return orderNumberMatch || courseTitle.includes(searchLower);
    }

    return true;
  });

  const clearFilters = () => {
    setDateRange(undefined);
    setSearchQuery('');
    setOrderTypeFilter('all');
    onStatusFilterChange('all');
  };

  const hasActiveFilters = statusFilter !== "all" || 
    orderTypeFilter !== "all" || 
    searchQuery !== '' || 
    dateRange !== undefined;

  // Calculate pagination
  const totalOrders = filteredOrders.length;
  const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const displayOrders = filteredOrders.slice(startIndex, startIndex + ORDERS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-knowledge-primary" />
          订单记录 {orders.length > 0 ? `(${orders.length})` : ""}
        </CardTitle>
        <OrderFilterBar 
          dateRange={dateRange}
          setDateRange={setDateRange}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          orderTypeFilter={orderTypeFilter}
          setOrderTypeFilter={setOrderTypeFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </CardHeader>
      <CardContent>
        <OrderFilterBar 
          dateRange={dateRange}
          setDateRange={setDateRange}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          orderTypeFilter={orderTypeFilter}
          setOrderTypeFilter={setOrderTypeFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
        
        <TooltipProvider>
          {displayOrders.length > 0 ? (
            <PaginatedContent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            >
              <div className="space-y-4">
                {displayOrders.map((order) => (
                  <OrderItem 
                    key={order.id}
                    order={order}
                    getOrderType={getOrderType}
                    getStatusName={getStatusName}
                    getStatusBadgeVariant={getStatusBadgeVariant}
                    getOrderTypeBadgeVariant={getOrderTypeBadgeVariant}
                    getOrderCourseTitle={getOrderCourseTitle}
                  />
                ))}
              </div>
            </PaginatedContent>
          ) : (
            <EmptyOrderState 
              hasFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          )}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
});

OrderHistory.displayName = 'OrderHistory';
