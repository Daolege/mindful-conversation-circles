
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/authHooks';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft } from 'lucide-react';
import { Order } from '@/lib/types/order';
import { getOrderById } from '@/lib/services/orderQueryService';
import { useToast } from '@/hooks/use-toast';
import { OrderDetailSkeleton } from '@/components/dashboard/order/OrderDetailSkeleton';
import { OrderDetailError } from '@/components/dashboard/order/OrderDetailError';
import { OrderDetailContent } from '@/components/dashboard/order/OrderDetailContent';
import { useTranslations } from '@/hooks/useTranslations';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const orderFetchAttemptedRef = useRef(false);
  const { t } = useTranslations();

  // 添加状态来追踪是否已经尝试过重定向到登录页面
  const [redirectedToLogin, setRedirectedToLogin] = useState(false);

  useEffect(() => {
    // Only when authentication status loading is complete
    if (!authLoading) {
      // If user isn't logged in and not already redirected
      if (!user && !redirectedToLogin) {
        console.log(t('errors:notLoggedInRedirectToLogin'));
        setRedirectedToLogin(true);
        navigate('/auth', { 
          state: { 
            loginRequired: true,
            from: location.pathname
          } 
        });
        return;
      }
      
      // If user is logged in and there's an order ID, try to fetch the order details
      if (user && id && !orderFetchAttemptedRef.current) {
        fetchOrderDetails();
        orderFetchAttemptedRef.current = true;
      }
    }
  }, [user, id, authLoading, redirectedToLogin]);

  const fetchOrderDetails = async () => {
    if (!id) {
      setError(t('errors:orderIdNotFound'));
      setLoading(false);
      return;
    }

    try {
      if (!user) {
        console.error(t('errors:userNotLoggedInCantGetOrder'));
        setError(t('errors:pleaseLoginToViewOrderDetails'));
        setLoading(false);
        return;
      }

      console.log(t('checkout:fetchingOrderDetails'), id, t('checkout:userId'), user?.id);
      
      // Check if user has admin role - safely access user_metadata
      const isAdmin = user?.user_metadata?.roles?.includes('admin') || false;
      console.log(t('checkout:userIsAdmin'), isAdmin);
      
      // For admin users, pass null as userId to allow access to any order
      const orderData = await getOrderById(id, isAdmin ? null : user?.id);
      console.log(t('checkout:retrievedOrderData'), orderData);

      if (!orderData) {
        console.error(t('errors:orderDataNotFound'), id);
        setError(t('errors:orderNotFoundOrNoPermission'));
        setLoading(false);
        
        toast({
          title: t('errors:orderNotFound'),
          description: t('errors:orderNotFoundOrNoPermission'),
          variant: "destructive"
        });
        return;
      }

      console.log(t('checkout:successfullyRetrievedOrderDetails'), orderData);
      setOrder(orderData);
      setLoading(false);
    } catch (err: any) {
      console.error(t('errors:errorFetchingOrderDetails'), err);
      setError(err.message || t('errors:failedToGetOrderDetails'));
      setLoading(false);
      
      toast({
        title: t('errors:failedToGetOrderDetails'),
        description: err.message || t('errors:tryAgainLaterOrContactAdmin'),
        variant: "destructive"
      });
    }
  };

  const handleBackClick = () => {
    navigate('/dashboard?tab=orders');
  };

  // 如果认证正在加载，显示加载状态
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <OrderDetailSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  // 如果未登录且重定向已触发，返回null以避免闪烁
  if (!user && redirectedToLogin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <button 
          onClick={handleBackClick}
          className="inline-flex items-center text-sm mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('checkout:backToMyOrders')}
        </button>

        {loading ? (
          <OrderDetailSkeleton />
        ) : error ? (
          <OrderDetailError error={error} onBack={handleBackClick} />
        ) : !order ? (
          <OrderDetailError error={t('errors:orderNotFound')} onBack={handleBackClick} />
        ) : (
          <OrderDetailContent order={order} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetail;
