import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Loader2, DollarSign, Users, CreditCard, TrendingUp } from "lucide-react";
import { format, subDays } from "date-fns";
import { handleQueryError, OrderStats } from "@/lib/supabaseUtils";

export function StatisticsPanel() {
  const { data: totalSales, isLoading: isLoadingSales } = useQuery({
    queryKey: ['admin-statistics-sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('amount, status, created_at')
        .in('status', ['completed', 'paid'] as any[])
        .order('created_at', { ascending: false });

      return handleQueryError<OrderStats[]>(data as OrderStats[], error);
    },
  });

  const { data: totalStudents, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['admin-statistics-students'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('id', { count: 'exact' });
      if (error) {
        console.error("Error fetching students count:", error);
        return 0;
      }
      return data?.length || 0;
    },
  });

  // Process data for charts
  const getRevenueData = () => {
    if (!totalSales) return [];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        date: format(date, 'MM-dd'),
        revenue: 0,
        orders: 0,
      };
    }).reverse();

    totalSales.forEach((order) => {
      const orderDate = format(new Date(order.created_at), 'MM-dd');
      const dayData = last7Days.find(day => day.date === orderDate);
      
      if (dayData && (order.status === 'completed' || order.status === 'paid')) {
        dayData.revenue += order.amount;
        dayData.orders += 1;
      }
    });

    return last7Days;
  };

  const getPieChartData = () => {
    if (!totalSales) return [];

    const statusGroups: Record<string, number> = {};
    
    totalSales.forEach(order => {
      statusGroups[order.status] = (statusGroups[order.status] || 0) + 1;
    });

    return Object.keys(statusGroups).map(status => ({
      name: status,
      value: statusGroups[status]
    }));
  };

  // Stats summary
  const totalRevenue = totalSales ? totalSales.reduce((sum, order) => {
    if (order.status === 'completed' || order.status === 'paid') {
      return sum + order.amount;
    }
    return sum;
  }, 0) : 0;

  const orderCount = totalSales ? totalSales.length : 0;
  const completedOrderCount = totalSales ? totalSales.filter(order => 
    order.status === 'completed' || order.status === 'paid').length : 0;
  
  const completionRate = orderCount > 0 ? Math.round((completedOrderCount / orderCount) * 100) : 0;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (isLoadingSales || isLoadingStudents) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">总收入</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">从 {totalSales?.length || 0} 个订单</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">学生数量</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">活跃用户</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">订单转化率</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {completedOrderCount} 已完成 / {orderCount} 总订单
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">平均订单金额</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{completedOrderCount > 0 ? Math.round(totalRevenue / completedOrderCount).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground">每笔已完成订单</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>7日收入趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getRevenueData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="收入 (¥)" />
                <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="订单数" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>订单状态分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getPieChartData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {getPieChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
