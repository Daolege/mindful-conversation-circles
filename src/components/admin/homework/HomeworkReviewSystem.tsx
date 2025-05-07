
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

import { getCourseStructureForHomework } from '@/lib/services/homeworkSubmissionService';
import { HomeworkBreadcrumb } from './HomeworkBreadcrumb';
import { CourseStructureNavigation } from './CourseStructureNavigation';
import { HomeworkSubmissionsList } from './HomeworkSubmissionsList';
import { StudentsList } from './StudentsList';

// Component props
interface HomeworkReviewSystemProps {
  courseId: number;
}

export const HomeworkReviewSystem: React.FC<HomeworkReviewSystemProps> = ({ courseId }) => {
  // State for selected lecture
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string>('submissions');

  // Fetch course structure
  const { data: courseSections, isLoading, error } = useQuery({
    queryKey: ['course-structure', courseId],
    queryFn: () => getCourseStructureForHomework(courseId),
    enabled: !!courseId,
  });

  // Handle selecting a lecture
  const handleSelectLecture = (lectureId: string) => {
    setSelectedLectureId(lectureId);
    setSelectedStudentId(null); // Reset selected student when changing lecture
  };

  // Handle selecting a student
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>获取课程结构时出错，请重试</AlertDescription>
      </Alert>
    );
  }

  // Get lecture details if one is selected
  let selectedLectureTitle = '';
  let selectedSectionTitle = '';
  
  if (selectedLectureId) {
    // Find the lecture title and section title
    courseSections?.forEach(section => {
      section.lectures.forEach(lecture => {
        if (lecture.id === selectedLectureId) {
          selectedLectureTitle = lecture.title;
          selectedSectionTitle = section.title;
        }
      });
    });
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
      <HomeworkBreadcrumb 
        courseId={courseId}
        sectionTitle={selectedSectionTitle}
        lectureTitle={selectedLectureTitle}
        studentId={selectedStudentId}
        onClearLecture={() => setSelectedLectureId(null)}
        onClearStudent={() => setSelectedStudentId(null)}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar - Course structure navigation */}
        <div className="lg:col-span-1">
          <CourseStructureNavigation 
            sections={courseSections || []} 
            selectedLectureId={selectedLectureId}
            onSelectLecture={handleSelectLecture}
          />
        </div>
        
        {/* Main content area */}
        <div className="lg:col-span-3">
          {!selectedLectureId ? (
            <Card>
              <CardHeader>
                <CardTitle>课程作业概览</CardTitle>
                <CardDescription>请从左侧选择课程小节以查看作业提交情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-40 text-gray-400">
                  请选择小节查看作业提交情况
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs value={activeView} onValueChange={setActiveView}>
              <TabsList className="mb-4">
                <TabsTrigger value="submissions">作业提交列表</TabsTrigger>
                <TabsTrigger value="students">学生列表</TabsTrigger>
              </TabsList>
              
              <TabsContent value="submissions">
                <HomeworkSubmissionsList 
                  lectureId={selectedLectureId}
                  courseId={courseId}
                  onSelectStudent={handleSelectStudent}
                />
              </TabsContent>
              
              <TabsContent value="students">
                <StudentsList 
                  lectureId={selectedLectureId} 
                  courseId={courseId} 
                  onSelectStudent={handleSelectStudent}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeworkReviewSystem;
