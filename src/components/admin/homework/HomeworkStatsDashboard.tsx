
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, FileCheck, FileQuestion, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HomeworkStatsDashboardProps {
  courseId: number;
}

export const HomeworkStatsDashboard: React.FC<HomeworkStatsDashboardProps> = ({ courseId }) => {
  // Fetch statistics for this course
  const { data: stats, isLoading } = useQuery({
    queryKey: ['homework-stats', courseId],
    queryFn: async () => {
      // Get total enrolled students
      const { count: enrolledCount, error: enrolledError } = await supabase
        .from('course_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId);
        
      if (enrolledError) {
        console.error('Error fetching enrollment count:', enrolledError);
        return null;
      }

      // Get total homework submissions
      const { count: submissionsCount, error: submissionsError } = await supabase
        .from('homework_submissions')
        .select('homework_submissions.id', { count: 'exact', head: true })
        .eq('course_id', courseId);
        
      if (submissionsError) {
        console.error('Error fetching submission count:', submissionsError);
        return null;
      }
      
      // Get lectures with homework requirements
      const { data: lecturesData, error: lecturesError } = await supabase
        .from('course_lectures')
        .select(`
          id,
          title,
          section_id,
          course_sections (
            course_id
          )
        `)
        .eq('requires_homework_completion', true)
        .eq('course_sections.course_id', courseId);
        
      if (lecturesError) {
        console.error('Error fetching lectures with homework:', lecturesError);
        return null;
      }
      
      const homeworkLecturesCount = lecturesData?.length || 0;
      
      // Recent submissions (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentCount, error: recentError } = await supabase
        .from('homework_submissions')
        .select('homework_submissions.id', { count: 'exact', head: true })
        .eq('course_id', courseId)
        .gte('created_at', sevenDaysAgo.toISOString());
        
      if (recentError) {
        console.error('Error fetching recent submissions:', recentError);
        return null;
      }

      return {
        enrolledStudents: enrolledCount || 0,
        totalSubmissions: submissionsCount || 0,
        homeworkLectures: homeworkLecturesCount,
        recentSubmissions: recentCount || 0
      };
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }
  
  if (!stats) {
    return (
      <div className="text-center p-8 text-gray-500">
        无法加载统计数据
      </div>
    );
  }
  
  const statCards = [
    {
      title: "已注册学生",
      value: stats.enrolledStudents,
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: "需提交作业章节",
      value: stats.homeworkLectures,
      icon: FileQuestion,
      color: "text-purple-500"
    },
    {
      title: "总作业提交数",
      value: stats.totalSubmissions,
      icon: FileCheck,
      color: "text-green-500"
    },
    {
      title: "近7日提交",
      value: stats.recentSubmissions,
      icon: Clock, 
      color: "text-orange-500"
    }
  ];
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-gray-500">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <card.icon className={`h-8 w-8 ${card.color} mr-3`} />
              <div className="text-2xl font-bold">{card.value}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HomeworkStatsDashboard;
