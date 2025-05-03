
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
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
import LocalizedCurrency from "@/components/LocalizedCurrency";
import OrderLineItems from "./OrderLineItems";
import OrderPaymentDetails from "./OrderPaymentDetails";
import { getOrderById } from "@/lib/services/orderService";
import { useTranslations as useCustomTranslations } from "@/hooks/useTranslations";
import { OrderStatus } from "@/types/order";
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
  const { t: tCustom } = useCustomTranslations();
  // Using original i18n t function for components that need TFunction type
  const { t } = useTranslation();
  const [isRefunding, setIsRefunding] = useState(false);

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId),
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

  if (!orderData || !orderData.order) {
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

  const { order } = orderData;
  
  const statusColor = {
    [OrderStatus.COMPLETED]: "bg-green-500",
    [OrderStatus.PENDING]: "bg-yellow-500",
    [OrderStatus.FAILED]: "bg-red-500",
    [OrderStatus.REFUNDED]: "bg-gray-500",
    [OrderStatus.CANCELLED]: "bg-gray-500",
  };

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader className="pb-3 bg-gray-50">
        <div className="flex flex-wrap justify-between items-center">
          <CardTitle className="text-base flex flex-wrap items-center gap-2">
            <span>{tCustom('orders:order')}: #{order.order_number}</span>
            <Badge className={statusColor[order.status as OrderStatus]}>
              {tCustom(`orders:status.${order.status.toLowerCase()}`)}
            </Badge>
          </CardTitle>
          <span className="text-sm text-gray-500">
            {dayjs(order.created_at).format('YYYY-MM-DD HH:mm')}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <OrderLineItems items={order.items} t={t} />
        
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
                {tCustom('orders:viewInvoice')}
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
              {isRefunding ? tCustom('orders:processing') : tCustom('orders:refund')}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
