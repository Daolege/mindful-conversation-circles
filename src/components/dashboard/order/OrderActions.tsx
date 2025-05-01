
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Order } from '@/lib/types/order';
import { setOrderStatus, deleteOrder } from '@/lib/services/orderUpdateService';
import { toast } from 'sonner';
import { FileText, Loader2, CreditCard, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaymentReceiptModal } from './PaymentReceiptModal';
import { useTranslations } from '@/hooks/useTranslations';

interface OrderActionsProps {
  order: Order;
  onOrderUpdated?: () => void;
}

export const OrderActions = ({ order, onOrderUpdated }: OrderActionsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslations();

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const result = await setOrderStatus(order.id, newStatus);
      if (result.success) {
        const statusText = newStatus === 'completed' ? 
          (currentLanguage === 'en' ? 'completed' : '已完成') : 
          (currentLanguage === 'en' ? newStatus : newStatus === 'cancelled' ? '已取消' : '处理中');
        
        toast.success(
          currentLanguage === 'en' 
            ? `Order status updated to ${statusText}` 
            : `订单状态已更新为 ${statusText}`
        );
        if (onOrderUpdated) onOrderUpdated();
      } else {
        toast.error(
          currentLanguage === 'en' 
            ? 'Failed to update order status' 
            : '更新订单状态失败'
        );
        console.error('Error updating order status:', result.error);
      }
    } catch (err) {
      toast.error(
        currentLanguage === 'en' 
          ? 'Error occurred while updating order status' 
          : '更新订单状态时发生错误'
      );
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
        toast.success(
          currentLanguage === 'en' 
            ? 'Order successfully deleted' 
            : '订单已成功删除'
        );
        // Navigate back to the orders list
        navigate('/dashboard?tab=orders');
      } else {
        toast.error(
          currentLanguage === 'en' 
            ? 'Failed to delete order' 
            : '删除订单失败'
        );
        console.error('Error deleting order:', result.error);
      }
    } catch (err) {
      toast.error(
        currentLanguage === 'en' 
          ? 'Error occurred while deleting order' 
          : '删除订单时发生错误'
      );
      console.error('Error in order deletion:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCompletePayment = () => {
    // 显示成功消息
    toast.success(
      currentLanguage === 'en' 
        ? 'Processing payment request...' 
        : '正在处理支付请求...'
    );
    
    // 在实际应用中，这里会重定向到支付网关
    // 为了演示，我们使用定时器模拟支付流程
    setTimeout(() => {
      handleStatusUpdate('completed');
    }, 1500);
  };

  // 检查订单状态确定按钮显示
  const isComplete = order.status === 'completed' || order.is_paid;
  const isPending = order.status === 'pending' || order.status === 'processing';
  const isCancellable = order.status !== 'completed' && order.status !== 'cancelled';
  const isAdminMarkable = isPending && order.payment_type === 'admin';

  const viewReceiptText = currentLanguage === 'en' ? 'View Payment Receipt' : '查看支付凭证';
  const completePaymentText = currentLanguage === 'en' ? 'Complete Payment' : '完成支付';
  const markCompletedText = currentLanguage === 'en' ? 'Mark as Completed' : '标记为已完成';
  const cancelOrderText = currentLanguage === 'en' ? 'Cancel Order' : '取消此订单';
  const deleteOrderText = currentLanguage === 'en' ? 'Delete Order' : '删除订单';
  const confirmDeleteText = currentLanguage === 'en' ? 'Confirm Delete' : '确认删除';
  const cancelText = currentLanguage === 'en' ? 'Cancel' : '取消';
  const confirmDeleteTitleText = currentLanguage === 'en' ? 'Confirm Order Deletion' : '确认删除订单';
  const confirmDeleteDescText = currentLanguage === 'en' 
    ? 'This action is irreversible. The order and all related order items will be permanently deleted.'
    : '此操作不可逆，删除后订单将永久消失，所有相关订单项目也将被删除。';

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        {isComplete && (
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={() => setReceiptModalOpen(true)}
          >
            <FileText className="mr-2 h-4 w-4" />
            {viewReceiptText}
          </Button>
        )}
        
        {/* 对于未完成的订单，显示"完成支付"按钮 */}
        {isPending && (
          <Button 
            variant="default" 
            className="w-full justify-start bg-green-600 hover:bg-green-700" 
            onClick={handleCompletePayment}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-4 w-4" />
            )}
            {completePaymentText}
          </Button>
        )}
        
        {/* 仅管理员可见，对已完成订单不显示"标记为已完成" */}
        {isAdminMarkable && (
          <Button 
            disabled={isUpdating} 
            variant="outline" 
            className="w-full justify-start" 
            onClick={() => handleStatusUpdate('completed')}
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {markCompletedText}
          </Button>
        )}
        
        {/* 仅对未完成和未取消的订单显示取消按钮 */}
        {isCancellable && (
          <Button 
            disabled={isUpdating} 
            variant="outline" 
            className="w-full justify-start" 
            onClick={() => handleStatusUpdate('cancelled')}
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {cancelOrderText}
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
              {deleteOrderText}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmDeleteTitleText}</AlertDialogTitle>
              <AlertDialogDescription>
                {confirmDeleteDescText}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{cancelText}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteOrder}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {confirmDeleteText}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      {/* Payment Receipt Modal */}
      <PaymentReceiptModal 
        order={order} 
        open={receiptModalOpen} 
        onOpenChange={setReceiptModalOpen} 
      />
    </div>
  );
};
