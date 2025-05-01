
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
  const { t } = useTranslations();

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const result = await setOrderStatus(order.id, newStatus);
      if (result.success) {
        toast.success(t('orders:orderStatusUpdated', { status: t(`orders:status${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`) }));
        
        if (onOrderUpdated) onOrderUpdated();
      } else {
        toast.error(t('orders:failedToUpdateStatus'));
        console.error('Error updating order status:', result.error);
      }
    } catch (err) {
      toast.error(t('orders:errorUpdatingStatus'));
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
        toast.success(t('orders:orderDeleted'));
        // Navigate back to the orders list
        navigate('/dashboard?tab=orders');
      } else {
        toast.error(t('orders:deleteOrderFailed'));
        console.error('Error deleting order:', result.error);
      }
    } catch (err) {
      toast.error(t('orders:deleteOrderFailed'));
      console.error('Error in order deletion:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCompletePayment = () => {
    // Show success message
    toast.success(t('checkout:processingPaymentRequest'));
    
    // In a real app, this would redirect to a payment gateway
    // For demo purposes, we're using a timer to simulate payment flow
    setTimeout(() => {
      handleStatusUpdate('completed');
    }, 1500);
  };

  // Check order status to determine which buttons to show
  const isComplete = order.status === 'completed' || order.is_paid;
  const isPending = order.status === 'pending' || order.status === 'processing';

  return (
    <div className="space-y-4">
      {isPending && (
        <Button 
          variant="default" 
          size="sm" 
          className="w-full"
          onClick={handleCompletePayment}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('checkout:processing')}
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              {t('checkout:completePayment')}
            </>
          )}
        </Button>
      )}
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full"
        onClick={() => setReceiptModalOpen(true)}
      >
        <FileText className="mr-2 h-4 w-4" />
        {t('checkout:viewReceipt')}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            {t('orders:deleteOrder')}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('orders:deleteOrder')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('orders:confirmDeleteOrder')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteOrder}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {t('common:confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <PaymentReceiptModal 
        isOpen={receiptModalOpen} 
        setIsOpen={setReceiptModalOpen} 
        order={order} 
      />
    </div>
  );
};
