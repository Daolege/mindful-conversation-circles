
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { memo, useState } from "react";
import { PaginatedContent } from "./common/PaginatedContent";
import { useQuery } from "@tanstack/react-query";
import { getUserSubscriptionHistory } from "@/lib/services/subscriptionService";
import { useAuth } from "@/contexts/authHooks";
import { Loader2, RefreshCcw } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { generateMockSubscriptions } from "@/lib/services/mockDataService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SUBSCRIPTIONS_PER_PAGE = 5;

export const SubscriptionHistory = memo(() => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const { user } = useAuth();
  
  const { data: subscriptions, isLoading, refetch } = useQuery({
    queryKey: ['subscription-history', user?.id],
    queryFn: () => getUserSubscriptionHistory(user?.id || ''),
    enabled: !!user?.id
  });

  const handleGenerateData = async () => {
    if (!user?.id) {
      toast.error('请先登录');
      return;
    }
    
    setIsGeneratingData(true);
    toast.loading('正在生成订阅记录示例数据...');
    
    try {
      const result = await generateMockSubscriptions(user.id);
      
      if (result.success) {
        toast.success('已添加订阅记录示例数据');
        // Refetch subscription data
        refetch();
      } else {
        toast.error('生成订阅记录示例数据失败', {
          description: result.message
        });
      }
    } catch (error) {
      console.error('Error generating subscription data:', error);
      toast.error('生成订阅记录示例数据失败');
    } finally {
      setIsGeneratingData(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const totalSubscriptions = subscriptions?.length || 0;
  const totalPages = Math.ceil(totalSubscriptions / SUBSCRIPTIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * SUBSCRIPTIONS_PER_PAGE;
  const displaySubscriptions = subscriptions?.slice(startIndex, startIndex + SUBSCRIPTIONS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy年MM月dd日', { locale: zhCN });
    } catch (e) {
      return dateString;
    }
  };

  const getChangeTypeText = (changeType: string) => {
    const types = {
      'new': '新订阅',
      'upgrade': '升级订阅',
      'downgrade': '降级订阅',
      'renew': '续订',
      'cancel': '取消订阅'
    };
    return types[changeType as keyof typeof types] || '计划变更';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="text-lg font-semibold">订阅历史</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleGenerateData}
          disabled={isGeneratingData}
          className="flex items-center gap-2 hover:bg-knowledge-primary hover:text-white transition-all duration-200"
        >
          {isGeneratingData ? (
            <>
              <RefreshCcw className="h-4 w-4 animate-spin" />
              <span>生成中...</span>
            </>
          ) : (
            <>
              <RefreshCcw className="h-4 w-4" />
              <span>添加示例订阅数据</span>
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          {displaySubscriptions && displaySubscriptions.length > 0 ? (
            <PaginatedContent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            >
              <div className="space-y-4">
                {displaySubscriptions.map((subscription) => (
                  <div key={subscription.id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">
                          {subscription.new_plan?.name || '未知订阅'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          变更类型: {getChangeTypeText(subscription.change_type)}
                        </p>
                        <p className="text-sm text-gray-500">
                          生效时间: {formatDate(subscription.effective_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {subscription.amount} {subscription.currency.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </PaginatedContent>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-6">暂无订阅历史记录</p>
              <p className="text-sm text-muted-foreground mb-6">点击上方"添加示例订阅数据"按钮生成演示数据</p>
            </div>
          )}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
});

SubscriptionHistory.displayName = 'SubscriptionHistory';
