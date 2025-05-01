
import { useEffect, useState, useRef } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/authHooks";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DashboardNavigation } from "@/components/dashboard/DashboardNavigation";
import { SimpleCourseTab } from "@/components/dashboard/SimpleCourseTab";
import { OrderHistoryView } from "@/components/dashboard/views/OrderHistoryView";
import { SubscriptionHistory } from "@/components/dashboard/SubscriptionHistory";
import { ProfileManagement } from "@/components/dashboard/ProfileManagement";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('tab') || 'courses';
  });
  const authCheckAttempts = useRef(0);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    setActiveTab(searchParams.get('tab') || 'courses');
  }, [location.search]);

  // 添加会话恢复机制
  useEffect(() => {
    if (!user && !loading && authCheckAttempts.current < 2) {
      // 如果没检测到用户但尚未超过尝试次数，尝试刷新会话
      const refreshSession = async () => {
        try {
          const { data } = await supabase.auth.refreshSession();
          if (!data.session) {
            // 如果刷新后仍无会话，标记为会话错误
            setSessionError(true);
          }
        } catch (error) {
          console.error("Session refresh error:", error);
          setSessionError(true);
        } finally {
          authCheckAttempts.current += 1;
        }
      };
      
      refreshSession();
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // 只有在确认无会话或尝试次数用尽后才重定向
  if ((!user && sessionError) || (!user && authCheckAttempts.current >= 2)) {
    return <Navigate to="/auth" state={{ loginRequired: true, from: location.pathname + location.search }} replace />;
  }

  // Simplified animation variants
  const containerVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  // Main content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'courses':
        return <SimpleCourseTab />;
      case 'orders':
        return <OrderHistoryView />;
      case 'subscriptions':
        return <SubscriptionHistory />;
      case 'profile':
        return <ProfileManagement />;
      default:
        return (
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">页面未找到</h2>
            <p>请选择一个有效的选项卡查看内容</p>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">个人中心</h1>
          <p className="text-muted-foreground mt-2">
            欢迎回来，{user?.user_metadata?.name || user?.email}
          </p>
        </motion.div>
        
        <DashboardNavigation />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative"
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
