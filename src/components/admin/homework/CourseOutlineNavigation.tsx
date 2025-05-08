
import React, { useMemo } from 'react';
import { ChevronRight, BookOpen, LayoutDashboard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

type Lecture = {
  id: string;
  title: string;
  position: number;
  requires_homework_completion: boolean;
};

interface HomeworkItem {
  id: string;
  title: string;
  lecture_id: string;
  position: number;
  submissionStats?: {
    total: number;
  };
}

interface CourseSection {
  id: string;
  title: string;
  position: number;
  lectures: Lecture[];
}

interface CourseOutlineNavigationProps {
  sections: CourseSection[];
  selectedLectureId?: string | null;
  selectedHomeworkId?: string | null;
  isLoading?: boolean;
  submissionStats?: Record<string, { total: number }>;
  homeworkByLecture?: Record<string, HomeworkItem[]>;
  onSelectLecture: (lectureId: string) => void;
  onSelectHomework: (lectureId: string, homework: HomeworkItem) => void;
  onOverviewClick: () => void;
}

export function CourseOutlineNavigation({
  sections,
  selectedLectureId,
  selectedHomeworkId,
  isLoading = false,
  submissionStats = {},
  homeworkByLecture = {},
  onSelectLecture,
  onSelectHomework,
  onOverviewClick,
}: CourseOutlineNavigationProps) {
  // Count total submissions
  const totalSubmissions = useMemo(() => {
    return Object.values(submissionStats).reduce((total, stats) => total + stats.total, 0);
  }, [submissionStats]);
  
  if (isLoading) {
    return (
      <div className="p-4 space-y-4 h-full">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-6 w-3/4 mt-4" />
        <Skeleton className="h-20 w-full mt-2" />
        <Skeleton className="h-6 w-3/4 mt-4" />
        <Skeleton className="h-20 w-full mt-2" />
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 h-full">
        <p>无课程大纲数据</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full p-4">
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          className={`w-full justify-start text-left ${!selectedLectureId ? 'bg-muted' : ''}`}
          onClick={onOverviewClick}
        >
          <LayoutDashboard className="h-5 w-5 mr-2" />
          <span>课程作业概览</span>
          {totalSubmissions > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {totalSubmissions}
            </Badge>
          )}
        </Button>
        
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="space-y-2">
              <div className="font-medium text-sm text-gray-500 pl-2 pb-1 border-b">
                {section.title}
              </div>
              
              <ul className="space-y-1 pl-2">
                {section.lectures.map((lecture) => {
                  const isSelected = selectedLectureId === lecture.id;
                  const lectureSubmissions = submissionStats[lecture.id]?.total || 0;
                  const lectureHomeworks = homeworkByLecture[lecture.id] || [];
                  const hasHomeworks = lectureHomeworks.length > 0;
                  
                  return (
                    <li key={lecture.id} className="space-y-1">
                      <button
                        className={`
                          w-full flex items-center justify-between text-left py-1.5 px-2 rounded-md
                          transition-colors duration-200
                          ${isSelected 
                            ? 'bg-muted font-medium text-gray-900' 
                            : 'hover:bg-gray-100 text-gray-700'}
                        `}
                        onClick={() => onSelectLecture(lecture.id)}
                      >
                        <span className="truncate flex-grow">{lecture.title}</span>
                        
                        {hasHomeworks && (
                          <div className="flex items-center ml-2">
                            {lectureSubmissions > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {lectureSubmissions}
                              </Badge>
                            )}
                            <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${isSelected ? 'transform rotate-90' : ''}`} />
                          </div>
                        )}
                      </button>
                      
                      {isSelected && hasHomeworks && (
                        <ul className="pl-4 space-y-1 my-1">
                          {lectureHomeworks.map((homework) => (
                            <li key={homework.id}>
                              <button
                                className={`
                                  w-full flex items-center justify-between text-left py-1.5 px-2 rounded-md
                                  text-sm transition-colors duration-200
                                  ${selectedHomeworkId === homework.id 
                                    ? 'bg-gray-200 font-medium text-gray-900' 
                                    : 'hover:bg-gray-100 text-gray-600'}
                                `}
                                onClick={() => onSelectHomework(lecture.id, homework)}
                              >
                                <span className="truncate flex-grow">{homework.title}</span>
                                
                                {homework.submissionStats?.total > 0 && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {homework.submissionStats.total}
                                  </Badge>
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}

export default CourseOutlineNavigation;
