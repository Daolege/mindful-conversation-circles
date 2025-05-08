
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ExcelExportService } from './ExcelExportService';
import { Avatar } from '@/components/ui/avatar';

interface HomeworkSubmissionsDetailProps {
  courseId: number;
  lectureId: string;
  lectureTitle: string;
  onViewSubmission: (submissionId: string) => void;
}

const HomeworkSubmissionsDetail: React.FC<HomeworkSubmissionsDetailProps> = ({ 
  courseId,
  lectureId,
  lectureTitle,
  onViewSubmission
}) => {
  const [activeTab, setActiveTab] = useState<string>('submitted');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Fetch submissions for this lecture
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['homework-submissions-detail', lectureId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homework_submissions')
        .select(`
          id,
          user_id,
          created_at,
          submitted_at
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
    enabled: !!lectureId && activeTab === 'submitted',
  });

  // Fetch students who haven't submitted homework
  const { data: notSubmittedStudents, isLoading: isLoadingNotSubmitted } = useQuery({
    queryKey: ['not-submitted-students', lectureId, courseId],
    queryFn: async () => {
      // 1. Get all enrolled students
      const { data: enrolledStudents, error: enrolledError } = await supabase
        .from('course_enrollments')
        .select('user_id')
        .eq('course_id', courseId);
        
      if (enrolledError) throw enrolledError;
      
      // 2. Get students who submitted homework
      const { data: submittedStudents, error: submittedError } = await supabase
        .from('homework_submissions')
        .select('user_id')
        .eq('lecture_id', lectureId);
        
      if (submittedError) throw submittedError;
      
      // 3. Filter out students who have submitted
      const submittedIds = new Set(submittedStudents?.map(s => s.user_id) || []);
      const notSubmittedUserIds = (enrolledStudents || [])
        .filter(enrollment => !submittedIds.has(enrollment.user_id))
        .map(enrollment => enrollment.user_id);
      
      // 4. Get profile information for not submitted students
      if (notSubmittedUserIds.length === 0) {
        return [];
      }
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', notSubmittedUserIds);
        
      if (profilesError) throw profilesError;
      
      return profiles || [];
    },
    enabled: !!lectureId && activeTab === 'not-submitted',
  });

  // Filter submissions based on search term
  const filteredSubmissions = submissions?.filter(submission => 
    submission.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Filter not submitted students based on search term
  const filteredNotSubmitted = notSubmittedStudents?.filter(student =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Format date
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '未知时间';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
    } catch (err) {
      return '日期格式错误';
    }
  };

  // Export data to Excel
  const handleExportExcel = async () => {
    if (activeTab === 'submitted') {
      // Format submitted data for export
      const exportData = submissions?.map(submission => ({
        '用户名': submission.user_name || '未知用户',
        '邮箱': submission.user_email || '',
        '提交时间': formatDateTime(submission.created_at)
      })) || [];
      
      await ExcelExportService.exportToExcel(
        exportData, 
        `课程${courseId}_${lectureTitle}_已提交作业`
      );
    } else {
      // Format not submitted data for export
      const exportData = notSubmittedStudents?.map(student => ({
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
              {isLoadingSubmissions ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredSubmissions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>学生</TableHead>
                      <TableHead>邮箱</TableHead>
                      <TableHead>提交时间</TableHead>
                      <TableHead className="w-[100px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center">
                                {submission.user_name?.charAt(0) || '?'}
                              </div>
                            </Avatar>
                            {submission.user_name || '未知用户'}
                          </div>
                        </TableCell>
                        <TableCell>{submission.user_email || ''}</TableCell>
                        <TableCell>{formatDateTime(submission.created_at)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onViewSubmission(submission.id)}
                          >
                            查看
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  {searchTerm ? '没有符合搜索条件的提交' : '暂无学生提交作业'}
                </div>
              )}
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
              {isLoadingNotSubmitted ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredNotSubmitted.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>学生</TableHead>
                      <TableHead>邮箱</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotSubmitted.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center">
                                {student.full_name?.charAt(0) || '?'}
                              </div>
                            </Avatar>
                            {student.full_name || '未知用户'}
                          </div>
                        </TableCell>
                        <TableCell>{student.email || ''}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  {searchTerm ? '没有符合搜索条件的学生' : '所有学生均已提交作业'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HomeworkSubmissionsDetail;
