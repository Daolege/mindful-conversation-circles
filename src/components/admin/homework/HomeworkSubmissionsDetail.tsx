
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Search, FileSpreadsheet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HomeworkSubmissionsList } from './HomeworkSubmissionsList';
import { NotSubmittedStudentsList } from './NotSubmittedStudentsList';
import { ExcelExportService } from './ExcelExportService';
import { StudentHomeworkDetail } from './StudentHomeworkDetail';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface HomeworkSubmissionsDetailProps {
  courseId: number;
  lectureId: string;
  lectureTitle: string;
  onBack: () => void;
}

const HomeworkSubmissionsDetail: React.FC<HomeworkSubmissionsDetailProps> = ({ 
  courseId,
  lectureId,
  lectureTitle,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<string>('submitted');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Fetch submissions data
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['homework-submissions-detail', lectureId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homework_submissions')
        .select(`
          id,
          user_id,
          created_at,
          submitted_at,
          status
        `)
        .eq('lecture_id', lectureId);
        
      if (error) throw error;

      // For each submission, fetch user data
      const submissionsWithUserData = await Promise.all((data || []).map(async (submission) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', submission.user_id)
          .single();
          
        return {
          ...submission,
          user_name: profileData?.full_name || '未知用户',
          user_email: profileData?.email || ''
        };
      }));
      
      return submissionsWithUserData || [];
    },
    enabled: !!lectureId && activeTab === 'submitted' && !selectedSubmissionId,
  });

  // Handle select student for submitted homework
  const handleSelectStudent = async (userId: string) => {
    try {
      // Find the submission for this user and lecture
      const { data, error } = await supabase
        .from('homework_submissions')
        .select('id')
        .eq('user_id', userId)
        .eq('lecture_id', lectureId)
        .single();
        
      if (error) throw error;
      
      if (data?.id) {
        setSelectedSubmissionId(data.id);
      }
    } catch (error) {
      console.error('Error finding homework submission:', error);
      toast.error('无法加载学生作业');
    }
  };

  // Go back to submissions list
  const handleBackToList = () => {
    setSelectedSubmissionId(null);
    queryClient.invalidateQueries({ queryKey: ['homework-submissions-detail', lectureId] });
  };

  // Export data to Excel based on active tab
  const handleExportExcel = async () => {
    if (activeTab === 'submitted') {
      // Format submitted data for export
      const exportData = submissions?.map(submission => ({
        '用户名': submission.user_name || '未知用户',
        '邮箱': submission.user_email || '',
        '提交时间': new Date(submission.created_at).toLocaleString(),
        '状态': submission.status === 'pending' ? '待审核' : 
               submission.status === 'reviewed' ? '已通过' : '未通过'
      })) || [];
      
      await ExcelExportService.exportToExcel(
        exportData, 
        `课程${courseId}_${lectureTitle}_已提交作业`
      );
    } else {
      // 直接使用 NotSubmittedStudentsList 组件的逻辑获取数据
      try {
        // 1. Get all enrolled students
        const { data: enrolledStudents, error: enrolledError } = await supabase
          .from('course_enrollments')
          .select('user_id')
          .eq('course_id', courseId);
          
        if (enrolledError) {
          console.error('Error fetching enrolled students:', enrolledError);
          throw enrolledError;
        }
        
        // 2. Get students who submitted homework
        const { data: submittedStudents, error: submittedError } = await supabase
          .from('homework_submissions')
          .select('user_id')
          .eq('lecture_id', lectureId);
          
        if (submittedError) {
          console.error('Error fetching submitted students:', submittedError);
          throw submittedError;
        }
        
        // 3. Filter out students who have submitted
        const submittedIds = new Set(submittedStudents?.map(s => s.user_id) || []);
        const notSubmittedUserIds = (enrolledStudents || [])
          .filter(enrollment => !submittedIds.has(enrollment.user_id))
          .map(enrollment => enrollment.user_id);
        
        // 4. Get profile information for not submitted students
        let studentProfiles = [];
        
        if (notSubmittedUserIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', notSubmittedUserIds);
            
          if (profilesError) {
            console.error('Error fetching student profiles:', profilesError);
            throw profilesError;
          }
          
          studentProfiles = profiles || [];
        }
        
        // 5. Format data for export
        const exportData = studentProfiles.map(student => ({
          '用户名': student.full_name || '未知用户',
          '邮箱': student.email || ''
        }));
        
        await ExcelExportService.exportToExcel(
          exportData, 
          `课程${courseId}_${lectureTitle}_未提交作业学生`
        );
      } catch (error) {
        console.error('Error exporting not submitted students:', error);
        toast.error('导出失败', { description: '获取数据时发生错误' });
        return;
      }
    }
    
    toast.success('导出成功', { description: 'Excel文件已成功下载' });
  };

  // If a specific submission is selected, show the detailed view
  if (selectedSubmissionId) {
    return (
      <StudentHomeworkDetail 
        submissionId={selectedSubmissionId}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Back navigation */}
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" />
        返回课程作业完成情况
      </Button>
      
      {/* Page header */}
      <h2 className="text-2xl font-bold">{lectureTitle} 作业提交情况</h2>
      
      {/* Tabs navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="submitted">已提交</TabsTrigger>
          <TabsTrigger value="not-submitted">未提交</TabsTrigger>
        </TabsList>
        
        {/* Submitted homework tab */}
        <TabsContent value="submitted" className="mt-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle>已提交作业</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索用户名或邮箱..."
                    className="pl-8 w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleExportExcel}
                  className="flex items-center gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  导出Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <HomeworkSubmissionsList 
                lectureId={lectureId}
                onSelectStudent={handleSelectStudent}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Not submitted tab */}
        <TabsContent value="not-submitted" className="mt-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle>未提交作业学生</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索用户名或邮箱..."
                    className="pl-8 w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleExportExcel}
                  className="flex items-center gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  导出Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <NotSubmittedStudentsList 
                courseId={courseId}
                lectureId={lectureId}
                searchTerm={searchTerm}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HomeworkSubmissionsDetail;
