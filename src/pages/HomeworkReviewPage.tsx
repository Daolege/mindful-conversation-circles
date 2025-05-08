
import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/authHooks";
import { supabase } from "@/integrations/supabase/client";
import { HomeworkViewingSystem } from "@/components/admin/homework/HomeworkViewingSystem";

const HomeworkReviewPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  
  // Check if the user is an admin
  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
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
  });
  
  // Redirect non-admin users
  React.useEffect(() => {
    if (!loading && !isCheckingAdmin && !isAdmin) {
      toast.error("权限不足", { description: "该页面仅限管理员访问" });
      navigate('/');
    }
  }, [isAdmin, isCheckingAdmin, loading, navigate]);
  
  if (loading || isCheckingAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
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
          <div className="text-xl text-gray-600">管理员专用页面</div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">        
        {courseId && (
          <HomeworkViewingSystem courseId={parseInt(courseId, 10)} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default HomeworkReviewPage;
