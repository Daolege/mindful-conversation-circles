
import { Badge } from "@/components/ui/badge";
import { formatAmount } from "@/lib/utils/currencyUtils";
import { PaymentMethod, PaymentStatus } from "@/types/order";
import { TFunction } from "i18next";
import { Check, X, AlertTriangle, Clock } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

// Payment status icons
const PaymentStatusIcon = ({ status }: { status: PaymentStatus }) => {
  switch (status) {
    case PaymentStatus.SUCCEEDED:
      return <Check className="h-4 w-4 text-green-500" />;
    case PaymentStatus.FAILED:
      return <X className="h-4 w-4 text-red-500" />;
    case PaymentStatus.PENDING:
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-gray-500" />;
  }
};

// Helper to get method label
const getMethodLabel = (method: PaymentMethod, t: TFunction) => {
  switch (method) {
    case PaymentMethod.ALIPAY:
      return t('orders:paymentMethod.alipay');
    case PaymentMethod.WECHAT:
      return t('orders:paymentMethod.wechat');
    case PaymentMethod.CREDIT_CARD:
      return t('orders:paymentMethod.creditCard');
    case PaymentMethod.BANK_TRANSFER:
      return t('orders:paymentMethod.bankTransfer');
    case PaymentMethod.PAYPAL:
      return t('orders:paymentMethod.paypal');
    default:
      return t('orders:paymentMethod.other');
  }
};

interface OrderPaymentDetailsProps {
  order: any;
  t: TFunction;
}

export default function OrderPaymentDetails({ order, t }: OrderPaymentDetailsProps) {
  const { t: tCustom } = useTranslations();
  
  if (!order.payment) {
    return <div className="text-sm text-gray-500">{tCustom('orders:noPaymentInfo')}</div>;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{tCustom('orders:paymentDetails')}</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-gray-500">{tCustom('orders:paymentMethod')}</div>
          <div className="font-medium">{getMethodLabel(order.payment.method, t)}</div>
        </div>
        
        <div>
          <div className="text-gray-500">{tCustom('orders:paymentStatus')}</div>
          <div className="font-medium flex items-center gap-1">
            <PaymentStatusIcon status={order.payment.status as PaymentStatus} />
            <span>
              {tCustom(`orders:paymentStatus.${order.payment.status.toLowerCase()}`)}
            </span>
          </div>
        </div>
        
        <div>
          <div className="text-gray-500">{tCustom('orders:paymentId')}</div>
          <div className="font-mono text-xs font-medium truncate">
            {order.payment.payment_id || tCustom('orders:notAvailable')}
          </div>
        </div>
        
        <div>
          <div className="text-gray-500">{tCustom('orders:transactionDate')}</div>
          <div className="font-medium">
            {order.payment.processed_at 
              ? new Date(order.payment.processed_at).toLocaleDateString() 
              : tCustom('orders:notAvailable')}
          </div>
        </div>
      </div>
      
      {order.payment.notes && (
        <div className="mt-2">
          <div className="text-gray-500 text-sm">{tCustom('orders:paymentNotes')}</div>
          <div className="text-sm bg-gray-50 p-2 rounded mt-1">{order.payment.notes}</div>
        </div>
      )}
    </div>
  );
}
