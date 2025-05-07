
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  FileText,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface CourseSection {
  id: string;
  title: string;
  position: number;
  lectures: CourseLecture[];
}

interface CourseLecture {
  id: string;
  title: string;
  position: number;
  requires_homework_completion: boolean;
}

interface CourseStructureNavProps {
  sections: CourseSection[];
  isLoading: boolean;
  selectedLectureId: string | null;
  onLectureSelect: (lectureId: string) => void;
  onViewAll: () => void;
  submissionStats?: Record<string, { 
    total: number; 
    pending: number; 
    reviewed: number; 
    rejected: number;
  }>;
}

export const CourseStructureNav: React.FC<CourseStructureNavProps> = ({
  sections,
  isLoading,
  selectedLectureId,
  onLectureSelect,
  onViewAll,
  submissionStats = {}
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="font-semibold text-lg mb-4">课程结构</div>
        
        <Button 
          variant={selectedLectureId === null ? "default" : "outline"}
          className="w-full justify-start mb-4"
          onClick={onViewAll}
        >
          <FileText className="mr-2 h-4 w-4" /> 查看所有作业提交
        </Button>
        
        <div className="space-y-2">
          {sections.length === 0 && (
            <div className="text-sm text-muted-foreground p-2">
              此课程没有章节
            </div>
          )}
          
          {sections.map(section => (
            <div key={section.id} className="space-y-1">
              <div
                className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>{section.title}</span>
                </div>
                {expandedSections[section.id] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
              
              {expandedSections[section.id] && (
                <div className="ml-6 space-y-1 border-l pl-2 pt-1">
                  {section.lectures && section.lectures.length > 0 ? (
                    section.lectures.map(lecture => {
                      const stats = submissionStats[lecture.id] || { total: 0, pending: 0, reviewed: 0, rejected: 0 };
                      return (
                        <Button
                          key={lecture.id}
                          variant={selectedLectureId === lecture.id ? "default" : "ghost"}
                          className="w-full justify-start h-auto py-2"
                          onClick={() => onLectureSelect(lecture.id)}
                        >
                          <div className="flex flex-col items-start">
                            <div className="flex items-center">
                              <FileText className="mr-2 h-4 w-4" /> 
                              <span className="text-sm">{lecture.title}</span>
                            </div>
                            
                            {stats.total > 0 && (
                              <div className="flex mt-1 gap-2">
                                <Badge variant="outline" className="text-xs flex items-center">
                                  <span className="mr-1">{stats.total}</span>提交
                                </Badge>
                                {stats.pending > 0 && (
                                  <Badge variant="outline" className="bg-amber-50 text-xs flex items-center">
                                    <Clock className="mr-1 h-3 w-3" /> {stats.pending}
                                  </Badge>
                                )}
                                {stats.reviewed > 0 && (
                                  <Badge variant="outline" className="bg-green-50 text-xs flex items-center">
                                    <CheckCircle className="mr-1 h-3 w-3" /> {stats.reviewed}
                                  </Badge>
                                )}
                                {stats.rejected > 0 && (
                                  <Badge variant="outline" className="bg-red-50 text-xs flex items-center">
                                    <AlertCircle className="mr-1 h-3 w-3" /> {stats.rejected}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </Button>
                      );
                    })
                  ) : (
                    <div className="text-sm text-muted-foreground p-2">
                      此章节没有小节
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseStructureNav;
