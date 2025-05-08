
import React, { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';

interface HomeworkSubmissionsDetailProps {
  courseId: number;
  lectureId: string;
  lectureTitle: string;
  onViewSubmission: (submissionId: string) => void;
  onBack?: () => void; // Make onBack optional to accommodate both use cases
}

const HomeworkSubmissionsDetail: React.FC<HomeworkSubmissionsDetailProps> = ({
  courseId,
  lectureId,
  lectureTitle,
  onViewSubmission,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<string>('submitted');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<string | null>(null);
  
  // Fetch all homework assignments for this lecture
  const { data: homeworkAssignments, isLoading: isLoadingHomework } = useQuery({
    queryKey: ['lecture-homework-assignments', lectureId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homework')
        .select('id, title, type, description')
        .eq('lecture_id', lectureId)
        .order('position', { ascending: true });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!lectureId,
  });

  // Set the first homework as selected when the data loads
  useEffect(() => {
    if (homeworkAssignments && homeworkAssignments.length > 0 && !selectedHomeworkId) {
      setSelectedHomeworkId(homeworkAssignments[0].id);
    }
  }, [homeworkAssignments, selectedHomeworkId]);

  // Get the currently selected homework title
  const selectedHomeworkTitle = homeworkAssignments?.find(hw => hw.id === selectedHomeworkId)?.title || '作业';
  
  // Fetch submissions for the selected homework
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['homework-submissions-detail', selectedHomeworkId],
    queryFn: async () => {
      if (!selectedHomeworkId) return [];
      
      const { data, error } = await supabase
        .from('homework_submissions')
        .select(`
          id,
          user_id,
          created_at,
          submitted_at
        `)
        .eq('homework_id', selectedHomeworkId);
        
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
    enabled: !!selectedHomeworkId && activeTab === 'submitted',
  });

  // Fetch students who haven't submitted homework for the selected assignment
  const { data: notSubmittedStudents, isLoading: isLoadingNotSubmitted } = useQuery({
    queryKey: ['not-submitted-students', selectedHomeworkId, courseId],
    queryFn: async () => {
      if (!selectedHomeworkId) return [];
      
      // 1. Get all enrolled students
      const { data: enrolledStudents, error: enrolledError } = await supabase
        .from('course_enrollments')
        .select('user_id')
        .eq('course_id', courseId);
        
      if (enrolledError) throw enrolledError;
      
      // 2. Get students who submitted the selected homework
      const { data: submittedStudents, error: submittedError } = await supabase
        .from('homework_submissions')
        .select('user_id')
        .eq('homework_id', selectedHomeworkId);
        
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
    enabled: !!selectedHomeworkId && activeTab === 'not-submitted',
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
    const selectedAssignment = homeworkAssignments?.find(hw => hw.id === selectedHomeworkId);
    if (!selectedAssignment) return;
    
    if (activeTab === 'submitted') {
      // Format submitted data for export
      const exportData = submissions?.map(submission => ({
        '用户名': submission.user_name || '未知用户',
        '邮箱': submission.user_email || '',
        '提交时间': formatDateTime(submission.created_at)
      })) || [];
      
      await ExcelExportService.exportToExcel(
        exportData, 
        `课程${courseId}_${lectureTitle}_${selectedAssignment.title}_已提交作业`
      );
    } else {
      // Format not submitted data for export
      const exportData = notSubmittedStudents?.map(student => ({
        '用户名': student.full_name || '未知用户',
        '邮箱': student.email || ''
      })) || [];
      
      await ExcelExportService.exportToExcel(
        exportData, 
        `课程${courseId}_${lectureTitle}_${selectedAssignment.title}_未提交作业学生`
      );
    }
    
    toast.success('导出成功', { description: 'Excel文件已成功下载' });
  };
  
  // Determine if we're still loading data
  const isLoading = isLoadingHomework || 
    (activeTab === 'submitted' && isLoadingSubmissions) || 
    (activeTab === 'not-submitted' && isLoadingNotSubmitted);

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{lectureTitle} 作业提交情况</h2>
        
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            返回作业概览
          </Button>
        )}
      </div>
      
      {/* Homework Assignment Selector */}
      {homeworkAssignments && homeworkAssignments.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">选择作业</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={selectedHomeworkId || ''}
              onValueChange={(value) => setSelectedHomeworkId(value)}
              className="w-full"
            >
              <TabsList className="w-full">
                {homeworkAssignments.map((homework) => (
                  <TabsTrigger key={homework.id} value={homework.id} className="flex-1">
                    <div className="flex flex-col items-center">
                      <span className="font-medium">{homework.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {homework.type === 'text' ? '文本作业' : 
                         homework.type === 'file' ? '文件作业' : 
                         homework.type === 'quiz' ? '测验' : '作业'}
                      </span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      {/* Show message when no homework assignments */}
      {homeworkAssignments && homeworkAssignments.length === 0 && !isLoadingHomework && (
        <Card className="mb-4">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">该课时暂无作业</p>
          </CardContent>
        </Card>
      )}
      
      {/* Loading state for homework assignments */}
      {isLoadingHomework && (
        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Submissions Tabs */}
      {selectedHomeworkId && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="submitted">已提交</TabsTrigger>
            <TabsTrigger value="not-submitted">未提交</TabsTrigger>
          </TabsList>
          
          {/* Submitted homework tab */}
          <TabsContent value="submitted" className="mt-4">
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle>{selectedHomeworkTitle} - 已提交作业</CardTitle>
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
                {isLoading ? (
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
                <CardTitle>{selectedHomeworkTitle} - 未提交作业学生</CardTitle>
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
                {isLoading ? (
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
      )}
    </div>
  );
};

export default HomeworkSubmissionsDetail;
