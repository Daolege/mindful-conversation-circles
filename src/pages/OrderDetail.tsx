
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

  // 添加状态来追踪是否已经尝试过重定向到登录页面
  const [redirectedToLogin, setRedirectedToLogin] = useState(false);

  useEffect(() => {
    // Only when authentication status loading is complete
    if (!authLoading) {
      // If user isn't logged in and not already redirected
      if (!user && !redirectedToLogin) {
        console.log("用户未登录，重定向到登录页面");
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
      setError('订单ID不存在');
      setLoading(false);
      return;
    }

    try {
      if (!user) {
        console.error("用户未登录，无法获取订单");
        setError('请先登录再查看订单详情');
        setLoading(false);
        return;
      }

      console.log("正在获取订单详情，订单ID:", id, "用户ID:", user?.id);
      
      // Check if user has admin role - safely access user_metadata
      const isAdmin = user?.user_metadata?.roles?.includes('admin') || false;
      console.log("用户是管理员:", isAdmin);
      
      // For admin users, pass null as userId to allow access to any order
      const orderData = await getOrderById(id, isAdmin ? null : user?.id);
      console.log("获取的订单数据:", orderData);

      if (!orderData) {
        console.error("未找到订单数据，订单ID:", id);
        setError('未找到订单数据或您没有权限查看该订单');
        setLoading(false);
        
        toast({
          title: "未找到订单",
          description: "未找到订单数据或您没有权限查看该订单",
          variant: "destructive"
        });
        return;
      }

      console.log("成功获取订单详情:", orderData);
      setOrder(orderData);
      setLoading(false);
    } catch (err: any) {
      console.error('获取订单详情时出错:', err);
      setError(err.message || '获取订单详情失败, 可能是数据库关联查询问题');
      setLoading(false);
      
      toast({
        title: "获取订单详情失败",
        description: err.message || "请稍后重试，或联系管理员检查数据库关联",
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
          返回我的订单
        </button>

        {loading ? (
          <OrderDetailSkeleton />
        ) : error ? (
          <OrderDetailError error={error} onBack={handleBackClick} />
        ) : !order ? (
          <OrderDetailError error="未找到订单" onBack={handleBackClick} />
        ) : (
          <OrderDetailContent order={order} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetail;
