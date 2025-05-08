
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CourseOutlineNavigation } from './CourseOutlineNavigation';
import HomeworkSubmissionsDetail from './HomeworkSubmissionsDetail';
import { HomeworkSubmissionDetail } from './HomeworkSubmissionDetail';
import { getCourseStructureForHomework } from '@/lib/services/homeworkSubmissionService';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle 
} from '@/components/ui/resizable';

interface HomeworkViewingSystemProps {
  courseId: number;
}

export const HomeworkViewingSystem: React.FC<HomeworkViewingSystemProps> = ({ courseId }) => {
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [lectureTitle, setLectureTitle] = useState<string>('');
  const [homeworkTitle, setHomeworkTitle] = useState<string>('');
  
  // 1. Fetch course structure data (sections and lectures)
  const { data: courseStructure, isLoading: isLoadingStructure } = useQuery({
    queryKey: ['homework-course-structure', courseId],
    queryFn: () => getCourseStructureForHomework(courseId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });

  // Get all homework submissions to generate stats for navigation
  const { data: allSubmissions } = useQuery({
    queryKey: ['all-homework-submissions', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homework_submissions')
        .select('id, lecture_id, homework_id, status')
        .eq('course_id', courseId);
        
      if (error) {
        console.error('Error fetching all submissions:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!courseId,
  });

  // Get all homework assignments to show under lectures
  const { data: allHomework } = useQuery({
    queryKey: ['all-homework-assignments', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homework')
        .select('id, lecture_id, title, type, position')
        .eq('course_id', courseId)
        .order('position', { ascending: true });
        
      if (error) {
        console.error('Error fetching homework assignments:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!courseId,
  });

  // Calculate submission statistics for navigation
  const submissionStats = React.useMemo(() => {
    const stats: Record<string, { total: number; pending: number; reviewed: number; rejected: number }> = {};
    
    const submissions = allSubmissions || [];
    submissions.forEach(submission => {
      if (!stats[submission.lecture_id]) {
        stats[submission.lecture_id] = { total: 0, pending: 0, reviewed: 0, rejected: 0 };
      }
      
      stats[submission.lecture_id].total++;
      
      if (submission.status === 'pending') stats[submission.lecture_id].pending++;
      else if (submission.status === 'reviewed') stats[submission.lecture_id].reviewed++;
      else if (submission.status === 'rejected') stats[submission.lecture_id].rejected++;
    });
    
    return stats;
  }, [allSubmissions]);

  // Group homework by lecture
  const homeworkByLecture = React.useMemo(() => {
    const grouped: Record<string, any[]> = {};
    
    const homework = allHomework || [];
    homework.forEach(hw => {
      if (!grouped[hw.lecture_id]) {
        grouped[hw.lecture_id] = [];
      }
      
      // Calculate submission stats for this specific homework
      const hwSubmissionStats = {
        total: 0,
        pending: 0,
        reviewed: 0,
        rejected: 0
      };
      
      if (allSubmissions) {
        allSubmissions.forEach(sub => {
          if (sub.homework_id === hw.id) {
            hwSubmissionStats.total++;
            if (sub.status === 'pending') hwSubmissionStats.pending++;
            else if (sub.status === 'reviewed') hwSubmissionStats.reviewed++;
            else if (sub.status === 'rejected') hwSubmissionStats.rejected++;
          }
        });
      }
      
      grouped[hw.lecture_id].push({
        ...hw,
        submissionStats: hwSubmissionStats
      });
    });
    
    return grouped;
  }, [allHomework, allSubmissions]);

  // Handle lecture selection
  const handleSelectLecture = (lectureId: string) => {
    setSelectedLectureId(lectureId);
    setSelectedSubmissionId(null);
    setSelectedHomeworkId(null);
    
    // Find lecture title
    if (courseStructure) {
      for (const section of courseStructure) {
        const lecture = section.lectures.find(lec => lec.id === lectureId);
        if (lecture) {
          setLectureTitle(lecture.title);
          break;
        }
      }
    }
  };

  // Handle homework selection
  const handleSelectHomework = (lectureId: string, homeworkId: string, title: string) => {
    handleSelectLecture(lectureId);
    setSelectedHomeworkId(homeworkId);
    setHomeworkTitle(title);
  };

  // Handle viewing a specific submission
  const handleViewSubmission = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
  };
  
  // Clear submission selection
  const handleBackFromSubmission = () => {
    setSelectedSubmissionId(null);
  };
  
  if (isLoadingStructure) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }
  
  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-200px)]">
      {/* Left sidebar: Course structure navigation */}
      <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
        <CourseOutlineNavigation
          sections={courseStructure || []}
          selectedLectureId={selectedLectureId}
          selectedHomeworkId={selectedHomeworkId}
          onSelectLecture={handleSelectLecture}
          onSelectHomework={handleSelectHomework}
          submissionStats={submissionStats}
          homeworkByLecture={homeworkByLecture}
          isLoading={isLoadingStructure}
        />
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      {/* Main content area */}
      <ResizablePanel defaultSize={75}>
        <div className="h-full overflow-auto p-1">
          {!selectedLectureId && (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <p className="text-xl font-medium">请从左侧课程大纲中选择一个讲座</p>
                <p className="mt-2">选择后可查看该讲座下的学生作业提交情况</p>
              </CardContent>
            </Card>
          )}
          
          {selectedLectureId && !selectedSubmissionId && (
            <HomeworkSubmissionsDetail 
              courseId={courseId}
              lectureId={selectedLectureId}
              homeworkId={selectedHomeworkId || ''}
              lectureTitle={lectureTitle}
              homeworkTitle={homeworkTitle}
              onViewSubmission={handleViewSubmission}
            />
          )}
          
          {selectedSubmissionId && (
            <HomeworkSubmissionDetail 
              submissionId={selectedSubmissionId}
              onBack={handleBackFromSubmission}
              viewOnly={true}
            />
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default HomeworkViewingSystem;
