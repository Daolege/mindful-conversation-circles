
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import HomeworkBreadcrumb from './HomeworkBreadcrumb';
import CourseOutlineNavigation from './CourseOutlineNavigation';
import HomeworkOverviewTable from './HomeworkOverviewTable';
import HomeworkSubmissionsDetail from './HomeworkSubmissionsDetail';
import { getCourseStructureForHomework } from '@/lib/services/homeworkSubmissionService';

interface HomeworkReviewSystemProps {
  courseId: number;
}

export const HomeworkReviewSystem: React.FC<HomeworkReviewSystemProps> = ({ courseId }) => {
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState<string>('');
  const [lectureTitle, setLectureTitle] = useState<string>('');
  const [currentView, setCurrentView] = useState<'overview' | 'detail'>('overview');
  
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
        .select('id, lecture_id, status')
        .eq('course_id', courseId);
        
      if (error) {
        console.error('Error fetching all submissions:', error);
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

  // Handle lecture selection
  const handleSelectLecture = (lectureId: string) => {
    setSelectedLectureId(lectureId);
    
    // Find lecture and section titles
    if (courseStructure) {
      for (const section of courseStructure) {
        const lecture = section.lectures.find(lec => lec.id === lectureId);
        if (lecture) {
          setSectionTitle(section.title);
          setLectureTitle(lecture.title);
          break;
        }
      }
    }
  };
  
  // Clear lecture selection
  const handleClearLecture = () => {
    setSelectedLectureId(null);
    setSectionTitle('');
    setLectureTitle('');
    setCurrentView('overview');
  };
  
  // Handle viewing homework details - navigates to the homework view for the selected lecture
  const handleViewHomeworkDetails = (lectureId: string) => {
    handleSelectLecture(lectureId);
    setCurrentView('detail');
  };

  // Handle back navigation from detail view to overview
  const handleBackToOverview = () => {
    setCurrentView('overview');
  };
  
  // Handle viewing a specific submission
  const handleViewSubmission = (submissionId: string) => {
    // Navigate to submission detail page
    window.location.href = `/admin/courses-new/${courseId}/homework/submission/${submissionId}`;
  };
  
  if (isLoadingStructure) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
      <HomeworkBreadcrumb 
        courseId={courseId} 
        sectionTitle={sectionTitle}
        lectureTitle={lectureTitle}
        onClearLecture={handleClearLecture}
      />
      
      {currentView === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar: Course structure navigation */}
          <div className="lg:col-span-1">
            <CourseOutlineNavigation
              sections={courseStructure || []}
              selectedLectureId={selectedLectureId}
              onSelectLecture={handleSelectLecture}
              submissionStats={submissionStats}
              isLoading={isLoadingStructure}
            />
          </div>
          
          {/* Main content area */}
          <div className="lg:col-span-3">
            <HomeworkOverviewTable 
              courseId={courseId}
              sections={courseStructure || []}
              onViewHomeworkDetails={handleViewHomeworkDetails}
            />
          </div>
        </div>
      ) : (
        /* Detail view with submitted/not submitted tabs */
        <HomeworkSubmissionsDetail 
          courseId={courseId}
          lectureId={selectedLectureId || ''}
          lectureTitle={lectureTitle}
          onViewSubmission={handleViewSubmission}
          onBack={handleBackToOverview}
        />
      )}
    </div>
  );
};

export default HomeworkReviewSystem;
