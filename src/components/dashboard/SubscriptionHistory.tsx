
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { memo, useState } from "react";
import { PaginatedContent } from "./common/PaginatedContent";
import { useQuery } from "@tanstack/react-query";
import { getUserSubscriptionHistory } from "@/lib/services/subscriptionService";
import { useAuth } from "@/contexts/authHooks";
import { Loader2 } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

const SUBSCRIPTIONS_PER_PAGE = 5;

export const SubscriptionHistory = memo(() => {
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['subscription-history', user?.id],
    queryFn: () => getUserSubscriptionHistory(user?.id || ''),
    enabled: !!user?.id
  });

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
    return types[changeType] || '计划变更';
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">订阅历史</h3>
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
            <div className="text-center py-8 text-gray-500">
              暂无订阅历史记录
            </div>
          )}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
});

SubscriptionHistory.displayName = 'SubscriptionHistory';
