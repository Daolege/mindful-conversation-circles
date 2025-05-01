
import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserOrders, generateMockOrder } from "@/lib/services/orderService";
import { useAuth } from "@/contexts/authHooks";
import { OrderHistory } from "../OrderHistory";
import { Loader2, Plus, RefreshCcw, Filter, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function OrderHistoryView() {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const queryClient = useQueryClient();
  
  const { 
    data: ordersResponse, 
    isLoading, 
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['user-orders', user?.id, filterStatus, timeFilter],
    queryFn: async () => {
      if (!user?.id) return { data: [], error: null };
      try {
        return await getUserOrders(user.id, filterStatus, timeFilter);
      } catch (err) {
        console.error("Error fetching orders:", err);
        return { data: [], error: err };
      }
    },
    enabled: !!user?.id,
  });

  const handleStatusFilterChange = (status: string) => {
    setFilterStatus(status);
  };

  const handleGenerateData = async () => {
    if (!user?.id || isGeneratingData) return;
    
    setIsGeneratingData(true);
    toast.loading('正在生成示例订单...', { id: 'generating-order' });
    
    try {
      // Generate random status order
      const statuses = ['completed', 'processing', 'cancelled'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      const result = await generateMockOrder(user.id, randomStatus);
      
      toast.dismiss('generating-order');
      
      if (result.success) {
        toast.success("示例订单已生成", {
          description: "订单记录已添加到您的账户",
          action: {
            label: '刷新',
            onClick: () => refetch()
          }
        });
        
        // Refresh order data
        await queryClient.invalidateQueries({
          queryKey: ['user-orders', user.id]
        });
        
        // Manually trigger reload with current filter
        refetch();
      } else {
        toast.error("生成示例订单失败", {
          description: "请稍后再试或联系管理员"
        });
        console.error("Failed to generate mock order:", result.error);
      }
    } catch (err) {
      toast.dismiss('generating-order');
      console.error("Error generating mock order:", err);
      toast.error("生成示例数据时发生错误", {
        description: err instanceof Error ? err.message : "未知错误"
      });
    } finally {
      setIsGeneratingData(false);
    }
  };
  
  // Manually refresh order list
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

  // Filter component shared between empty and populated views
  const FilterControls = () => (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center cursor-pointer select-none" onClick={() => document.getElementById('timeFilter')?.click()}>
          <Calendar className="h-4 w-4 text-muted-foreground mr-1.5" />
          <span className="text-sm text-muted-foreground mr-1">时间范围:</span>
        </div>
        
        <Select
          value={timeFilter}
          onValueChange={setTimeFilter}
        >
          <SelectTrigger 
            id="timeFilter"
            className="w-[140px] h-10 px-3 cursor-pointer"
          >
            <SelectValue placeholder="所有时间" />
          </SelectTrigger>
          <SelectContent className="bg-white/95 z-50">
            <SelectItem value="all">所有时间</SelectItem>
            <SelectItem value="3days">近三天</SelectItem>
            <SelectItem value="month">近一个月</SelectItem>
            <SelectItem value="halfyear">近半年</SelectItem>
            <SelectItem value="year">近一年</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center cursor-pointer select-none" onClick={() => document.getElementById('statusFilter')?.click()}>
          <Filter className="h-4 w-4 text-muted-foreground mr-1.5" />
          <span className="text-sm text-muted-foreground mr-1">订单状态:</span>
        </div>
        
        <Select
          value={filterStatus}
          onValueChange={handleStatusFilterChange}
        >
          <SelectTrigger 
            id="statusFilter"
            className="w-[140px] h-10 px-3 cursor-pointer"
          >
            <SelectValue placeholder="全部状态" />
          </SelectTrigger>
          <SelectContent className="bg-white/95 z-50">
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="processing">处理中</SelectItem>
            <SelectItem value="cancelled">已取消</SelectItem>
            <SelectItem value="failed">失败</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {orders.length === 0 ? (
        <div className="bg-muted/50 border rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">暂无订单记录</h3>
          <p className="text-muted-foreground mb-6">您还没有任何订单记录</p>
          
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center max-w-md">
              <FilterControls />
              
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <FilterControls />
            
            <div className="flex flex-row items-center gap-2">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="icon" 
                className="h-10 w-10"
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
                className="h-10"
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
            onStatusFilterChange={handleStatusFilterChange}
            showAll={true}
          />
        </div>
      )}
    </div>
  );
}
