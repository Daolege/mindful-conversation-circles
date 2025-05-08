
import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CourseStructureNavigationProps {
  sections: Array<{
    id: string;
    title: string;
    position: number;
    lectures: Array<{
      id: string;
      title: string;
      position: number;
      requires_homework_completion?: boolean;
    }>;
  }>;
  selectedLectureId: string | null;
  onSelectLecture: (lectureId: string) => void;
}

export const CourseStructureNavigation: React.FC<CourseStructureNavigationProps> = ({
  sections,
  selectedLectureId,
  onSelectLecture
}) => {
  // Track which sections are expanded
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Toggle section expanded state
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">课程结构</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] pr-3">
          <ul className="space-y-1 p-3">
            {sections.sort((a, b) => a.position - b.position).map(section => (
              <li key={section.id} className="mb-2">
                <div 
                  className="flex items-center py-2 px-2 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={() => toggleSection(section.id)}
                >
                  {expandedSections[section.id] ? (
                    <ChevronDown className="h-4 w-4 mr-1 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1 text-gray-500" />
                  )}
                  <span className="font-medium">{section.title}</span>
                </div>
                
                {expandedSections[section.id] && (
                  <ul className="ml-6 mt-1 space-y-1">
                    {section.lectures.sort((a, b) => a.position - b.position).map(lecture => (
                      <li key={lecture.id}>
                        <Button
                          variant={selectedLectureId === lecture.id ? "default" : "ghost"}
                          size="sm"
                          className={`w-full justify-start text-left ${
                            selectedLectureId === lecture.id ? "" : "hover:bg-gray-100"
                          }`}
                          onClick={() => onSelectLecture(lecture.id)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          <span className="truncate">{lecture.title}</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            
            {sections.length === 0 && (
              <li className="text-center py-4 text-gray-500">
                未找到课程章节
              </li>
            )}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CourseStructureNavigation;
