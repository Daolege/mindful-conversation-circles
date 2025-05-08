
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Video, BookOpen, Check, Circle, FileText, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimatedCollapsible } from '@/components/ui/animated-collapsible';

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

interface CourseSyllabusProps {
  syllabusData: any[];
  selectedLecture?: { id: string; title: string };
  selectedHomeworkId?: string | null;
  submissionStats?: Record<string, { total: number; pending: number; reviewed: number; rejected: number }>;
  homeworkByLecture?: Record<string, HomeworkItem[]>;
  onLectureClick: (lecture: any) => void;
  onHomeworkClick?: (lectureId: string, homework: HomeworkItem) => void;
}

export function HomeworkCourseSyllabus({ 
  syllabusData, 
  selectedLecture,
  selectedHomeworkId,
  submissionStats = {},
  homeworkByLecture = {},
  onLectureClick,
  onHomeworkClick 
}: CourseSyllabusProps) {
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({0: true});

  // If there's no expanded sections yet, open the first one
  React.useEffect(() => {
    if (syllabusData && syllabusData.length > 0 && Object.keys(expandedSections).length === 0) {
      setExpandedSections({0: true});
    }
  }, [syllabusData]);

  // Auto-expand section containing selected lecture
  React.useEffect(() => {
    if (selectedLecture && syllabusData) {
      for (let i = 0; i < syllabusData.length; i++) {
        const section = syllabusData[i];
        if (section.lectures.some((lec: any) => lec.id === selectedLecture.id)) {
          setExpandedSections(prev => ({
            ...prev,
            [i]: true
          }));
          break;
        }
      }
    }
  }, [selectedLecture, syllabusData]);

  const toggleSection = (sectionIndex: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  return (
    <div className="space-y-3 pb-6">
      {syllabusData.map((section, sectionIndex) => (
        <AnimatedCollapsible
          key={sectionIndex}
          isOpen={!!expandedSections[sectionIndex]}
          headerContent={
            <div className="flex justify-between w-full items-center">
              <span className="font-medium text-gray-900 text-sm">{section.title}</span>
              <Badge variant="outline" className={`flex items-center justify-center min-w-[42px] py-1 px-2 ${
                expandedSections[sectionIndex] 
                  ? "bg-gray-800 text-white" 
                  : "bg-white border-gray-200"
              }`}>
                {section.lectures?.length || 0}
              </Badge>
            </div>
          }
          onToggle={() => toggleSection(sectionIndex)}
          className={`border-gray-300 hover:bg-gray-50 transition-all duration-300 ${
            expandedSections[sectionIndex] 
              ? 'bg-gray-100 shadow-md' 
              : 'border-gray-200 hover:shadow-md'
          }`}
        >
          <ul className="space-y-2">
            {section.lectures && Array.isArray(section.lectures) && section.lectures.map((lecture, lectureIndex) => {
              const isSelected = selectedLecture && selectedLecture.id === lecture.id;
              const hasHomework = lecture.requires_homework_completion;
              const stats = submissionStats[lecture.id] || { total: 0, pending: 0, reviewed: 0, rejected: 0 };
              
              // Get homework items for this lecture
              const lectureHomework = homeworkByLecture[lecture.id] || [];
              const hasLectureHomework = lectureHomework.length > 0;

              return (
                <li key={`${sectionIndex}-${lectureIndex}`} className="space-y-2">
                  <div
                    onClick={() => onLectureClick(lecture)}
                    className={`
                      flex items-center justify-between p-3 cursor-pointer 
                      border rounded-lg bg-white
                      transition-all duration-300 ease-in-out
                      shadow-sm hover:shadow-md
                      ${isSelected 
                        ? 'bg-gray-100 border-gray-300 transform translate-x-1' 
                        : 'hover:bg-gray-50 hover:translate-x-1'
                      }
                    `}
                    style={{
                      boxShadow: isSelected ? 'inset 4px 0 0 #262626' : 'none',
                    }}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {/* Status indicator */}
                      <div className="flex-shrink-0">
                        {stats.total > 0 ? (
                          <Check className="h-5 w-5 text-gray-700" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-grow flex flex-col">
                        <div 
                          className={`
                            ${isSelected ? 'text-black font-semibold' : 'text-gray-700'}
                            line-clamp-2 text-sm
                          `}
                        >
                          {lecture.title}
                        </div>
                        
                        {/* Homework status indicators */}
                        <div className="flex gap-2 mt-1">
                          {stats.total > 0 && (
                            <div className="flex items-center text-xs text-gray-500">
                              <BookOpen className="h-3 w-3 mr-1" />
                              {stats.total} 份作业
                            </div>
                          )}
                          {hasHomework && (
                            <div className="text-xs text-amber-600">
                              须提交作业
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Homework cards for this lecture - Updated with consistent gray color scheme */}
                  {hasLectureHomework && isSelected && (
                    <div className="pl-4 space-y-1.5">
                      {lectureHomework.map((homework) => {
                        const isHomeworkSelected = selectedHomeworkId === homework.id;
                        const hwStats = homework.submissionStats || { total: 0, pending: 0, reviewed: 0, rejected: 0 };
                        
                        return (
                          <div 
                            key={homework.id}
                            onClick={() => onHomeworkClick && onHomeworkClick(lecture.id, homework)}
                            className={`
                              flex items-center p-2 border rounded-md cursor-pointer
                              transition-all duration-200
                              ${isHomeworkSelected 
                                ? 'bg-gray-100 border-gray-300' 
                                : 'bg-white hover:bg-gray-50 border-gray-200'
                              }
                            `}
                            style={{
                              boxShadow: isHomeworkSelected ? 'inset 3px 0 0 #595959' : 'none',
                            }}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText className={`h-4 w-4 ${isHomeworkSelected ? 'text-gray-700' : 'text-gray-500'}`} />
                              <div className="truncate text-sm" title={homework.title}>
                                {homework.title}
                              </div>
                            </div>
                            <div className="flex gap-1 ml-auto">
                              {hwStats.total > 0 && (
                                <Badge variant="outline" className="text-xs py-0 h-5 min-w-[24px]">
                                  {hwStats.total}
                                </Badge>
                              )}
                              {hwStats.pending > 0 && (
                                <Badge variant="outline" className="text-xs py-0 h-5 bg-amber-50 text-amber-700 border-amber-200">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {hwStats.pending}
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </AnimatedCollapsible>
      ))}
    </div>
  );
}

export default HomeworkCourseSyllabus;
