
import React from 'react';
import { useAuth } from "@/contexts/authHooks";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StudentHomeworkList } from "@/components/admin/homework/StudentHomeworkList";
import { AdminBreadcrumb } from "@/components/admin/homework/AdminBreadcrumb";
import { getHomeworkSubmissionsByStudentId } from "@/lib/services/homeworkSubmissionService";

const StudentHomeworkPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { courseId, studentId } = useParams<{ courseId: string; studentId: string }>();

  // Admin role check
  const { data: isAdmin, isLoading: isAdminLoading } = useQuery({
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

  // Fetch student submissions
  const courseIdNumber = courseId ? parseInt(courseId, 10) : 0;
  
  const { 
    data: studentSubmissions,
    isLoading: isLoadingSubmissions 
  } = useQuery({
    queryKey: ['homework-submissions-student', studentId, courseIdNumber],
    queryFn: () => getHomeworkSubmissionsByStudentId(studentId || '', courseIdNumber),
    enabled: !!studentId && !!courseId && isAdmin === true,
  });

  // Get student info from submissions
  const studentInfo = studentSubmissions && studentSubmissions.length > 0
    ? {
        name: studentSubmissions[0].user_name || 'Unknown Student',
        email: studentSubmissions[0].user_email || ''
      }
    : null;

  // Redirect if not admin
  React.useEffect(() => {
    if (!loading && !isAdminLoading && !isAdmin) {
      toast.error('权限不足', { description: '需要管理员权限访问此页面' });
      navigate('/');
    }
  }, [isAdmin, isAdminLoading, loading, navigate]);

  if (loading || isAdminLoading || isLoadingSubmissions) {
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
            { label: '学生作业' }
          ]} 
        />
        <div className="mt-6">
          <StudentHomeworkList 
            studentId={studentId || ''}
            studentName={studentInfo?.name}
            studentEmail={studentInfo?.email}
            submissions={studentSubmissions || []}
            isLoading={isLoadingSubmissions}
            onViewSubmission={(id) => navigate(`/admin/courses-new/${courseId}/homework/submission/${id}`)}
            onExportPdf={(id) => {
              // Implement PDF export functionality
              toast.info('导出功能开发中', { description: '正在准备PDF导出...' });
            }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentHomeworkPage;
