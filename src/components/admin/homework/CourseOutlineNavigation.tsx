
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedCollapsible } from '@/components/ui/animated-collapsible';
import { BookOpen, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface CourseLecture {
  id: string;
  title: string;
  position: number;
  requires_homework_completion?: boolean;
}

interface CourseSection {
  id: string;
  title: string;
  position: number;
  lectures: CourseLecture[];
}

interface CourseOutlineNavigationProps {
  sections: CourseSection[];
  selectedLectureId: string | null;
  onSelectLecture: (lectureId: string) => void;
  isLoading?: boolean;
  submissionStats?: Record<string, { total: number; pending: number; reviewed: number; rejected: number }>;
}

export const CourseOutlineNavigation: React.FC<CourseOutlineNavigationProps> = ({
  sections,
  selectedLectureId,
  onSelectLecture,
  isLoading = false,
  submissionStats = {}
}) => {
  const [openSectionIds, setOpenSectionIds] = useState<Record<string, boolean>>({});

  // Initialize with first section open
  React.useEffect(() => {
    if (sections && sections.length > 0) {
      setOpenSectionIds(prev => ({
        ...prev,
        [sections[0].id]: true
      }));
    }
  }, [sections]);

  const toggleSection = (sectionId: string) => {
    setOpenSectionIds(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            课程大纲
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="mt-4 space-y-2">
                  {[1, 2].map((j) => (
                    <Skeleton key={j} className="h-12 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalLessons = sections?.reduce(
    (count, section) => count + (section.lectures?.length || 0),
    0
  ) || 0;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-500 shadow-sm">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          课程大纲
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-sm text-gray-500 mb-4">
          {sections?.length || 0} 章节 • {totalLessons} 小节
        </div>

        <div className="space-y-4">
          {sections && sections.length > 0 ? (
            sections.sort((a, b) => a.position - b.position).map((section) => (
              <AnimatedCollapsible
                key={section.id}
                isOpen={!!openSectionIds[section.id]}
                headerContent={
                  <div className="flex justify-between w-full items-center">
                    <span className="text-lg">{section.title}</span>
                    <span className="text-xs flex items-center justify-center min-w-[60px] py-1 px-2 bg-gray-200 text-gray-800 rounded">
                      {section.lectures?.length || 0} 小节
                    </span>
                  </div>
                }
                onToggle={() => toggleSection(section.id)}
                className={`border-gray-300 hover:bg-gray-50 transition-colors ${
                  openSectionIds[section.id] 
                    ? 'bg-gray-100 shadow-md' 
                    : 'shadow-sm hover:shadow-md'
                }`}
              >
                <ul className="space-y-3">
                  {section.lectures?.sort((a, b) => a.position - b.position).map((lecture) => {
                    const stats = submissionStats[lecture.id] || { total: 0, pending: 0, reviewed: 0, rejected: 0 };

                    return (
                      <li
                        key={lecture.id}
                        className="flex flex-col p-4 border rounded-lg 
                          bg-white transition-all duration-300 ease-in-out
                          shadow-sm hover:shadow-md
                          hover:bg-gray-50"
                        onClick={() => onSelectLecture(lecture.id)}
                      >
                        <div className="flex justify-between items-center w-full cursor-pointer">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className={`text-sm ${selectedLectureId === lecture.id ? 'font-medium' : 'font-normal'}`}>
                              {lecture.title}
                            </span>
                            {lecture.requires_homework_completion && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                需完成作业
                              </Badge>
                            )}
                          </div>
                          
                          {stats.total > 0 && (
                            <div className="flex gap-1">
                              {stats.pending > 0 && (
                                <Badge variant="outline" className="text-amber-600">
                                  {stats.pending}
                                </Badge>
                              )}
                              {stats.reviewed > 0 && (
                                <Badge variant="outline" className="text-green-600">
                                  {stats.reviewed}
                                </Badge>
                              )}
                              {stats.rejected > 0 && (
                                <Badge variant="outline" className="text-red-600">
                                  {stats.rejected}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {stats.total > 0 && (
                          <div className="mt-2 flex gap-2 justify-end">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs py-1 h-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectLecture(lecture.id);
                              }}
                            >
                              查看作业 ({stats.total})
                            </Button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </AnimatedCollapsible>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">未找到课程章节</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseOutlineNavigation;
