import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useSearchParams } from "react-router-dom"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/authHooks"
import { OrderHistory } from "@/components/dashboard/OrderHistory"
import { ProfileManagement } from "@/components/dashboard/ProfileManagement"
import { EnrolledCourses } from "@/components/dashboard/EnrolledCourses"
import { SubscriptionHistory } from "@/components/dashboard/SubscriptionHistory"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { enrollUserInSampleCourses } from '@/lib/services/userEnrollmentService'
import { useToast } from '@/hooks/use-toast'
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { UserCourse } from "@/types/dashboard"
import { Order } from "@/lib/types/order"
import { getUserOrders } from "@/lib/services/orderQueryService"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';
  const { toast } = useToast();
  const [dataGenerated, setDataGenerated] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 获取用户课程
  const { data: coursesWithProgress, isLoading: coursesLoading } = useQuery({
    queryKey: ['user-courses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log("Fetching courses for user:", user.id);
      
      const { data, error } = await supabase
        .from('user_courses')
        .select(`
          id, 
          course_id, 
          purchased_at,
          last_accessed_at,
          user_id,
          courses:course_id(title, syllabus)
        `)
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error fetching enrolled courses:', error);
        return [];
      }
      
      console.log(`Found ${data?.length || 0} enrolled courses for user`);
      
      return (data || []).map(course => ({
        id: course.id,
        course_id: course.course_id,
        user_id: user.id,
        purchased_at: course.purchased_at,
        last_accessed_at: course.last_accessed_at || new Date().toISOString(),
        courses: course.courses,
        course_progress: [] // 分开获取课程进度，避免关联查询问题
      })) as UserCourse[];
    },
    enabled: !!user?.id
  });

  // 直接查询订单表，确保获取所有数据
  const fetchOrdersDirectly = useCallback(async () => {
    if (!user?.id) return { data: [], error: null };
    
    console.log("直接查询订单表:", user.id);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("直接查询订单错误:", error);
        return { data: [], error };
      }
      
      console.log("直接查询订单结果:", data?.length || 0, "条记录");
      if (data && data.length > 0) {
        data.forEach(order => {
          console.log(`直接查询 - ID: ${order.id}, 金额: ${order.amount}, 币种: ${order.currency || 'usd'}, 状态: ${order.status}`);
        });
      }
      
      return { data: data || [], error: null };
    } catch (err) {
      console.error("直接查询订单异常:", err);
      return { data: [], error: err as Error };
    }
  }, [user?.id]);

  // 使用专门的orderQueryService获取订单数据
  const { 
    data: ordersData, 
    isLoading: ordersLoading, 
    error: ordersError, 
    refetch: refetchOrders, 
    isError 
  } = useQuery({
    queryKey: ['user-orders', user?.id, refreshTrigger],
    queryFn: async () => {
      if (!user?.id) {
        return { data: [], error: null };
      }
      
      setIsRefreshing(true);
      console.log("Fetching orders for user:", user.id, "Refresh trigger:", refreshTrigger);
      
      try {
        // 首先尝试使用getUserOrders获取订单
        const result = await getUserOrders(user.id);
        
        // 如果没有找到订单或出错，尝试直接查询
        if (!result.data || result.data.length === 0 || result.error) {
          console.log("使用标准方法没有找到订单，尝试直接查询");
          const directResult = await fetchOrdersDirectly();
          
          // 对比两种查询方式的结果
          if (directResult.data && directResult.data.length > 0) {
            console.log("直接查询找到订单，但标准方法未找到。可能存在数据处理问题。");
          }
        }
        
        if (result.error) {
          console.error("Error fetching orders:", result.error);
          toast({
            title: "获取订单失败",
            description: result.error.message || "无法加载您的订单记录，请稍后再试",
            variant: "destructive"
          });
        } else if (result.data && result.data.length > 0) {
          console.log("Orders fetched successfully:", result.data.length, "orders");
          if (!isInitialLoad) {
            toast({
              title: "订单数据已加载",
              description: `已找到 ${result.data.length} 条订单记录`
            });
          }
        } else {
          console.log("No orders found for user");
        }
        
        return result;
      } finally {
        setIsRefreshing(false);
        setIsInitialLoad(false);
      }
    },
    enabled: !!user?.id,
    staleTime: 0, // 每次都重新获取
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 1000, // 每10秒自动刷新一次
    retry: 3,
    refetchOnMount: true
  });

  // 使用正确处理后的订单数据
  const orders = React.useMemo(() => {
    return ordersData?.data || [];
  }, [ordersData]);

  // 强制刷新订单
  const refreshOrders = async () => {
    setIsRefreshing(true);
    toast({
      title: "刷新订单数据",
      description: "正在重新获取您的订单记录..."
    });
    
    try {
      // 强制刷新缓存
      await fetch('/api/clear-cache', { method: 'POST' }).catch(() => {});
      
      // 更新刷新触发器强制重新获取
      setRefreshTrigger(prev => prev + 1);
      
      // 手动触发查询
      const { data } = await refetchOrders();
      
      // 如果使用标准方式未找到订单，尝试直接查询
      if (!data?.data || data.data.length === 0) {
        const directResult = await fetchOrdersDirectly();
        if (directResult.data && directResult.data.length > 0) {
          console.warn("直接查询发现订单，但通过服务未找到，可能存在数据处理问题");
          toast({
            title: "检测到潜在问题",
            description: "发现部分订单数据，但无法正确加载，请联系支持",
            variant: "warning"
          });
        }
      }
      
      // 显示刷新结果
      const orderCount = data?.data?.length || 0;
      toast({
        title: "订单已刷新",
        description: `已找到 ${orderCount} 条订单记��`,
        variant: orderCount > 0 ? "default" : "default"
      });
      
      // 如果没有订单，显示特殊提示
      if (orderCount === 0) {
        toast({
          title: "未找到订单",
          description: "您目前没有任何订单记录",
          variant: "default"
        });
      }
    } catch (err) {
      console.error("刷新订单时出错:", err);
      toast({
        title: "刷新订单失败",
        description: "请稍后再试",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // 添加手动生成订单
  const generateSampleOrder = async () => {
    if (!user?.id) return;
    
    try {
      toast({
        title: "生成示例订单",
        description: "正在为您创建示例订单数据..."
      });
      
      // 获取一个随机课程
      const { data: courses } = await supabase
        .from('courses')
        .select('id, price, title')
        .limit(1);
      
      if (!courses || courses.length === 0) {
        toast({
          title: "无法创建示例订单",
          description: "未找到可用课程",
          variant: "destructive"
        });
        return;
      }
      
      const course = courses[0];
      const orderNumber = 'ORDER-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();
      
      // 创建订单记录，确保设置必要字段
      const { data: newOrder, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          course_id: course.id,
          amount: course.price,
          original_amount: course.price,
          status: 'completed',
          payment_type: 'credit-card',
          order_number: orderNumber,
          currency: 'usd', // 明确设置货币
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) {
        console.error("创建示例订单失败:", error);
        toast({
          title: "创建示例订单失败",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      console.log("已创建示例订单:", newOrder);
      
      // 成功后重新获取订单
      setRefreshTrigger(prev => prev + 1);
      
      toast({
        title: "示例订单已创建",
        description: `已为课程 "${course.title}" 创建订单`
      });
    } catch (error) {
      console.error("创建示例订单时出错:", error);
      toast({
        title: "创建示例订单失败",
        description: "发生未知错误，请稍后再试",
        variant: "destructive"
      });
    }
  };

  // 示例数据生成
  React.useEffect(() => {
    if (user?.id && !dataGenerated) {
      enrollUserInSampleCourses(user.id).then(() => {
        setDataGenerated(true);
        toast({
          title: "示例数据已生成",
          description: "已为您添加了一些示例课程数据",
        });
      });
    }
  }, [user, dataGenerated, toast]);

  // 页面加载时自动刷新
  React.useEffect(() => {
    if (user?.id) {
      const timer = setTimeout(() => {
        refreshOrders();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user?.id]);

  // 自动检测订单变化
  React.useEffect(() => {
    if (!user?.id) return;
    
    const channel = supabase
      .channel('order-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('New order created:', payload);
        // 自动刷新订单列表
        setRefreshTrigger(prev => prev + 1);
        toast({
          title: "检测到新订单",
          description: "订单列表已自动更新",
        });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-knowledge-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold">个人中心</h1>

          <TooltipProvider>
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="mb-6 w-full justify-start border-b bg-transparent p-0">
                <TabsTrigger 
                  value="profile" 
                  className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-knowledge-primary data-[state=active]:bg-transparent"
                >
                  个人资料
                </TabsTrigger>
                <TabsTrigger 
                  value="courses"
                  className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-knowledge-primary data-[state=active]:bg-transparent"
                >
                  我的课程
                </TabsTrigger>
                <TabsTrigger 
                  value="subscriptions"
                  className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-knowledge-primary data-[state=active]:bg-transparent"
                >
                  订阅记录
                </TabsTrigger>
                <TabsTrigger 
                  value="orders"
                  className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-knowledge-primary data-[state=active]:bg-transparent"
                >
                  订单记录
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-6">
                <ProfileManagement />
              </TabsContent>
              
              <TabsContent value="courses" className="space-y-6">
                <EnrolledCourses 
                  coursesWithProgress={coursesWithProgress || []}
                  showAll={true}
                />
              </TabsContent>

              <TabsContent value="subscriptions" className="space-y-6">
                <SubscriptionHistory />
              </TabsContent>
              
              <TabsContent value="orders" className="space-y-6">
                {ordersError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>获取订单数据失败</AlertTitle>
                    <AlertDescription>
                      {ordersError instanceof Error ? ordersError.message : "无法加载订单数据，请稍后再试"}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex justify-end mb-4 gap-2">
                  <Button
                    onClick={refreshOrders}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-100 transition-colors"
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? '正在刷新...' : '刷新订单数据'}
                  </Button>
                  
                  <Button
                    onClick={generateSampleOrder}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-knowledge-primary rounded-md hover:bg-knowledge-primary/90 transition-colors"
                  >
                    生成示例订单
                  </Button>
                </div>
                
                {ordersLoading && !isRefreshing ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-knowledge-primary" />
                  </div>
                ) : (
                  <OrderHistory 
                    orders={orders}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    showAll={true}
                  />
                )}
                
                {!ordersLoading && orders.length === 0 && (
                  <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <p className="text-muted-foreground mb-4">暂未找到任何订单记录，您可以：</p>
                    <Button 
                      onClick={generateSampleOrder}
                      variant="outline"
                      className="mr-2"
                    >
                      生成示例订单
                    </Button>
                    <Button 
                      onClick={refreshOrders}
                      variant="outline"
                      disabled={isRefreshing}
                    >
                      {isRefreshing ? '正在刷新...' : '刷新订单数据'}
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TooltipProvider>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
