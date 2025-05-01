import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserOrders, generateMockOrder } from "@/lib/services/orderService";
import { useAuth } from "@/contexts/authHooks";
import { OrderHistory } from "../OrderHistory";
import { Loader2, Plus, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function OrderHistoryView() {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const queryClient = useQueryClient();
  
  const { 
    data: ordersResponse, 
    isLoading, 
    error, 
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['user-orders', user?.id, filterStatus],
    queryFn: async () => {
      if (!user?.id) return { data: [], error: null };
      try {
        return await getUserOrders(user.id, filterStatus);
      } catch (err) {
        console.error("Error fetching orders:", err);
        return { data: [], error: err };
      }
    },
    enabled: !!user?.id,
  });

  const handleGenerateData = async () => {
    if (!user?.id || isGeneratingData) return;
    
    setIsGeneratingData(true);
    try {
      // 生成状态随机的订单
      const statuses = ['completed', 'processing', 'cancelled'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      const result = await generateMockOrder(user.id, randomStatus);
      
      if (result.success) {
        toast.success("示例订单已生成", {
          description: "订单记录已添加到您的账户"
        });
        
        // 使用 invalidateQueries 来刷新订单数据
        await queryClient.invalidateQueries({
          queryKey: ['user-orders', user.id]
        });
        
        // 手动触发重新加载当前筛选状态的数据
        refetch();
      } else {
        toast.error("生成示例订单失败", {
          description: "请稍后再试"
        });
      }
    } catch (err) {
      console.error("Error generating mock order:", err);
      toast.error("生成示例数据时发生错误");
    } finally {
      setIsGeneratingData(false);
    }
  };
  
  // 手动刷新订单列表
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-knowledge-primary" />
      </div>
    );
  }

  const orders = ordersResponse?.data || [];

  return (
    <div className="space-y-6">
      {orders.length === 0 ? (
        <div className="bg-muted/50 border rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">暂无订单记录</h3>
          <p className="text-muted-foreground mb-6">您还没有任何订单记录</p>
          
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center max-w-md">
              <Select
                value={timeFilter}
                onValueChange={setTimeFilter}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择时间范围" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有时间</SelectItem>
                  <SelectItem value="month">最近一个月</SelectItem>
                  <SelectItem value="year">最近一年</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleGenerateData} 
                disabled={isGeneratingData}
                className="w-full sm:w-auto inline-flex items-center"
              >
                {isGeneratingData ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                添加示例数据
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mt-2">
              添加示例数据后可查看订单功能
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="筛选订单状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="processing">处理中</SelectItem>
                <SelectItem value="refunded">已退款</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex flex-row items-center gap-2">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="icon" 
                className="h-9 w-9"
                disabled={isFetching}
              >
                <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                <span className="sr-only">刷新</span>
              </Button>
              
              <Button 
                onClick={handleGenerateData} 
                variant="outline" 
                size="sm" 
                disabled={isGeneratingData}
                className="h-9"
              >
                {isGeneratingData ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                添加更多示例
              </Button>
            </div>
          </div>
          
          <OrderHistory
            orders={orders}
            statusFilter={filterStatus}
            onStatusFilterChange={setFilterStatus}
            showAll={true}
          />
        </div>
      )}
    </div>
  );
}
