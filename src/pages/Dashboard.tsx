
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
import { useTranslations } from "@/hooks/useTranslations";

const Dashboard = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const { t } = useTranslations();
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

  // Animation variants - matching Admin.tsx
  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeInOut"
      }
    },
    exit: { 
      opacity: 0,
      y: -10,
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  // Main content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'courses':
        return (
          <motion.div
            key="courses"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <SimpleCourseTab />
          </motion.div>
        );
      case 'orders':
        return (
          <motion.div
            key="orders"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <OrderHistoryView />
          </motion.div>
        );
      case 'subscriptions':
        return (
          <motion.div
            key="subscriptions"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <SubscriptionHistory />
          </motion.div>
        );
      case 'profile':
        return (
          <motion.div
            key="profile"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ProfileManagement />
          </motion.div>
        );
      default:
        return (
          <motion.div
            key="not-found"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">{t('errors:pageNotFound')}</h2>
              <p>{t('dashboard:selectValidTab')}</p>
            </Card>
          </motion.div>
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
          <h1 className="text-3xl font-bold">{t('navigation:userCenter')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('dashboard:welcomeBack', { name: user?.user_metadata?.name || user?.email })}
          </p>
        </motion.div>
        
        <DashboardNavigation />

        <AnimatePresence mode="wait">
          {renderTabContent()}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
