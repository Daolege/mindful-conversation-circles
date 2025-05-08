
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { HomeworkCourseSyllabus } from './HomeworkCourseSyllabus';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

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

interface HomeworkItem {
  id: string;
  lecture_id: string;
  title: string;
  type: string;
  position: number;
  submissionStats?: {
    total: number;
    pending: number;
    reviewed: number;
    rejected: number;
  };
}

interface CourseOutlineNavigationProps {
  sections: CourseSection[];
  selectedLectureId: string | null;
  selectedHomeworkId?: string | null;
  onSelectLecture: (lectureId: string) => void;
  onSelectHomework?: (lectureId: string, homeworkId: string, title: string) => void;
  submissionStats?: Record<string, { total: number; pending: number; reviewed: number; rejected: number }>;
  homeworkByLecture?: Record<string, HomeworkItem[]>;
  isLoading?: boolean;
  onOverviewClick?: () => void;
}

export const CourseOutlineNavigation: React.FC<CourseOutlineNavigationProps> = ({
  sections,
  selectedLectureId,
  selectedHomeworkId,
  onSelectLecture,
  onSelectHomework,
  submissionStats = {},
  homeworkByLecture = {},
  isLoading = false,
  onOverviewClick
}) => {
  if (isLoading) {
    return (
      <Card className="h-full">
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
  
  // Find homework items for the selected lecture
  const homeworkItems = selectedLectureId ? homeworkByLecture[selectedLectureId] || [] : [];
  
  return (
    <Card className="h-full">
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
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)] px-3 py-2">
          <HomeworkCourseSyllabus
            syllabusData={sections}
            selectedLecture={selectedLecture ? { id: selectedLecture.id, title: selectedLecture.title } : undefined}
            selectedHomeworkId={selectedHomeworkId}
            onLectureClick={(lecture) => onSelectLecture(lecture.id)}
            onHomeworkClick={(lectureId, homework) => {
              if (onSelectHomework) {
                onSelectHomework(lectureId, homework.id, homework.title);
              }
            }}
            submissionStats={submissionStats}
            homeworkByLecture={homeworkByLecture}
          />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CourseOutlineNavigation;
