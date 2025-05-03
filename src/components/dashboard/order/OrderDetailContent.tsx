import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  ArrowRight, 
  Package2, 
  Receipt, 
  BadgeCheck, 
  AlertTriangle, 
  RefreshCw,
  FileDown,
  Download
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/hooks/useTranslations";
import OrderPaymentDetails from "./OrderPaymentDetails";
import { useTranslation } from "react-i18next";
import { Order } from "@/types/order";

interface OrderDetailContentProps {
  order: Order;
}

export function OrderDetailContent({ order }: OrderDetailContentProps) {
  const { t: tCustom } = useTranslations();
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadInvoice = async () => {
    if (!order.invoice_url) return;
    
    setIsDownloading(true);
    try {
      window.open(order.invoice_url, '_blank');
    } catch (error) {
      console.error('Error downloading invoice:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusIcon = () => {
    switch (order.status) {
      case 'completed':
        return <BadgeCheck className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'pending':
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-yellow-500" />;
      default:
        return <Package2 className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusVariant = () => {
    switch (order.status) {
      case 'completed':
        return 'default';
      case 'pending':
      case 'processing':
        return 'outline';
      case 'failed':
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatCourseItems = () => {
    if (!order.courses) return tCustom('orders:noCourses');
    
    if (Array.isArray(order.courses)) {
      return order.courses.map(course => course.title).join(', ');
    }
    
    return order.courses.title || tCustom('orders:unknownCourse');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 pb-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                {tCustom('orders:orderDetails')} #{order.order_number || order.id.substring(0, 8)}
              </h2>
              <Badge variant={getStatusVariant()}>
                {tCustom(`orders:status.${order.status.toLowerCase()}`)}
              </Badge>
            </div>
            
            <div className="text-sm text-gray-500">
              {tCustom('orders:placedOn')} {new Date(order.created_at).toLocaleDateString()} 
              ({formatDistanceToNow(new Date(order.created_at), { addSuffix: true })})
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-2">{tCustom('orders:orderSummary')}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{tCustom('orders:orderNumber')}:</span>
                    <span className="font-medium">{order.order_number || order.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{tCustom('orders:orderDate')}:</span>
                    <span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{tCustom('orders:orderStatus')}:</span>
                    <span className="font-medium flex items-center gap-1">
                      {getStatusIcon()}
                      {tCustom(`orders:status.${order.status.toLowerCase()}`)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{tCustom('orders:totalAmount')}:</span>
                    <span className="font-medium">
                      {order.total_amount} {order.currency || 'CNY'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">{tCustom('orders:purchasedItems')}</h3>
                <div className="space-y-2">
                  <div className="text-sm">
                    {formatCourseItems()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        {order.invoice_url && (
          <CardFooter className="bg-gray-50 flex justify-end py-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadInvoice}
              disabled={isDownloading}
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? tCustom('orders:downloading') : tCustom('orders:downloadInvoice')}
            </Button>
          </CardFooter>
        )}
      </Card>

      <Card>
        <CardContent className="pt-6 pb-4">
          <h3 className="text-lg font-semibold mb-4">{tCustom('orders:paymentInformation')}</h3>
          <OrderPaymentDetails order={order} t={t} />
        </CardContent>
      </Card>
      
      {order.billing_address && (
        <Card>
          <CardContent className="pt-6 pb-4">
            <h3 className="text-lg font-semibold mb-4">{tCustom('orders:billingInformation')}</h3>
            <div className="text-sm">
              <p className="whitespace-pre-line">{order.billing_address}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {order.admin_notes && (
        <Card>
          <CardContent className="pt-6 pb-4">
            <h3 className="text-lg font-semibold mb-4">{tCustom('orders:additionalInformation')}</h3>
            <div className="text-sm bg-gray-50 p-3 rounded">
              <p className="whitespace-pre-line">{order.admin_notes}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
