
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Search, FileSpreadsheet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HomeworkSubmissionsList } from './HomeworkSubmissionsList';
import { NotSubmittedStudentsList } from './NotSubmittedStudentsList';
import { ExcelExportService } from './ExcelExportService';
import { toast } from 'sonner';

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
  
  // Fetch submissions data
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['homework-submissions-detail', lectureId],
    queryFn: async () => {
      const { data, error } = await fetch(`/api/homework-submissions?lectureId=${lectureId}`)
        .then(res => res.json());
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!lectureId && activeTab === 'submitted',
  });

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
      // Get not submitted students data and format for export
      const { data: notSubmittedData } = await useQuery.fetchQuery({
        queryKey: ['not-submitted-students', courseId, lectureId],
        queryFn: async () => {
          // Use existing NotSubmittedStudentsList data fetching logic
          const { data: enrolledStudents } = await fetch(
            `/api/course-enrollments?courseId=${courseId}`
          ).then(res => res.json());
          
          const { data: submittedStudents } = await fetch(
            `/api/homework-submissions?lectureId=${lectureId}`
          ).then(res => res.json());
          
          // Filter out students who submitted
          const submittedIds = new Set((submittedStudents || []).map(s => s.user_id));
          const notSubmittedUserIds = (enrolledStudents || [])
            .filter(enrollment => !submittedIds.has(enrollment.user_id))
            .map(enrollment => enrollment.user_id);
            
          // Get profiles for not submitted students
          const { data: profiles } = await fetch(
            `/api/user-profiles?userIds=${notSubmittedUserIds.join(',')}`
          ).then(res => res.json());
          
          return profiles || [];
        }
      });
      
      const exportData = notSubmittedData?.map(student => ({
        '用户名': student.full_name || '未知用户',
        '邮箱': student.email || ''
      })) || [];
      
      await ExcelExportService.exportToExcel(
        exportData, 
        `课程${courseId}_${lectureTitle}_未提交作业学生`
      );
    }
    
    toast.success('导出成功', { description: 'Excel文件已成功下载' });
  };

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
                onSelectStudent={(studentId) => {
                  // Handle student selection if needed
                  console.log("Selected student:", studentId);
                }}
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
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HomeworkSubmissionsDetail;
