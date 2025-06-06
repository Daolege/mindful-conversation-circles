
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import LocalizedCurrency from "@/components/LocalizedCurrency";
import OrderLineItems from "./OrderLineItems";
import OrderPaymentDetails from "./OrderPaymentDetails";
import { getOrderById } from "@/lib/services/orderService";
import { useTranslations } from "@/hooks/useTranslations";
import { Order, OrderStatus } from "@/types/order";
import { useTranslation } from "react-i18next";

interface OrderItemProps {
  orderId: string | number;
  onRefund?: (orderId: string | number) => void;
  showRefundButton?: boolean;
}

export default function OrderItem({
  orderId,
  onRefund,
  showRefundButton = false,
}: OrderItemProps) {
  const { t: tCustom } = useTranslations();
  // Using original i18n t function for components that need TFunction type
  const { t } = useTranslation();
  const [isRefunding, setIsRefunding] = useState(false);

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order', orderId.toString()],
    queryFn: () => getOrderById(orderId.toString()),
  });

  const handleRefundClick = async () => {
    if (!onRefund || !orderId) return;
    
    setIsRefunding(true);
    try {
      await onRefund(orderId);
    } catch (error) {
      console.error("Refund error:", error);
    } finally {
      setIsRefunding(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6 animate-pulse">
        <CardHeader className="pb-3">
          <div className="h-6 bg-gray-200 rounded-md w-36"></div>
        </CardHeader>
        <CardContent>
          <div className="h-4 bg-gray-200 rounded-md w-full mb-3"></div>
          <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
        </CardContent>
      </Card>
    );
  }

  // Handle the case where orderData has different structure
  if (!orderData || !orderData.data) {
    return (
      <Card className="mb-6 border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <CardTitle>{tCustom('errors:orderNotFound')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{tCustom('errors:orderIdInvalid')}: {orderId}</p>
        </CardContent>
      </Card>
    );
  }

  // Extract the order from the orderData structure
  const order = orderData.data as Order;
  
  // Map for status colors using string literals instead of enum values
  const statusColor: Record<string, string> = {
    completed: "bg-green-500",
    pending: "bg-yellow-500",
    processing: "bg-yellow-500",
    failed: "bg-red-500",
    refunded: "bg-gray-500",
    cancelled: "bg-gray-500",
  };

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader className="pb-3 bg-gray-50">
        <div className="flex flex-wrap justify-between items-center">
          <CardTitle className="text-base flex flex-wrap items-center gap-2">
            <span>{tCustom('orders:order')}: #{order.order_number || order.id.substring(0, 8)}</span>
            <Badge className={statusColor[order.status?.toLowerCase() || 'pending']}>
              {tCustom(`orders:${order.status?.toLowerCase() || 'pending'}`)}
            </Badge>
          </CardTitle>
          <span className="text-sm text-gray-500">
            {format(new Date(order.created_at), 'yyyy-MM-dd HH:mm')}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        {order.items && <OrderLineItems items={order.items} t={t} />}
        
        <Separator className="my-4" />
        
        <OrderPaymentDetails order={order} t={t} />
      </CardContent>
      
      <CardFooter className="flex justify-between bg-gray-50 py-3">
        <div className="text-sm">
          <span className="font-medium">{tCustom('orders:total')}:</span>{' '}
          <LocalizedCurrency 
            amount={order.total_amount} 
            currency={order.currency || 'CNY'}
            className="font-bold"
          />
        </div>
        
        <div className="space-x-2">
          {order.invoice_url && (
            <Button 
              variant="outline" 
              size="sm" 
              asChild
            >
              <Link to={order.invoice_url} target="_blank">
                {tCustom('orders:downloadInvoice')}
              </Link>
            </Button>
          )}
          
          {showRefundButton && 
           order.status === OrderStatus.COMPLETED && 
           onRefund && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleRefundClick}
              disabled={isRefunding}
            >
              {isRefunding ? tCustom('orders:processing') : tCustom('orders:requestRefund')}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
