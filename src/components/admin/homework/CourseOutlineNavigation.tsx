
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft } from "lucide-react";
import { HomeworkCourseSyllabus } from "./HomeworkCourseSyllabus";

interface CourseOutlineNavigationProps {
  sections: any[];
  selectedLectureId?: string | null;
  selectedHomeworkId?: string | null;
  onSelectLecture: (lectureId: string) => void;
  onSelectHomework?: (lectureId: string, homework: any) => void;
  submissionStats?: Record<string, { total: number; pending: number; reviewed: number; rejected: number }>;
  homeworkByLecture?: Record<string, any[]>;
  isLoading?: boolean;
  onOverviewClick?: () => void;
}

export const CourseOutlineNavigation = ({
  sections,
  selectedLectureId,
  selectedHomeworkId,
  onSelectLecture,
  onSelectHomework,
  submissionStats,
  homeworkByLecture,
  isLoading,
  onOverviewClick
}: CourseOutlineNavigationProps) => {

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }
  
  // Find selected lecture object for displaying title
  const selectedLecture = React.useMemo(() => {
    if (!selectedLectureId) return null;
    
    for (const section of sections) {
      for (const lecture of section.lectures) {
        if (lecture.id === selectedLectureId) {
          return { id: lecture.id, title: lecture.title };
        }
      }
    }
    return null;
  }, [sections, selectedLectureId]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-medium text-gray-800">课程大纲</h3>
        
        {onOverviewClick && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 w-full justify-start text-gray-600 hover:text-gray-900"
            onClick={onOverviewClick}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            返回全部作业
          </Button>
        )}
      </div>
      
      <div className="p-2 flex-grow overflow-auto">
        <HomeworkCourseSyllabus 
          syllabusData={sections}
          selectedLecture={selectedLecture}
          selectedHomeworkId={selectedHomeworkId}
          submissionStats={submissionStats}
          homeworkByLecture={homeworkByLecture}
          onLectureClick={onSelectLecture}
          onHomeworkClick={onSelectHomework}
        />
      </div>
    </div>
  );
};

export default CourseOutlineNavigation;
