
import React, { useState } from 'react';
import { useAuth } from "@/contexts/authHooks";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HomeworkSubmissionList } from "@/components/admin/homework/HomeworkSubmissionList";
import { AdminBreadcrumb } from "@/components/admin/homework/AdminBreadcrumb";
import { getHomeworkSubmissionsByLectureId } from "@/lib/services/homeworkSubmissionService";

const StudentHomeworkPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { lectureId } = useParams<{ lectureId: string }>();

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

  // Fetch lecture information to get course ID
  const { data: lectureData, isLoading: isLectureLoading } = useQuery({
    queryKey: ['lecture-data', lectureId],
    queryFn: async () => {
      if (!lectureId) return null;
      
      const { data, error } = await supabase
        .from('lectures')
        .select('course_id, title, sections(title)')
        .eq('id', lectureId)
        .single();
        
      if (error) {
        console.error('Error fetching lecture data:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!lectureId && isAdmin === true
  });
  
  // Fetch homework submissions for this lecture
  const { 
    data: submissions,
    isLoading: isLoadingSubmissions 
  } = useQuery({
    queryKey: ['homework-submissions-lecture', lectureId],
    queryFn: () => getHomeworkSubmissionsByLectureId(lectureId || ''),
    enabled: !!lectureId && isAdmin === true && !!lectureData?.course_id,
  });

  // Redirect if not admin
  React.useEffect(() => {
    if (!loading && !isAdminLoading && !isAdmin) {
      toast.error('权限不足', { description: '需要管理员权限访问此页面' });
      navigate('/');
    }
  }, [isAdmin, isAdminLoading, loading, navigate]);

  if (loading || isAdminLoading || isLectureLoading || isLoadingSubmissions) {
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

  // Group submissions by student
  const studentSubmissions = submissions ? submissions.reduce((acc, submission) => {
    const studentId = submission.user_id;
    if (!acc[studentId]) {
      acc[studentId] = {
        userId: studentId,
        name: submission.user_name || submission.profiles?.full_name || '未知学生',
        email: submission.user_email || submission.profiles?.email || '',
        submissions: []
      };
    }
    acc[studentId].submissions.push(submission);
    return acc;
  }, {}) : {};

  const courseId = lectureData?.course_id;
  const lectureTitle = lectureData?.title || '未知讲座';
  const sectionTitle = lectureData?.sections?.title || '未知章节';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <AdminBreadcrumb 
          items={[
            { label: '后台管理', href: '/admin' },
            { label: '课程管理', href: '/admin/courses-new' },
            { label: `课程 ${courseId}`, href: `/admin/courses-new/${courseId}` },
            { label: '作业管理', href: `/admin/homework-submissions/${courseId}` },
            { label: '讲座作业' }
          ]} 
        />
        <div className="mt-6">
          <h1 className="text-2xl font-bold mb-4">
            {sectionTitle} - {lectureTitle} 作业提交情况
          </h1>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">已提交作业的学生</h2>
            {Object.values(studentSubmissions).length > 0 ? (
              <div className="overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        学生
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        提交数量
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.values(studentSubmissions).map((student: any) => (
                      <tr key={student.userId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {student.submissions.length}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button 
                            onClick={() => navigate(`/admin/homework-submission/${student.submissions[0].id}`)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            查看作业
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                暂无学生提交作业
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentHomeworkPage;
