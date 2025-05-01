
import { Order } from '@/lib/types/order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderDetailHeader } from '@/components/dashboard/order/OrderDetailHeader';
import { OrderActions } from '@/components/dashboard/order/OrderActions';
import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { CreditCard, UserIcon } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { format } from "date-fns";
import { OrderPaymentDetails } from './OrderPaymentDetails';
import { calculateSavings, getSavingsPercentage } from '@/lib/services/currencyService';
import { formatCurrency } from '@/lib/utils';
import { useTranslations } from '@/hooks/useTranslations';

interface OrderDetailContentProps {
  order: Order;
}

export const OrderDetailContent = ({ order: initialOrder }: OrderDetailContentProps) => {
  const [order, setOrder] = useState(initialOrder);
  const { t } = useTranslations();

  const handleOrderUpdate = () => {
    // Reload the page to get fresh data
    window.location.reload();
  };

  // Calculate savings amount
  const savingsAmount = calculateSavings(order);
  const savingsPercentage = getSavingsPercentage(order);
  const hasSavings = savingsAmount > 0;

  // Log savings information for debugging
  useEffect(() => {
    console.log('Savings info:', { 
      originalAmount: order.original_amount,
      amount: order.amount, 
      savingsAmount, 
      savingsPercentage, 
      hasSavings 
    });
  }, [order, savingsAmount, savingsPercentage, hasSavings]);

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="bg-white shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">{t('orders:orderDetails')}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-8">
                {/* 基本信息区块 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    {t('orders:basicInformation')}
                  </h3>
                  <OrderDetailHeader order={order} onOrderUpdate={handleOrderUpdate} />
                </div>

                <Separator />
                
                {/* 支付信息区块 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    {t('orders:paymentInformation')}
                  </h3>
                  <OrderPaymentDetails order={order} />

                  {/* 节省金额信息，使用显著的样式以确保可见 */}
                  {hasSavings && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-700">{t('orders:discountSavings')}</p>
                          <p className="text-xs text-green-600">{t('orders:savedComparedToOriginal', { percentage: savingsPercentage })}</p>
                        </div>
                        <p className="text-green-700 font-semibold">
                          {formatCurrency(savingsAmount, order.currency)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />
                
                {/* 客户信息区块 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    {t('orders:customerInformation')}
                  </h3>
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('orders:customerId')}</p>
                        <p className="font-medium">{order.user_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('orders:emailAddress')}</p>
                        <p className="font-medium">{order.profiles?.email || t('orders:unknown')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('orders:name')}</p>
                        <p className="font-medium">{order.profiles?.full_name || t('orders:notProvided')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('orders:orderDate')}</p>
                        <p className="font-medium">
                          {order.created_at ? format(new Date(order.created_at), 'yyyy-MM-dd HH:mm:ss') : t('orders:unknown')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <div className="sticky top-20 space-y-4">
            <Card className="bg-white shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">{t('orders:orderActions')}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <OrderActions order={order} onOrderUpdated={handleOrderUpdate} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
