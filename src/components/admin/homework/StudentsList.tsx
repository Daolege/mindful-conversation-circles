
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getHomeworkSubmissionsByStudentId } from '@/lib/services/homeworkSubmissionService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HomeworkSubmissionDetail } from './HomeworkSubmissionDetail';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface StudentsListProps {
  studentId: string;
  lectureId?: string;
  onBack?: () => void; // 添加返回回调函数
}

const StudentsList: React.FC<StudentsListProps> = ({ 
  studentId, 
  lectureId,
  onBack
}) => {
  const navigate = useNavigate();
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  // 从URL中获取courseId
  const pathParts = window.location.pathname.split('/');
  const courseIdMatch = pathParts.find(part => /^\d+$/.test(part));
  const courseId = courseIdMatch ? parseInt(courseIdMatch, 10) : null;

  // 获取学生的所有作业提交
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['student-homework-submissions', studentId, courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const data = await getHomeworkSubmissionsByStudentId(studentId, courseId);
      
      // 如果指定了lectureId，过滤出该讲座的提交
      if (lectureId) {
        return data.filter(sub => sub.lecture_id === lectureId);
      }
      
      return data;
    },
    enabled: !!studentId && !!courseId,
  });

  // 如果有提交并且还没有选择，默认选择第一个
  React.useEffect(() => {
    if (submissions && submissions.length > 0 && !selectedSubmissionId) {
      setSelectedSubmissionId(submissions[0].id);
    }
  }, [submissions, selectedSubmissionId]);

  // 处理导航到上一个或下一个提交
  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!submissions || submissions.length <= 1) return;
    
    const currentIndex = submissions.findIndex(sub => sub.id === selectedSubmissionId);
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % submissions.length;
    } else {
      newIndex = (currentIndex - 1 + submissions.length) % submissions.length;
    }
    
    setSelectedSubmissionId(submissions[newIndex].id);
  };

  // 处理返回列表
  const handleBackToList = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          size="sm"
          className="mb-4"
          onClick={handleBackToList}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回学生列表
        </Button>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          size="sm"
          className="mb-4"
          onClick={handleBackToList}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回学生列表
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>学生作业</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">该学生尚未提交作业</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {selectedSubmissionId && (
        <HomeworkSubmissionDetail
          submissionId={selectedSubmissionId}
          onNavigatePrev={() => handleNavigate('prev')}
          onNavigateNext={() => handleNavigate('next')}
          hasNext={submissions.length > 1}
          hasPrev={submissions.length > 1}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
};

export default StudentsList;
