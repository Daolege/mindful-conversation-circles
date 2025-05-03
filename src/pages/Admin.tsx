import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/authHooks";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Loader2, LayoutDashboard, Users, BookOpen, ShoppingCart, Repeat, Settings, HelpCircle } from "lucide-react";
import { UserManagement } from "@/components/admin/UserManagement";
import { OrderManagement } from "@/components/admin/OrderManagement";
import { DashboardStatistics } from "@/components/admin/DashboardStatistics";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { CourseManagement } from "@/components/admin/CourseManagement";
import CourseManagementNew from "@/components/admin/CourseManagementNew";
import { SubscriptionPlanManagement } from "@/components/admin/SubscriptionPlanManagement";
import { MultilangFAQManagement } from "@/components/admin/MultilangFAQManagement";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from '@/hooks/useTranslations';

const Admin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const redirectAttemptedRef = useRef(false);
  const successToastShownRef = useRef(false);
  const { t } = useTranslations();
  
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || "overview");

  const operation = searchParams.get('operation');
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Admin page visible, refreshing URL params");
        const currentParams = new URLSearchParams(window.location.search);
        const currentTab = currentParams.get('tab') || 'overview';
        if (currentTab !== activeTab) {
          console.log("Tab mismatch detected, updating to:", currentTab);
          setActiveTab(currentTab);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeTab]);
  
  useEffect(() => {
    console.log("Admin component rendered with tab:", tabFromUrl);
    console.log("URL search params:", Object.fromEntries(searchParams.entries()));
    console.log("Current location:", location.pathname + location.search);
    
    if (tabFromUrl && tabFromUrl !== activeTab) {
      console.log("Setting active tab to:", tabFromUrl);
      setActiveTab(tabFromUrl);
    }
    
    if (operation === 'courseSaved' && !successToastShownRef.current) {
      console.log("Showing course saved toast");
      toast.success("课程保存成功");
      successToastShownRef.current = true;
      
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('operation');
      setSearchParams(newParams, { replace: true });
      
      setTimeout(() => {
        successToastShownRef.current = false;
      }, 2000);
    }
  }, [tabFromUrl, operation, searchParams, setSearchParams, activeTab, location]);
  
  useEffect(() => {
    const handlePopState = () => {
      console.log("Browser navigation detected, refreshing tab state");
      const currentParams = new URLSearchParams(window.location.search);
      const currentTab = currentParams.get('tab') || 'overview';
      if (currentTab !== activeTab) {
        setActiveTab(currentTab);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeTab]);
  
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['admin-role', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      try {
        const { data, error } = await supabase.rpc('has_role', { role: 'admin' });
        if (error) {
          console.error('Error checking admin role:', error);
          return false;
        }
        return !!data;
      } catch (err) {
        console.error('Error in admin role check:', err);
        return false;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (!isLoading && user && isAdmin === false && !redirectAttemptedRef.current) {
      redirectAttemptedRef.current = true;
      toast.error(t('errors:insufficientPermissions'), { description: t('errors:adminAccessRequired') });
      navigate('/');
    }
  }, [isAdmin, isLoading, navigate, user, t]);
  
  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value);
    setActiveTab(value);
    navigate(`/admin?tab=${value}`, { replace: true });
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="animate-spin h-6 w-6 text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-xl text-gray-600">{t('errors:adminAreaRestricted')}</div>
        </div>
        <Footer />
      </div>
    );
  }

  // Define the admin tabs with their Lucide icons
  const adminTabs = [
    { value: "overview", label: t('admin:overview'), icon: LayoutDashboard },
    { value: "users", label: t('admin:usersManagement'), icon: Users },
    { value: "courses", label: t('admin:coursesManagement'), icon: BookOpen },
    { value: "courses-new", label: t('admin:coursesManagement2'), icon: BookOpen },
    { value: "orders", label: t('admin:ordersManagement'), icon: ShoppingCart },
    { value: "subscriptions", label: t('admin:subscriptionsManagement'), icon: Repeat },
    { value: "faqs", label: t('admin:faqManagement'), icon: HelpCircle },
    { value: "settings", label: t('admin:systemSettings'), icon: Settings }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-bold mb-8 text-knowledge-primary"
        >
          {t('admin:adminPanel')}
        </motion.h1>
        
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="w-full"
          defaultValue={activeTab}
        >
          <TabsList className="mb-8 w-full flex flex-wrap justify-start gap-2 bg-gray-50/90 p-4 border-2 border-gray-200 rounded-2xl shadow-md">
            {adminTabs.map(tab => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="flex-1 px-8 py-4 text-base font-medium min-w-[140px] relative overflow-hidden"
              >
                <tab.icon className="mr-2 h-5 w-5 text-gray-500" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <TabsContent value="overview">
                    <DashboardStatistics />
                  </TabsContent>
                </motion.div>
              )}
              
              {activeTab === "users" && (
                <motion.div
                  key="users"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <TabsContent value="users">
                    <UserManagement />
                  </TabsContent>
                </motion.div>
              )}

              {activeTab === "courses" && (
                <motion.div
                  key="courses"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <TabsContent value="courses">
                    <CourseManagement />
                  </TabsContent>
                </motion.div>
              )}
              
              {activeTab === "courses-new" && (
                <motion.div
                  key="courses-new"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <TabsContent value="courses-new">
                    <CourseManagementNew />
                  </TabsContent>
                </motion.div>
              )}
              
              {activeTab === "orders" && (
                <motion.div
                  key="orders"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <TabsContent value="orders">
                    <OrderManagement />
                  </TabsContent>
                </motion.div>
              )}
              
              {activeTab === "subscriptions" && (
                <motion.div
                  key="subscriptions"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <TabsContent value="subscriptions">
                    <SubscriptionPlanManagement />
                  </TabsContent>
                </motion.div>
              )}
              
              {activeTab === "faqs" && (
                <motion.div
                  key="faqs"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <TabsContent value="faqs">
                    <MultilangFAQManagement />
                  </TabsContent>
                </motion.div>
              )}
              
              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <TabsContent value="settings">
                    <AdminSettings />
                  </TabsContent>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
