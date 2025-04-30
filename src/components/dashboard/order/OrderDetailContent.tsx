import { Order } from '@/lib/types/order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderDetailHeader } from '@/components/dashboard/order/OrderDetailHeader';
import { OrderCourseList } from '@/components/dashboard/order/OrderCourseList';
import { OrderActions } from '@/components/dashboard/order/OrderActions';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderPaymentDetails } from '@/components/dashboard/order/OrderPaymentDetails';
import { UserIcon, CreditCard, ShoppingBag, RefreshCw } from 'lucide-react';
import { OrderSubscriptionDetails } from '@/components/dashboard/order/OrderSubscriptionDetails';
import { TooltipProvider } from '@/components/ui/tooltip';

interface OrderDetailContentProps {
  order: Order;
}

export const OrderDetailContent = ({ order: initialOrder }: OrderDetailContentProps) => {
  const [order, setOrder] = useState(initialOrder);

  const handleOrderUpdate = () => {
    // Reload the page to get fresh data
    window.location.reload();
  };

  // 检查是否为订阅订单
  const isSubscription = order.payment_type?.includes('subscription-');
  const [activeTab, setActiveTab] = useState<string>("details");

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="bg-white shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">订单详情</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full mb-6">
                  <TabsTrigger value="details" className="flex-1 flex items-center gap-1.5">
                    <ShoppingBag className="h-4 w-4" />
                    基本信息
                  </TabsTrigger>
                  <TabsTrigger value="payment" className="flex-1 flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4" />
                    支付信息
                  </TabsTrigger>
                  {isSubscription && (
                    <TabsTrigger value="subscription" className="flex-1 flex items-center gap-1.5">
                      <RefreshCw className="h-4 w-4" />
                      订阅细节
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="customer" className="flex-1 flex items-center gap-1.5">
                    <UserIcon className="h-4 w-4" />
                    客户信息
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details">
                  <OrderDetailHeader order={order} onOrderUpdate={handleOrderUpdate} />
                </TabsContent>
                
                <TabsContent value="payment">
                  <OrderPaymentDetails order={order} />
                </TabsContent>
                
                {isSubscription && (
                  <TabsContent value="subscription">
                    <OrderSubscriptionDetails order={order} />
                  </TabsContent>
                )}
                
                <TabsContent value="customer">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">客户信息</h3>
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">客户ID</p>
                          <p className="font-medium">{order.user_id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">邮箱地址</p>
                          <p className="font-medium">{order.profiles?.email || '未知'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">姓名</p>
                          <p className="font-medium">{order.profiles?.full_name || '未提供'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="bg-white shadow mt-8">
            <CardHeader className="pb-2">
              <CardTitle>课程列表</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <OrderCourseList order={order} />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <div className="sticky top-20 space-y-4">
            <Card className="bg-white shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">订单操作</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <OrderActions order={order} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
