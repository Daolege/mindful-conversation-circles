
import React from 'react';
import { useAuth } from "@/contexts/authHooks";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HomeworkSubmissionDetail } from "@/components/admin/homework/HomeworkSubmissionDetail";
import { AdminBreadcrumb } from "@/components/admin/homework/AdminBreadcrumb";

const HomeworkSubmissionDetailPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { courseId, submissionId } = useParams<{ courseId: string; submissionId: string }>();

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
        console.error('Error checking admin role:', err);
        return false;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    gcTime: 10 * 60 * 1000,
  });

  // 如果不是管理员，重定向到首页
  React.useEffect(() => {
    if (!loading && !isLoading && !isAdmin) {
      toast.error('权限不足', { description: '需要管理员权限访问此页面' });
      navigate('/');
    }
  }, [isAdmin, isLoading, loading, navigate]);

  if (loading || isLoading) {
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
          <div className="text-xl text-gray-600">此页面仅管理员可访问</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!submissionId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8">
          <div className="text-xl text-gray-600">未找到指定的作业提交</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <AdminBreadcrumb 
          items={[
            { label: '后台管理', href: '/admin' },
            { label: '课程管理', href: '/admin/courses-new' },
            { label: `课程 ${courseId}`, href: `/admin/courses-new/${courseId}` },
            { label: '作业管理', href: `/admin/courses-new/${courseId}/homework` },
            { label: '作业详情' }
          ]} 
        />
        <div className="mt-6">
          <HomeworkSubmissionDetail 
            submissionId={submissionId} 
            onViewStudent={(userId) => navigate(`/admin/courses-new/${courseId}/homework/student/${userId}`)}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomeworkSubmissionDetailPage;
