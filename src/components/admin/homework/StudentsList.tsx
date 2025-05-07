
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Eye, Search, UserX } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  getStudentsWithoutSubmission, 
  getHomeworkSubmissionsByLectureId 
} from '@/lib/services/homeworkSubmissionService';

interface StudentsListProps {
  lectureId: string;
  courseId: number;
  onSelectStudent: (studentId: string) => void;
}

export const StudentsList: React.FC<StudentsListProps> = ({
  lectureId,
  courseId,
  onSelectStudent
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'not-submitted'>('all');
  
  // Fetch submissions for this lecture
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['homework-submissions', lectureId],
    queryFn: () => getHomeworkSubmissionsByLectureId(lectureId),
    enabled: !!lectureId && activeTab === 'all',
  });

  // Fetch students who haven't submitted homework for this lecture
  const { data: nonSubmitters, isLoading: isLoadingNonSubmitters } = useQuery({
    queryKey: ['non-submitters', lectureId, courseId],
    queryFn: () => getStudentsWithoutSubmission(lectureId, courseId),
    enabled: !!lectureId && !!courseId && activeTab === 'not-submitted',
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Get unique students from submissions
  const uniqueStudents = React.useMemo(() => {
    if (!submissions) return [];
    
    const studentsMap = new Map();
    
    submissions.forEach(submission => {
      if (submission.user_id && !studentsMap.has(submission.user_id)) {
        studentsMap.set(submission.user_id, {
          id: submission.user_id,
          name: submission.user_name || '未知用户',
          email: submission.user_email || '',
        });
      }
    });
    
    return Array.from(studentsMap.values());
  }, [submissions]);

  // Filter students based on search term
  const filteredSubmitters = uniqueStudents.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower)
    );
  });

  // Filter non-submitters based on search term
  const filteredNonSubmitters = nonSubmitters?.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (student.user_name || '').toLowerCase().includes(searchLower) ||
      (student.user_email || '').toLowerCase().includes(searchLower)
    );
  });

  // Handle view student action
  const handleViewStudent = (studentId: string) => {
    onSelectStudent(studentId);
  };

  const isLoading = activeTab === 'all' ? isLoadingSubmissions : isLoadingNonSubmitters;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">学生列表</CardTitle>
        <CardDescription>
          查看该课节的学生作业完成情况
        </CardDescription>

        <div className="mt-4 space-y-4">
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'all' | 'not-submitted')}
          >
            <TabsList className="mb-2">
              <TabsTrigger value="all">已提交学生</TabsTrigger>
              <TabsTrigger value="not-submitted">未提交学生</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="搜索学生姓名或邮箱..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : activeTab === 'all' ? (
          <>
            {filteredSubmitters.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? '没有符合搜索条件的学生' : '暂无学生提交作业'}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>学生姓名</TableHead>
                      <TableHead>邮箱</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmitters.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewStudent(student.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            查看作业
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        ) : (
          <>
            {!filteredNonSubmitters || filteredNonSubmitters.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? '没有符合搜索条件的未提交学生' : '所有学生都已提交作业'}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>学生姓名</TableHead>
                      <TableHead>邮箱</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNonSubmitters.map((student) => (
                      <TableRow key={student.user_id}>
                        <TableCell>{student.user_name || '未知用户'}</TableCell>
                        <TableCell>{student.user_email || ''}</TableCell>
                        <TableCell>
                          <div className="flex items-center text-amber-600">
                            <UserX className="h-4 w-4 mr-1" />
                            未提交
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentsList;
