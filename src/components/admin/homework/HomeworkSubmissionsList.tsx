
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, Search, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { getHomeworkSubmissionsByLectureId } from '@/lib/services/homeworkSubmissionService';
import { HomeworkSubmission } from '@/lib/types/homework';
import { StudentHomeworkList } from './StudentHomeworkList';

interface HomeworkSubmissionsListProps {
  lectureId: string;
  courseId: number;
  onSelectStudent: (studentId: string) => void;
}

export const HomeworkSubmissionsList: React.FC<HomeworkSubmissionsListProps> = ({
  lectureId,
  courseId,
  onSelectStudent
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Fetch homework submissions for this lecture
  const { data: submissions, isLoading, error } = useQuery({
    queryKey: ['homework-submissions', lectureId],
    queryFn: () => getHomeworkSubmissionsByLectureId(lectureId),
    enabled: !!lectureId,
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter submissions based on search term
  const filteredSubmissions = submissions?.filter(submission => {
    const searchLower = searchTerm.toLowerCase();
    return (
      submission.user_name?.toLowerCase().includes(searchLower) ||
      submission.user_email?.toLowerCase().includes(searchLower) ||
      submission.homework?.title?.toLowerCase().includes(searchLower)
    );
  });

  // Get unique students from submissions
  const uniqueStudents = React.useMemo(() => {
    if (!submissions) return [];
    
    const uniqueStudentMap = new Map<string, HomeworkSubmission>();
    
    submissions.forEach(submission => {
      if (submission.user_id && !uniqueStudentMap.has(submission.user_id)) {
        uniqueStudentMap.set(submission.user_id, submission);
      }
    });
    
    return Array.from(uniqueStudentMap.values());
  }, [submissions]);

  // View all submissions from a specific student
  const handleViewStudentSubmissions = (studentId: string, studentName: string) => {
    setSelectedStudentId(studentId);
    onSelectStudent(studentId);
  };

  // Get submissions for a specific student
  const studentSubmissions = React.useMemo(() => {
    if (!selectedStudentId || !submissions) return [];
    return submissions.filter(sub => sub.user_id === selectedStudentId);
  }, [selectedStudentId, submissions]);

  // Handle back button from student view
  const handleBack = () => {
    setSelectedStudentId(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>加载中</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>错误</CardTitle>
          <CardDescription>获取作业提交数据时发生错误</CardDescription>
        </CardHeader>
        <CardContent>
          请重试或联系系统管理员
        </CardContent>
      </Card>
    );
  }

  // Show student's homework submissions if a student is selected
  if (selectedStudentId) {
    const student = uniqueStudents.find(s => s.user_id === selectedStudentId);
    
    return (
      <StudentHomeworkList
        studentId={selectedStudentId}
        studentName={student?.user_name}
        studentEmail={student?.user_email}
        submissions={studentSubmissions}
        isLoading={false}
        onViewSubmission={() => {}}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">作业提交列表</CardTitle>
        <CardDescription>
          查看该课节所有学生的作业提交情况
        </CardDescription>
        <div className="mt-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="搜索学生姓名、邮箱或作业标题..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {uniqueStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无作业提交记录
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>学生姓名</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>提交数量</TableHead>
                  <TableHead>最近提交</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uniqueStudents.map((student) => {
                  // Count submissions for this student
                  const studentSubmissions = submissions?.filter(
                    sub => sub.user_id === student.user_id
                  ) || [];
                  
                  // Get latest submission date
                  const latestSubmission = studentSubmissions.length > 0
                    ? studentSubmissions.reduce((latest, sub) => {
                        if (!latest.submitted_at) return sub;
                        if (!sub.submitted_at) return latest;
                        return new Date(sub.submitted_at) > new Date(latest.submitted_at)
                          ? sub
                          : latest;
                      })
                    : null;
                    
                  return (
                    <TableRow key={student.user_id}>
                      <TableCell>
                        {student.user_name || '未知用户'}
                      </TableCell>
                      <TableCell>
                        {student.user_email || ''}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {studentSubmissions.length} 份作业
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {latestSubmission?.submitted_at ? 
                          format(new Date(latestSubmission.submitted_at), 'yyyy-MM-dd HH:mm') : 
                          '-'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewStudentSubmissions(
                            student.user_id || '', 
                            student.user_name || '未知用户'
                          )}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          查看作业
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HomeworkSubmissionsList;
