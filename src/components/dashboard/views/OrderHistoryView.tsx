
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserOrders } from "@/lib/services/orderService";
import { useAuth } from "@/contexts/authHooks";
import { OrderHistory } from "../OrderHistory";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function OrderHistoryView() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: ordersResponse, isLoading, error } = useQuery({
    queryKey: ['user-orders', user?.id, statusFilter],
    queryFn: async () => {
      if (!user?.id) return { data: [], error: null };
      try {
        return await getUserOrders(user.id);
      } catch (err) {
        console.error("Error fetching orders:", err);
        return { data: [], error: err };
      }
    },
    enabled: !!user?.id,
  });

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

  return (
    <OrderHistory
      orders={ordersResponse?.data || []}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      showAll={true}
    />
  );
}
