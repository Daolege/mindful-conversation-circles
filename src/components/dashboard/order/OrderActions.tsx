
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Order } from '@/lib/types/order';
import { updateOrderStatus } from '@/lib/services/orderService';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import { deleteOrder } from '@/lib/services/orderUpdateService';
import { useNavigate } from 'react-router-dom';

interface OrderActionsProps {
  order: Order;
  onOrderUpdated?: () => void;
}

export const OrderActions = ({ order, onOrderUpdated }: OrderActionsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const result = await updateOrderStatus(order.id, newStatus);
      if (result.success) {
        toast.success(`订单状态已更新为 ${newStatus}`);
        if (onOrderUpdated) onOrderUpdated();
      } else {
        toast.error('更新订单状态失败');
        console.error('Error updating order status:', result.error);
      }
    } catch (err) {
      toast.error('更新订单状态时发生错误');
      console.error('Error in status update:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOrder = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteOrder(order.id);
      if (result.success) {
        toast.success('订单已成功删除');
        // Navigate back to the orders list
        navigate('/dashboard?tab=orders');
      } else {
        toast.error('删除订单失败');
        console.error('Error deleting order:', result.error);
      }
    } catch (err) {
      toast.error('删除订单时发生错误');
      console.error('Error in order deletion:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        {order.status === 'pending' && (
          <Button 
            disabled={isUpdating} 
            variant="outline" 
            className="w-full justify-start" 
            onClick={() => handleStatusUpdate('completed')}
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            标记为已完成
          </Button>
        )}
        
        {order.status === 'pending' && (
          <Button 
            disabled={isUpdating} 
            variant="outline" 
            className="w-full justify-start" 
            onClick={() => handleStatusUpdate('cancelled')}
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            取消此订单
          </Button>
        )}
        
        {/* Delete Order Button with Confirmation Dialog */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="w-full justify-start mt-4" 
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              删除订单
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除订单</AlertDialogTitle>
              <AlertDialogDescription>
                此操作不可逆，删除后订单将永久消失，所有相关订单项目也将被删除。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteOrder}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                确认删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
