
import { useState, useEffect } from "react";
import { StatCard } from "@/components/admin/StatCard";
import { QuickActionButton } from "@/components/admin/QuickActionButton";
import {
  ArrowDownToLine,
  RefreshCcw,
  User,
  FileVideo2,
  DollarSign,
  CreditCard,
  Calculator,
  Wallet as WalletIcon,
  CreditCard as CreditCardIcon,
} from "lucide-react";
import { StatsSkeleton } from "@/components/admin/StatsSkeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslations } from "@/hooks/useTranslations";

export const DashboardStatistics = () => {
  const { t } = useTranslations();
  const [isDemo, setIsDemo] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [visibleSections, setVisibleSections] = useState<string[]>([]);

  const { data: stats, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      try {
        if (isDemo) {
          return {
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
          };
        }

        const { data, error } = await supabase.functions.invoke("get-dashboard-stats", {
          body: { isDemo },
        });

        if (error) {
          console.error("Error fetching dashboard stats:", error);
          toast.error(t('errors:fetchStatsFailed'));
          throw error;
        }

        console.log("Dashboard stats received:", data);
        return data;
      } catch (error) {
        console.error("Error in dashboard stats query:", error);
        toast.error(t('errors:fetchStatsFailed'));
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    const demoEnv = import.meta.env.VITE_IS_DEMO;
    setIsDemo(demoEnv === "true");
    
    // Show full skeleton on first load, then use card-level loading states for refreshes
    if (!isLoading && showSkeleton) {
      const timer = setTimeout(() => {
        setShowSkeleton(false);
        // Initially show only the user stats section
        setVisibleSections(["user"]);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading, showSkeleton]);

  // Handle intersection observer for lazy loading sections
  useEffect(() => {
    const sections = ["user", "course", "financial", "payment"];
    
    // Set up intersection observers for each section
    const observers: IntersectionObserver[] = [];
    
    sections.forEach((sectionId) => {
      const element = document.getElementById(`stats-section-${sectionId}`);
      if (!element) return;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !visibleSections.includes(sectionId)) {
            setVisibleSections(prev => [...prev, sectionId]);
          }
        });
      }, { threshold: 0.2 });
      
      observer.observe(element);
      observers.push(observer);
    });
    
    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [visibleSections]);

  const handleExport = () => {
    alert(t('admin:exportFeatureInDevelopment'));
  };

  const handleSync = () => {
    toast.info(t('admin:syncingData'));
    refetch().then(() => {
      toast.success(t('admin:dataSyncSuccess'));
    }).catch(() => {
      toast.error(t('admin:dataSyncFailed'));
    });
  };

  const getPaymentTypeInfo = (type: string) => {
    switch (type) {
      case 'alipay':
        return { icon: WalletIcon, name: t('admin:alipay') };
      case 'wechat':
        return { icon: WalletIcon, name: t('admin:wechatPay') };
      case 'creditcard':
        return { icon: CreditCardIcon, name: t('admin:creditCard') };
      case 'bank':
        return { icon: CreditCardIcon, name: t('admin:bankTransfer') };
      default:
        return { icon: DollarSign, name: type || t('admin:otherPaymentMethod') };
    }
  };

  if (showSkeleton && isLoading) {
    return (
      <div className="space-y-12">
        <StatsSkeleton category="user" />
        <StatsSkeleton category="course" />
        <StatsSkeleton category="financial" />
        <StatsSkeleton category="payment" />
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-[1400px] mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">{t('admin:statisticsAnalysis')}</h1>
        <div className="flex gap-2">
          <QuickActionButton icon={ArrowDownToLine} label={t('admin:exportData')} onClick={handleExport} />
          <QuickActionButton icon={RefreshCcw} label={t('admin:syncData')} onClick={handleSync} />
        </div>
      </div>

      {/* 用户统计概览 */}
      <section id="stats-section-user" className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">{t('admin:userStatsOverview')}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StatCard
            title={t('admin:newUsersThisMonth')}
            value={stats?.newUsersThisMonth || 0}
            description={t('admin:newlyRegisteredUsers')}
            icon={User}
            trend={stats?.monthlyUserGrowthRate}
            trendValue={t('admin:growthFromLastMonth')}
            isLoading={isFetching}
            category="user"
          />
          <StatCard
            title={t('admin:newUsersThisYear')}
            value={stats?.newUsersThisYear || 0}
            description={t('admin:newlyRegisteredUsersThisYear')}
            icon={User}
            trend={stats?.yearlyUserGrowthRate}
            trendValue={t('admin:growthFromLastYear')}
            isLoading={isFetching}
            category="user"
          />
          <StatCard
            title={t('admin:totalUsers')}
            value={stats?.totalUsers || 0}
            description={t('admin:allRegisteredUsers')}
            icon={User}
            isLoading={isFetching}
            category="user"
          />
        </div>
      </section>

      {/* 课程统计概览 - 仅在可见时渲染 */}
      {visibleSections.includes("course") && (
        <section id="stats-section-course" className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">{t('admin:courseStatsOverview')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StatCard
              title={t('admin:newCoursesThisMonth')}
              value={stats?.newCoursesThisMonth || 0}
              description={t('admin:newlyLaunchedCoursesThisMonth')}
              icon={FileVideo2}
              trend={stats?.monthlyCoursesGrowthRate}
              trendValue={t('admin:growthFromLastMonth')}
              isLoading={isFetching}
              category="course"
            />
            <StatCard
              title={t('admin:newCoursesThisYear')}
              value={stats?.newCoursesThisYear || 0}
              description={t('admin:newlyLaunchedCoursesThisYear')}
              icon={FileVideo2}
              trend={stats?.yearlyCoursesGrowthRate}
              trendValue={t('admin:growthFromLastYear')}
              isLoading={isFetching}
              category="course"
            />
            <StatCard
              title={t('admin:totalCourses')}
              value={stats?.totalCourses || 0}
              description={t('admin:allLaunchedCourses')}
              icon={FileVideo2}
              isLoading={isFetching}
              category="course"
            />
          </div>
        </section>
      )}

      {/* 如果课程部分不可见，创建一个占位符用于检测滚动 */}
      {!visibleSections.includes("course") && (
        <div id="stats-section-course" className="h-20"></div>
      )}

      {/* 财务统计概览 - 仅在可见时渲染 */}
      {visibleSections.includes("financial") && (
        <section id="stats-section-financial" className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">{t('admin:financialStatsOverview')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <StatCard
              title={t('admin:monthlyRevenue')}
              value={`¥${(stats?.monthlyRevenue || 0).toLocaleString()}`}
              description={t('admin:ordersCount', { count: stats?.monthlyOrders || 0 })}
              icon={DollarSign}
              isLoading={isFetching}
              category="financial"
            />
            <StatCard
              title={t('admin:quarterlyRevenue')}
              value={`¥${(stats?.quarterlyRevenue || 0).toLocaleString()}`}
              description={t('admin:ordersCount', { count: stats?.quarterlyOrders || 0 })}
              icon={CreditCardIcon}
              isLoading={isFetching}
              category="financial"
            />
            <StatCard
              title={t('admin:yearlyRevenue')}
              value={`¥${(stats?.yearlyRevenue || 0).toLocaleString()}`}
              description={t('admin:ordersCount', { count: stats?.yearlyOrders || 0 })}
              icon={Calculator}
              isLoading={isFetching}
              category="financial"
            />
            <StatCard
              title={t('admin:totalRevenue')}
              value={`¥${(stats?.totalRevenue || 0).toLocaleString()}`}
              description={t('admin:ordersCount', { count: stats?.totalOrders || 0 })}
              icon={Calculator}
              isLoading={isFetching}
              category="financial"
            />
          </div>
        </section>
      )}

      {/* 如果财务部分不可见，创建一个占位符用于检测滚动 */}
      {!visibleSections.includes("financial") && (
        <div id="stats-section-financial" className="h-20"></div>
      )}

      {/* 支付方式统计 - 仅在可见时渲染 */}
      {visibleSections.includes("payment") && (
        <section id="stats-section-payment" className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">{t('admin:paymentMethodStats')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {Array.isArray(stats?.paymentStats) && stats?.paymentStats.length > 0 ? (
              stats.paymentStats.map((stat: any, index: number) => {
                const { icon: PaymentIcon, name } = getPaymentTypeInfo(stat.paymentType);
                return (
                  <StatCard
                    key={`${stat.paymentType}-${index}`}
                    title={name}
                    value={`¥${(stat.totalAmount || 0).toLocaleString()}`}
                    description={t('admin:transactionsCount', { count: stat.transactionCount || 0 })}
                    icon={PaymentIcon}
                    isLoading={isFetching}
                    category="payment"
                  />
                );
              })
            ) : (
              <div className="col-span-4 text-center py-8 text-gray-500">
                {t('admin:noPaymentMethodStatsData')}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 如果支付部分不可见，创建一个占位符用于检测滚动 */}
      {!visibleSections.includes("payment") && (
        <div id="stats-section-payment" className="h-20"></div>
      )}
    </div>
  );
};
