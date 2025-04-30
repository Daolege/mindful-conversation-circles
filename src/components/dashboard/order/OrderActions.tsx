
import { Button } from "@/components/ui/button";
import { FileText, Mail } from "lucide-react";
import { Order } from "@/lib/types/order";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OrderReceipt } from "./OrderReceipt";
import { siteConfig } from "@/config/site";

interface OrderActionsProps {
  order: Order;
}

export const OrderActions = ({ order }: OrderActionsProps) => {
  const [showReceipt, setShowReceipt] = useState(false);

  const handleEmailClick = () => {
    window.location.href = `mailto:contact@example.com`;
  };

  return (
    <>
      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={() => setShowReceipt(true)}
        >
          <FileText className="mr-2 h-4 w-4" />
          支付凭证
        </Button>
        
        <div className="pt-4 border-t mt-4">
          <p className="text-sm text-muted-foreground mb-4">
            如有关于订单的任何问题，请通过以下邮箱联系我们。
          </p>
          <Button 
            variant="default" 
            className="w-full"
            onClick={handleEmailClick}
          >
            <Mail className="mr-2 h-4 w-4" />
            contact@example.com
          </Button>
        </div>
      </div>

      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>支付凭证</DialogTitle>
          </DialogHeader>
          <OrderReceipt order={order} />
        </DialogContent>
      </Dialog>
    </>
  );
};
