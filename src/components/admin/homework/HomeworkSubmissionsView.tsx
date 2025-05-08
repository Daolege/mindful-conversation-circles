
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from "react-router-dom";
import { CourseOutlineNavigation } from './CourseOutlineNavigation';
import { HomeworkSubmissionsList } from './HomeworkSubmissionsList';
import { HomeworkSubmissionDetail } from './HomeworkSubmissionDetail';
import { StudentHomeworkList } from './StudentHomeworkList';
import { NotSubmittedStudentsList } from './NotSubmittedStudentsList';
import { HomeworkStatsDashboard } from './HomeworkStatsDashboard';
import { AdminBreadcrumb } from './AdminBreadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  getCourseStructureForHomework,
  getHomeworkSubmissionsByCourseId,
  getHomeworkByLectureId
} from '@/lib/services/homeworkSubmissionService';

// Define a local type for course sections
export type CourseSection = {
  id: string;
  title: string;
  position: number;
  lectures: {
    id: string;
    title: string;
    position: number;
    requires_homework_completion: boolean;
  }[];
};

export const HomeworkSubmissionsView = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<string>('submissions');
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  
  // Convert courseId to number
  const courseIdNumber = courseId ? parseInt(courseId, 10) : 0;

  // Reset tabs when changing selections
  useEffect(() => {
    if (selectedHomeworkId) {
      setActiveTab('submissions');
    } else if (selectedStudentId) {
      setActiveTab('student');
    } else if (selectedSubmissionId) {
      setActiveTab('detail');
    }
  }, [selectedHomeworkId, selectedStudentId, selectedSubmissionId]);

  // Fetch course structure for navigation
  const { 
    data: courseSectionsData, 
    isLoading: isLoadingStructure 
  } = useQuery({
    queryKey: ['course-structure-homework', courseIdNumber],
    queryFn: () => getCourseStructureForHomework(courseIdNumber),
    enabled: !!courseIdNumber && courseIdNumber > 0,
  });
  
  // Transform the fetched data to ensure it matches the expected type
  const sections: CourseSection[] = React.useMemo(() => {
    if (!courseSectionsData) return [];
    
    return courseSectionsData.map(section => ({
      id: section.id,
      title: section.title,
      position: section.position,
      lectures: section.lectures.map(lecture => ({
        id: lecture.id,
        title: lecture.title,
        position: lecture.position,
        requires_homework_completion: lecture.requires_homework_completion
      })).sort((a, b) => a.position - b.position)
    })).sort((a, b) => a.position - b.position);
  }, [courseSectionsData]);

  // Fetch all submissions for the course
  const { 
    data: allSubmissions, 
    isLoading: isLoadingAll 
  } = useQuery({
    queryKey: ['homework-submissions-course', courseIdNumber],
    queryFn: () => getHomeworkSubmissionsByCourseId(courseIdNumber),
    enabled: !!courseIdNumber && courseIdNumber > 0,
  });

  // Fetch homeworks by lecture to display in the course outline
  const { 
    data: homeworkByLectureMap,
    isLoading: isLoadingHomeworks
  } = useQuery({
    queryKey: ['homeworks-by-lecture', courseIdNumber],
    queryFn: async () => {
      const result: Record<string, any[]> = {};
      
      if (!courseSectionsData) return result;
      
      // Gather all lecture IDs
      const lectureIds = courseSectionsData.flatMap(section => 
        section.lectures.map(lecture => lecture.id)
      );
      
      // Fetch homeworks for each lecture
      for (const lectureId of lectureIds) {
        const homeworks = await getHomeworkByLectureId(lectureId, courseIdNumber);
        if (homeworks.length > 0) {
          result[lectureId] = homeworks;
        }
      }
      
      return result;
    },
    enabled: !!courseSectionsData && !!courseIdNumber && courseIdNumber > 0,
  });

  // Add submission statistics to homeworks
  const homeworkByLecture = React.useMemo(() => {
    if (!homeworkByLectureMap) return {};
    if (!allSubmissions) return homeworkByLectureMap;
    
    const result: Record<string, any[]> = {};
    
    // Process each lecture's homeworks
    Object.entries(homeworkByLectureMap).forEach(([lectureId, homeworks]) => {
      result[lectureId] = homeworks.map(homework => {
        // Count submissions for this homework
        const submissions = allSubmissions.filter(s => s.homework_id === homework.id) || [];
        
        return {
          ...homework,
          submissionStats: {
            total: submissions.length
          }
        };
      });
    });
    
    return result;
  }, [homeworkByLectureMap, allSubmissions]);

  // Handle lecture selection
  const handleLectureSelect = (lectureId: string) => {
    setSelectedLectureId(lectureId);
    setSelectedHomeworkId(null);
    setSelectedStudentId(null);
    setSelectedSubmissionId(null);
  };

  // Handle homework selection
  const handleHomeworkSelect = (lectureId: string, homework: any) => {
    setSelectedHomeworkId(homework.id);
    setSelectedLectureId(lectureId);
    setSelectedStudentId(null);
    setSelectedSubmissionId(null);
    setActiveTab('submissions');
  };

  // Handle view all submissions
  const handleViewAll = () => {
    setSelectedLectureId(null);
    setSelectedHomeworkId(null);
    setSelectedStudentId(null);
    setSelectedSubmissionId(null);
    setActiveTab('all');
  };

  // Handle view student
  const handleViewStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setSelectedSubmissionId(null);
    setActiveTab('student');
  };

  // Calculate submission statistics for navigation
  const submissionStats = React.useMemo(() => {
    const stats: Record<string, { total: number }> = {};
    
    const submissions = allSubmissions || [];
    submissions.forEach(submission => {
      if (!stats[submission.lecture_id]) {
        stats[submission.lecture_id] = { total: 0 };
      }
      
      stats[submission.lecture_id].total++;
    });
    
    return stats;
  }, [allSubmissions]);

  return (
    <div className="space-y-6">
      <AdminBreadcrumb 
        items={[
          { label: '课程管理', href: '/admin/courses-new' },
          { label: `课程 ${courseId}`, href: `/admin/courses-new/${courseId}` },
          { label: '作业管理' }
        ]} 
      />

      {/* ResizablePanelGroup for layout */}
      <ResizablePanelGroup 
        direction="horizontal"
        className="min-h-[600px] rounded-lg border"
      >
        {/* Course Structure Navigation - resizable panel */}
        <ResizablePanel 
          defaultSize={25}
          minSize={20}
          maxSize={40}
          className="bg-white"
        >
          <CourseOutlineNavigation 
            sections={sections}
            isLoading={isLoadingStructure || isLoadingHomeworks}
            selectedLectureId={selectedLectureId}
            selectedHomeworkId={selectedHomeworkId}
            onSelectLecture={handleLectureSelect}
            onSelectHomework={handleHomeworkSelect}
            submissionStats={submissionStats}
            homeworkByLecture={homeworkByLecture}
            onOverviewClick={handleViewAll}
          />
        </ResizablePanel>
        
        {/* Resizable handle with visual indicator */}
        <ResizableHandle withHandle />
        
        {/* Main Content Area */}
        <ResizablePanel defaultSize={75} className="bg-white p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start mb-4 space-x-2">
              <TabsTrigger value="submissions">作业提交</TabsTrigger>
              <TabsTrigger value="not-submitted">未提交学生</TabsTrigger>
              <TabsTrigger value="stats">统计报表</TabsTrigger>
              {selectedStudentId && (
                <TabsTrigger value="student">学生作业</TabsTrigger>
              )}
              {selectedSubmissionId && (
                <TabsTrigger value="detail">作业详情</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="submissions">
              <HomeworkSubmissionsList 
                homeworkId={selectedHomeworkId}
                lectureId={selectedLectureId}
                onSelectStudent={handleViewStudent}
                onViewSubmission={setSelectedSubmissionId}
              />
            </TabsContent>
            
            <TabsContent value="not-submitted">
              <NotSubmittedStudentsList 
                courseId={courseIdNumber}
                lectureId={selectedLectureId || ''}
              />
            </TabsContent>
            
            <TabsContent value="stats">
              <HomeworkStatsDashboard 
                courseId={courseIdNumber}
              />
            </TabsContent>
            
            <TabsContent value="student">
              {selectedStudentId && (
                <StudentHomeworkList 
                  studentId={selectedStudentId}
                  courseId={courseIdNumber}
                  onViewSubmission={setSelectedSubmissionId}
                />
              )}
            </TabsContent>
            
            <TabsContent value="detail">
              {selectedSubmissionId && (
                <HomeworkSubmissionDetail 
                  submissionId={selectedSubmissionId}
                  onViewStudent={handleViewStudent}
                  onBack={() => {
                    setSelectedSubmissionId(null);
                    if (selectedStudentId) {
                      setActiveTab('student');
                    } else {
                      setActiveTab('submissions');
                    }
                  }}
                />
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default HomeworkSubmissionsView;
