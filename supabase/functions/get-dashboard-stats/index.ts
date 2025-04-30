
// supabase/functions/get-dashboard-stats/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { isDemo } = await req.json();
    
    // 如果是演示模式，返回模拟数据
    if (isDemo === true) {
      return new Response(
        JSON.stringify({
          newUsersThisMonth: 15,
          newUsersThisYear: 120,
          totalUsers: 350,
          monthlyUserGrowthRate: 5.2,
          yearlyUserGrowthRate: 25.8,
          newCoursesThisMonth: 3,
          newCoursesThisYear: 18,
          totalCourses: 42,
          monthlyCoursesGrowthRate: 10,
          yearlyCoursesGrowthRate: 45.7,
          monthlyRevenue: 15000,
          monthlyOrders: 25,
          quarterlyRevenue: 45000,
          quarterlyOrders: 75,
          yearlyRevenue: 180000,
          yearlyOrders: 320,
          totalRevenue: 540000,
          totalOrders: 950,
          paymentStats: [
            { paymentType: 'alipay', totalAmount: 250000, transactionCount: 420 },
            { paymentType: 'wechat', totalAmount: 180000, transactionCount: 380 },
            { paymentType: 'creditcard', totalAmount: 95000, transactionCount: 120 },
            { paymentType: 'bank', totalAmount: 15000, transactionCount: 30 }
          ]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 获取当前日期和时间范围
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);

    // 获取上个月的开始时间
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // 获取去年同期的开始时间
    const lastYearSameMonth = new Date(now.getFullYear() - 1, now.getMonth(), 1);

    // 获取用户统计
    const { data: totalUsersData } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    const totalUsers = totalUsersData?.count || 0;

    const { data: newUsersThisMonthData } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    const newUsersThisMonth = newUsersThisMonthData?.count || 0;

    const { data: newUsersThisYearData } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
      .gte('created_at', startOfYear.toISOString());

    const newUsersThisYear = newUsersThisYearData?.count || 0;

    // 获取上个月的新用户数量
    const { data: lastMonthUsersData } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
      .gte('created_at', lastMonth.toISOString())
      .lte('created_at', lastMonthEnd.toISOString());

    const lastMonthUsers = lastMonthUsersData?.count || 0;

    // 计算月增长率
    const monthlyUserGrowthRate = lastMonthUsers > 0 
      ? parseFloat(((newUsersThisMonth - lastMonthUsers) / lastMonthUsers * 100).toFixed(1))
      : 0;

    // 获取去年同期的新用户数量
    const { data: lastYearUsersData } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
      .gte('created_at', lastYearSameMonth.toISOString())
      .lte('created_at', lastMonth.toISOString());

    const lastYearUsers = lastYearUsersData?.count || 0;

    // 计算年增长率
    const yearlyUserGrowthRate = lastYearUsers > 0 
      ? parseFloat(((newUsersThisYear - lastYearUsers) / lastYearUsers * 100).toFixed(1))
      : 0;

    // 获取课程统计
    const { data: totalCoursesData } = await supabase
      .from('courses')
      .select('count', { count: 'exact', head: true });

    const totalCourses = totalCoursesData?.count || 0;

    const { data: newCoursesThisMonthData } = await supabase
      .from('courses')
      .select('count', { count: 'exact', head: true })
      .gte('published_at', startOfMonth.toISOString());

    const newCoursesThisMonth = newCoursesThisMonthData?.count || 0;

    const { data: newCoursesThisYearData } = await supabase
      .from('courses')
      .select('count', { count: 'exact', head: true })
      .gte('published_at', startOfYear.toISOString());

    const newCoursesThisYear = newCoursesThisYearData?.count || 0;

    // 假设增长率数据 - 实际项目中可从历史数据计算
    const monthlyCoursesGrowthRate = 8.5;  // 示例值
    const yearlyCoursesGrowthRate = 35.2;  // 示例值

    // 订单和收入统计
    // 本月订单和收入
    const { data: monthlyOrdersData } = await supabase
      .from('orders')
      .select('id, amount, payment_type')
      .eq('status', 'completed')
      .gte('created_at', startOfMonth.toISOString());

    const monthlyOrders = monthlyOrdersData?.length || 0;
    const monthlyRevenue = monthlyOrdersData?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

    // 本季度订单和收入
    const { data: quarterlyOrdersData } = await supabase
      .from('orders')
      .select('id, amount')
      .eq('status', 'completed')
      .gte('created_at', startOfQuarter.toISOString());

    const quarterlyOrders = quarterlyOrdersData?.length || 0;
    const quarterlyRevenue = quarterlyOrdersData?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

    // 年度订单和收入
    const { data: yearlyOrdersData } = await supabase
      .from('orders')
      .select('id, amount')
      .eq('status', 'completed')
      .gte('created_at', startOfYear.toISOString());

    const yearlyOrders = yearlyOrdersData?.length || 0;
    const yearlyRevenue = yearlyOrdersData?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

    // 总订单和收入
    const { data: totalOrdersData } = await supabase
      .from('orders')
      .select('id, amount')
      .eq('status', 'completed');

    const totalOrders = totalOrdersData?.length || 0;
    const totalRevenue = totalOrdersData?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

    // 按支付方式统计
    const { data: allOrdersWithPayment } = await supabase
      .from('orders')
      .select('amount, payment_type')
      .eq('status', 'completed');

    // 处理支付方式统计
    const paymentTypeMap = new Map();
    
    if (allOrdersWithPayment && allOrdersWithPayment.length > 0) {
      allOrdersWithPayment.forEach(order => {
        const paymentType = order.payment_type || 'unknown';
        if (!paymentTypeMap.has(paymentType)) {
          paymentTypeMap.set(paymentType, { totalAmount: 0, transactionCount: 0 });
        }
        const stats = paymentTypeMap.get(paymentType);
        stats.totalAmount += (order.amount || 0);
        stats.transactionCount += 1;
      });
    }

    // 转换为数组格式
    const paymentStats = Array.from(paymentTypeMap.entries()).map(([paymentType, stats]) => ({
      paymentType,
      totalAmount: stats.totalAmount,
      transactionCount: stats.transactionCount
    }));

    // 合并并返回所有统计数据
    const dashboardStats = {
      // 用户统计
      totalUsers,
      newUsersThisMonth,
      newUsersThisYear,
      monthlyUserGrowthRate,
      yearlyUserGrowthRate,
      
      // 课程统计
      totalCourses,
      newCoursesThisMonth,
      newCoursesThisYear,
      monthlyCoursesGrowthRate,
      yearlyCoursesGrowthRate,
      
      // 订单和收入统计
      monthlyOrders,
      monthlyRevenue,
      quarterlyOrders,
      quarterlyRevenue,
      yearlyOrders,
      yearlyRevenue,
      totalOrders,
      totalRevenue,
      
      // 支付方式统计
      paymentStats
    };

    return new Response(
      JSON.stringify(dashboardStats),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating dashboard stats:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
