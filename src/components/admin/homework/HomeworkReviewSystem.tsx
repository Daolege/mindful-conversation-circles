
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, FileDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import HomeworkBreadcrumb from './HomeworkBreadcrumb';
import CourseOutlineNavigation from './CourseOutlineNavigation';
import { HomeworkSubmissionsList } from './HomeworkSubmissionsList';
import StudentsList from './StudentsList';
import { HomeworkStatsDashboard } from './HomeworkStatsDashboard';
import { NotSubmittedStudentsList } from './NotSubmittedStudentsList';

interface HomeworkReviewSystemProps {
  courseId: number;
}

export const HomeworkReviewSystem: React.FC<HomeworkReviewSystemProps> = ({ courseId }) => {
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState<string>('');
  const [lectureTitle, setLectureTitle] = useState<string>('');
  
  // 1. Fetch course structure data (sections and lectures)
  const { data: courseStructure, isLoading: isLoadingStructure } = useQuery({
    queryKey: ['homework-course-structure', courseId],
    queryFn: async () => {
      const { data: sections, error: sectionsError } = await supabase
        .from('course_sections')
        .select(`
          id,
          title,
          position,
          course_lectures (
            id,
            title,
            position,
            requires_homework_completion
          )
        `)
        .eq('course_id', courseId)
        .order('position', { ascending: true });
        
      if (sectionsError) {
        console.error('Error fetching course sections:', sectionsError);
        return { sections: [] };
      }
      
      return { 
        sections: sections.map(section => ({
          ...section,
          lectures: section.course_lectures
        }))
      };
    },
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
    setSelectedStudentId(null);
    
    // Find lecture and section titles
    if (courseStructure?.sections) {
      for (const section of courseStructure.sections) {
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
    setSelectedStudentId(null);
    setSectionTitle('');
    setLectureTitle('');
  };
  
  // Handle student selection 
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
  };
  
  // Clear student selection
  const handleClearStudent = () => {
    setSelectedStudentId(null);
  };
  
  // Get student name for breadcrumb
  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile-for-breadcrumb', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', selectedStudentId)
        .single();
        
      if (error) {
        console.error('Error fetching student profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!selectedStudentId,
  });
  
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
        studentId={selectedStudentId}
        studentName={studentProfile?.full_name}
        onClearLecture={handleClearLecture}
        onClearStudent={handleClearStudent}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar: Course structure navigation */}
        <div className="lg:col-span-1">
          <CourseOutlineNavigation
            sections={courseStructure?.sections || []}
            selectedLectureId={selectedLectureId}
            onSelectLecture={handleSelectLecture}
            submissionStats={submissionStats}
          />
        </div>
        
        {/* Main content area */}
        <div className="lg:col-span-3">
          {!selectedLectureId ? (
            /* Course-level overview dashboard when no lecture is selected */
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">课程作业概览</h2>
              <p className="text-gray-500 mb-6">请从左侧选择一个小节来查看相关的作业提交。</p>
              <HomeworkStatsDashboard courseId={courseId} />
            </div>
          ) : selectedLectureId && !selectedStudentId ? (
            /* Lecture selected but no student selected - show submission lists */
            <div className="space-y-6">
              <HomeworkSubmissionsList 
                lectureId={selectedLectureId} 
                onSelectStudent={handleSelectStudent} 
              />
              <NotSubmittedStudentsList 
                courseId={courseId} 
                lectureId={selectedLectureId} 
              />
            </div>
          ) : (
            /* Both lecture and student selected - show student submissions */
            <StudentsList
              studentId={selectedStudentId!}
              lectureId={selectedLectureId!}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeworkReviewSystem;
