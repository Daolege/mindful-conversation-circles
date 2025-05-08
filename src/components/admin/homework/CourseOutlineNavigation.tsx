
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, GraduationCap } from 'lucide-react';
import { HomeworkCourseSyllabus } from './HomeworkCourseSyllabus';

interface CourseSection {
  id: string;
  title: string;
  position: number;
  lectures: {
    id: string;
    title: string;
    position: number;
    requires_homework_completion: boolean;
  }[];
}

interface CourseOutlineNavigationProps {
  sections: CourseSection[];
  selectedLectureId: string | null;
  onSelectLecture: (lectureId: string) => void;
  submissionStats?: Record<string, { total: number; pending: number; reviewed: number; rejected: number }>;
  isLoading?: boolean;
  onOverviewClick?: () => void;
}

export const CourseOutlineNavigation: React.FC<CourseOutlineNavigationProps> = ({
  sections,
  selectedLectureId,
  onSelectLecture,
  submissionStats = {},
  isLoading = false,
  onOverviewClick
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>课程大纲</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const selectedLecture = sections.flatMap(section => 
    section.lectures.filter(lecture => lecture.id === selectedLectureId)
  )[0];
  
  return (
    <Card className="h-full sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            <span>课程大纲</span>
          </div>
          {onOverviewClick && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1 text-xs"
              title="返回课程概览"
              onClick={onOverviewClick}
            >
              <BookOpen className="h-3.5 w-3.5" />
              概览
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 py-2">
        <HomeworkCourseSyllabus
          syllabusData={sections}
          selectedLecture={selectedLecture ? { id: selectedLecture.id, title: selectedLecture.title } : undefined}
          onLectureClick={(lecture) => onSelectLecture(lecture.id)}
          submissionStats={submissionStats}
        />
      </CardContent>
    </Card>
  );
};

export default CourseOutlineNavigation;
