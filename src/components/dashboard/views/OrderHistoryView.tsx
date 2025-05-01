
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserOrders } from "@/lib/services/orderService";
import { useAuth } from "@/contexts/authHooks";
import { OrderHistory } from "../OrderHistory";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export function OrderHistoryView() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: ordersResponse, isLoading } = useQuery({
    queryKey: ['user-orders', user?.id, statusFilter],
    queryFn: async () => {
      if (!user?.id) return { data: [], error: null };
      return await getUserOrders(user.id);
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-knowledge-primary" />
      </div>
    );
  }

  if (!ordersResponse?.data || ordersResponse.data.length === 0) {
    return (
      <OrderHistory
        orders={[]}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
    );
  }

  return (
    <OrderHistory
      orders={ordersResponse.data}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      showAll={true}
    />
  );
}
