
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserOrders } from "@/lib/services/orderService";
import { useAuth } from "@/contexts/authHooks";
import { OrderHistory } from "../OrderHistory";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { generateMockData } from "@/lib/services/mockDataService";
import { Button } from "@/components/ui/button";

export function OrderHistoryView() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  
  const { data: ordersResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['user-orders', user?.id, statusFilter],
    queryFn: async () => {
      if (!user?.id) return { data: [], error: null };
      try {
        return await getUserOrders(user.id, statusFilter);
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
      const result = await generateMockData(user.id);
      
      if (result.success) {
        toast.success("示例数据已生成", {
          description: "订单记录已添加到您的账户"
        });
        refetch();
      } else {
        toast.error("生成示例数据失败", {
          description: "请稍后再试"
        });
      }
    } catch (err) {
      console.error("Error generating mock data:", err);
      toast.error("生成示例数据时发生错误");
    } finally {
      setIsGeneratingData(false);
    }
  };

  if (error) {
    console.error("Error loading orders:", error);
    toast.error("加载订单记录失败", {
      description: "请稍后再试"
    });
  }

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
      {orders.length === 0 && (
        <div className="bg-muted/50 border rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">暂无订单记录</h3>
          <p className="text-muted-foreground mb-6">您还没有任何订单记录</p>
          
          <Button 
            onClick={handleGenerateData} 
            disabled={isGeneratingData}
            className="inline-flex items-center"
          >
            {isGeneratingData ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            添加示例数据
          </Button>
        </div>
      )}

      {orders.length > 0 && (
        <OrderHistory
          orders={orders}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          showAll={true}
        />
      )}
    </div>
  );
}
