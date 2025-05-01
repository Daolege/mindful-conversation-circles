
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserSubscriptionHistory, getCurrentSubscription } from "@/lib/services/subscriptionService";
import { useAuth } from "@/contexts/authHooks";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { generateMockData } from "@/lib/services/mockDataService";

export function SubscriptionHistory() {
  const { user } = useAuth();
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  
  const { data: subscriptionHistory, isLoading: isLoadingHistory, refetch } = useQuery({
    queryKey: ['subscription-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await getUserSubscriptionHistory(user.id);
    },
    enabled: !!user?.id,
  });
  
  const { data: currentSubscription, isLoading: isLoadingCurrent } = useQuery({
    queryKey: ['current-subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return await getCurrentSubscription(user.id);
    },
    enabled: !!user?.id,
  });
  
  const isLoading = isLoadingHistory || isLoadingCurrent;

  const formatEventType = (type: string) => {
    const eventMap: Record<string, string> = {
      'subscription_created': '创建订阅',
      'subscription_renewed': '续订',
      'plan_changed': '更改计划',
      'payment_failed': '付款失败',
      'subscription_cancelled': '取消订阅',
      'subscription_resumed': '恢复订阅'
    };
    
    return eventMap[type] || type;
  };
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return format(new Date(dateStr), 'yyyy-MM-dd');
    } catch (e) {
      return dateStr;
    }
  };
  
  const handleGenerateData = async () => {
    if (!user?.id || isGeneratingData) return;
    
    setIsGeneratingData(true);
    try {
      const result = await generateMockData(user.id);
      
      if (result.success && result.subscriptions) {
        toast.success("示例数据已生成", {
          description: "订阅记录已添加到您的账户"
        });
        refetch();
      } else {
        toast.error("生成示例数据失败", {
          description: "请稍后再试"
        });
      }
    } catch (err) {
      console.error("Error generating mock data:", err);
      toast.error("生成示例数据时发生错误");
    } finally {
      setIsGeneratingData(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-knowledge-primary" />
      </div>
    );
  }
  
  const hasSubscriptionData = (subscriptionHistory && subscriptionHistory.length > 0) || currentSubscription;
  
  if (!hasSubscriptionData) {
    return (
      <div className="bg-muted/50 border rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium mb-2">暂无订阅记录</h3>
        <p className="text-muted-foreground mb-6">您还没有任何订阅记录</p>
        
        <Button 
          onClick={handleGenerateData} 
          disabled={isGeneratingData}
          className="inline-flex items-center"
        >
          {isGeneratingData ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          添加示例数据
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {currentSubscription && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">当前订阅</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{currentSubscription.subscription_plan?.name || '标准订阅'}</p>
                <p className="text-sm text-muted-foreground">
                  {currentSubscription.status === 'active' ? '活跃' : currentSubscription.status === 'cancelled' ? '已取消' : currentSubscription.status}
                </p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {currentSubscription.status === 'active' ? '活跃' : '非活跃'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">当前订阅周期</p>
                <p>{formatDate(currentSubscription.current_period_start as string)} - {formatDate(currentSubscription.current_period_end as string)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">创建时间</p>
                <p>{formatDate(currentSubscription.created_at as string)}</p>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button variant="outline" size="sm">管理订阅</Button>
            </div>
          </div>
        </Card>
      )}
      
      {subscriptionHistory && subscriptionHistory.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">订阅记录</h3>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">日期</TableHead>
                  <TableHead>事件</TableHead>
                  <TableHead className="w-[200px]">计划变更</TableHead>
                  <TableHead className="w-[100px]">说明</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptionHistory.map((record, i) => (
                  <TableRow key={`${record.id || i}-${record.effective_date}`}>
                    <TableCell>{formatDate(record.effective_date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {formatEventType(record.event_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.event_type === 'plan_changed' ? (
                        <span className="text-sm">
                          {record.previous_plan?.name || '—'} ➝ {record.new_plan?.name || '—'}
                        </span>
                      ) : record.new_plan?.name || '—'}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {record.notes || '—'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
