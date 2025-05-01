
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Order } from '@/lib/types/order';
import { OrderReceipt } from './OrderReceipt';
import { FileText, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentReceiptModalProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PaymentReceiptModal = ({ order, open, onOpenChange }: PaymentReceiptModalProps) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full p-0 overflow-hidden print:shadow-none">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <FileText className="h-5 w-5" />
            支付凭证
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-0">
          <div className="px-4 py-3 bg-gray-50 print:hidden flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2" 
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
              打印凭证
            </Button>
          </div>
          
          <div className="p-6 bg-white">
            <OrderReceipt order={order} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
