
import { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/authHooks";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { DashboardNavigation } from "@/components/dashboard/DashboardNavigation";
import { EnrolledCoursesNew } from "@/components/dashboard/EnrolledCoursesNew";
import { OrderHistoryView } from "@/components/dashboard/views/OrderHistoryView";
import { SubscriptionHistory } from "@/components/dashboard/SubscriptionHistory";
import { ProfileManagement } from "@/components/dashboard/ProfileManagement";
import { motion } from "framer-motion";

const Dashboard = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('tab') || 'courses';  // Changed default from 'overview' to 'courses'
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    setActiveTab(searchParams.get('tab') || 'courses');  // Changed default from 'overview' to 'courses'
  }, [location.search]);

  const { data: coursesWithProgress, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['user-courses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_courses')
        .select(`
          course_id,
          purchased_at,
          courses (*),
          course_progress (
            progress_percent,
            completed,
            last_lecture_id
          )
        `)
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false });
        
      if (error) {
        console.error('Error loading user courses:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Main content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'courses':
        return <EnrolledCoursesNew coursesWithProgress={coursesWithProgress} showAll={true} />;
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

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">个人中心</h1>
          <p className="text-muted-foreground mt-2">
            欢迎回来，{user.user_metadata?.name || user.email}
          </p>
        </motion.div>
        
        <DashboardNavigation />

        <motion.div
          key={activeTab}
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {isLoadingCourses && activeTab === 'courses' ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-knowledge-primary" />
            </div>
          ) : (
            renderTabContent()
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
