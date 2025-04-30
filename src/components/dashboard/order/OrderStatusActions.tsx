
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { updateOrderStatus } from "@/lib/services/orderUpdateService";
import { ArrowRight, CheckCircle, RefreshCw } from "lucide-react";
import { useState } from "react";

interface OrderStatusActionsProps {
  orderId: string;
  currentStatus: string;
  onStatusUpdate?: () => void;
}

export const OrderStatusActions = ({ orderId, currentStatus, onStatusUpdate }: OrderStatusActionsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      console.log(`正在更新订单 ${orderId} 状态为 ${newStatus}`);
      
      const result = await updateOrderStatus(orderId, newStatus);
      
      if (result.success) {
        toast({
          title: "订单状态已更新",
          description: `订单状态已更新为${newStatus === 'completed' ? '已完成' : newStatus}`,
        });
        if (onStatusUpdate) {
          onStatusUpdate();
        }
      } else {
        throw new Error(result.error?.message || "更新失败");
      }
    } catch (error) {
      console.error("更新订单状态失败:", error);
      toast({
        variant: "destructive",
        title: "更新失败",
        description: "无法更新订单状态，请稍后重试",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (currentStatus === 'completed') {
    return (
      <Button variant="ghost" className="gap-2" disabled>
        <CheckCircle className="h-4 w-4 text-green-500" />
        订单已完成
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      {currentStatus === 'pending' && (
        <Button 
          variant="default"
          className="gap-2"
          onClick={() => handleUpdateStatus('completed')}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          标记为已完成
        </Button>
      )}
      {currentStatus === 'processing' && (
        <>
          <Button 
            variant="default"
            className="gap-2"
            onClick={() => handleUpdateStatus('completed')}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            完成订单
          </Button>
          <Button 
            variant="outline"
            className="gap-2"
            onClick={() => handleUpdateStatus('pending')}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            返回待处理
          </Button>
        </>
      )}
    </div>
  );
};
