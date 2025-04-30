
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  Loader2, 
  Download, 
  Eye, 
  RefreshCw,
  CalendarIcon,
  Plus,
  AlertCircle,
  MoreVertical,
  Check,
  X,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Order, 
  OrderStatus, 
  getOrderStatusLabel, 
  getOrderStatusVariant, 
  getOrderCourseTitle 
} from "@/lib/types/order";
import { getAllOrders, updateOrderStatus, insertSampleOrders } from "@/lib/services/orderService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const OrderManagement = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  const [isCreatingDemoData, setIsCreatingDemoData] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState<OrderStatus>("completed");

  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-orders", statusFilter, searchQuery, startDate, endDate, retryCount],
    queryFn: async () => {
      console.log("Fetching orders with filters:", { statusFilter, searchQuery, startDate, endDate });
      try {
        const result = await getAllOrders(statusFilter, searchQuery, startDate, endDate);
        if (result.error) {
          console.error("Error from getAllOrders:", result.error);
          throw result.error;
        }
        console.log("getAllOrders result:", result.data ? `${result.data.length} orders` : "No orders");
        return result.data || [];
      } catch (error) {
        console.error("Error in query function:", error);
        throw error;
      }
    },
    gcTime: 5 * 60 * 1000, // 5分钟
    staleTime: 30 * 1000, // 30秒内认为数据是新鲜的
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    retry: 3, // 增加重试次数
  });

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (!result.success) throw result.error;
      
      toast.success("订单状态已更新");
      refetch();
      setSelectedOrderId(null);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("更新订单状态失败");
    }
  };

  const handleExportCSV = () => {
    if (!orders || orders.length === 0) {
      toast.error("没有可导出的订单数据");
      return;
    }

    setIsExporting(true);

    try {
      const headers = ["订单号", "用户邮箱", "课程", "金额", "状态", "支付方式", "下单时间"];
      const csvRows = [headers];

      orders.forEach(order => {
        const row = [
          order.order_number || "",
          order.profiles?.email || "",
          getOrderCourseTitle(order),
          order.amount?.toString() || "",
          getOrderStatusLabel(order.status),
          order.payment_type || "",
          new Date(order.created_at).toLocaleString()
        ];
        csvRows.push(row);
      });

      const csvContent = csvRows.map(row => row.join(",")).join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `订单数据_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("订单数据导出成功");
    } catch (error) {
      console.error("Error exporting orders:", error);
      toast.error("导出订单数据失败");
    } finally {
      setIsExporting(false);
    }
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleRefresh = () => {
    setRetryCount(count => count + 1);
    toast.success("正在刷新订单数据");
  };

  const handleCreateDemoData = async () => {
    setIsCreatingDemoData(true);
    try {
      const result = await insertSampleOrders(10);
      if (result.success) {
        toast.success(result.message);
        setTimeout(() => {
          setRetryCount(count => count + 1);
        }, 500);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("创建测试数据失败");
      console.error(error);
    } finally {
      setIsCreatingDemoData(false);
    }
  };

  // 获取订单的访问状态
  const getAccessStatus = (order: Order) => {
    if (order.status === 'completed') {
      return <Badge variant="success" className="bg-green-100 text-green-800">已授权访问</Badge>;
    }
    return <Badge variant="outline" className="bg-gray-100 text-gray-800">未授权访问</Badge>;
  };

  // 批量导出选中订单
  const handleExportSelected = () => {
    // 实现批量导出功能
    toast.info("批量导出功能已触发");
  };

  // 显示订单状态更新确认对话框
  const openStatusUpdateDialog = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  // 用于更友好的错误处理
  const renderErrorContent = () => {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">订单管理</h2>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCreateDemoData}
              disabled={isCreatingDemoData}
              className="flex items-center gap-1"
            >
              {isCreatingDemoData ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  创建中...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  创建测试数据
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              刷新
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>获取订单数据失败</AlertTitle>
                <AlertDescription>
                  {errorMessage}
                </AlertDescription>
              </Alert>
              <p className="mb-4 text-muted-foreground">您可以尝试以下操作：</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  重新加载
                </Button>
                <Button variant="outline" onClick={handleCreateDemoData} disabled={isCreatingDemoData}>
                  {isCreatingDemoData ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      创建中...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      创建测试数据
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (error) {
    return renderErrorContent();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">订单管理</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCreateDemoData}
            disabled={isCreatingDemoData}
            className="flex items-center gap-1"
          >
            {isCreatingDemoData ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                创建中...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                创建测试数据
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            刷新
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportCSV}
            disabled={isExporting || !orders || orders.length === 0}
            className="flex items-center gap-1"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                导出中...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                导出CSV
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="搜索订单号或用户邮箱..."
                className="pl-10 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="订单状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部订单</SelectItem>
                    <SelectItem value="completed">支付成功</SelectItem>
                    <SelectItem value="pending">处理中</SelectItem>
                    <SelectItem value="failed">支付失败</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[130px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "yyyy-MM-dd") : "开始日期"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex items-center gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[130px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "yyyy-MM-dd") : "结束日期"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {(statusFilter !== "all" || searchQuery || startDate || endDate) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-1"
                >
                  清除筛选
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-knowledge-primary" />
            </div>
          ) : orders && orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>订单号</TableHead>
                  <TableHead>用户</TableHead>
                  <TableHead>课程</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>支付状态</TableHead>
                  <TableHead>课程访问</TableHead>
                  <TableHead>支付方式</TableHead>
                  <TableHead>订单时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.order_number}</TableCell>
                    <TableCell>{order.profiles?.email || "未知用户"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{getOrderCourseTitle(order)}</TableCell>
                    <TableCell>¥{order.amount}</TableCell>
                    <TableCell>
                      <Badge variant={getOrderStatusVariant(order.status)}>
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getAccessStatus(order)}
                    </TableCell>
                    <TableCell>{order.payment_type}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="z-50 bg-popover">
                          <DropdownMenuItem asChild>
                            <Link to={`/orders/${order.id}`} className="cursor-pointer flex items-center">
                              <Eye className="mr-2 h-4 w-4" />
                              查看详情
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openStatusUpdateDialog(order.id)}>
                            <Clock className="mr-2 h-4 w-4" />
                            更新状态
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">暂无订单数据</p>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCreateDemoData}
                  disabled={isCreatingDemoData}
                >
                  {isCreatingDemoData ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      创建中...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      创建测试数据
                    </>
                  )}
                </Button>
              </div>
              {(statusFilter !== "all" || searchQuery || startDate || endDate) && (
                <Button 
                  variant="link" 
                  onClick={clearFilters}
                  className="mt-2"
                >
                  清除筛选条件查看全部订单
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 订单状态更新对话框 */}
      <Dialog open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>更新订单状态</DialogTitle>
            <DialogDescription>
              请选择新的订单状态
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Select
              value={selectedNewStatus}
              onValueChange={(value) => setSelectedNewStatus(value as OrderStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择新状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    已完成
                  </div>
                </SelectItem>
                <SelectItem value="pending">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                    处理中
                  </div>
                </SelectItem>
                <SelectItem value="failed">
                  <div className="flex items-center">
                    <X className="mr-2 h-4 w-4 text-red-500" />
                    失败
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button 
              onClick={() => selectedOrderId && handleUpdateOrderStatus(selectedOrderId, selectedNewStatus)}
              variant="default"
            >
              确认更新
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
