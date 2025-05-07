
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Video, BookOpen, Check, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimatedCollapsible } from '@/components/ui/animated-collapsible';

interface CourseSyllabusProps {
  syllabusData: any[];
  selectedLecture?: { id: string; title: string };
  submissionStats?: Record<string, { total: number; pending: number; reviewed: number; rejected: number }>;
  onLectureClick: (lecture: any) => void;
}

export function HomeworkCourseSyllabus({ 
  syllabusData, 
  selectedLecture,
  submissionStats = {},
  onLectureClick 
}: CourseSyllabusProps) {
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({0: true});

  // If there's no expanded sections yet, open the first one
  useEffect(() => {
    if (syllabusData && syllabusData.length > 0 && Object.keys(expandedSections).length === 0) {
      setExpandedSections({0: true});
    }
  }, [syllabusData]);

  const toggleSection = (sectionIndex: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg">
      <div className="space-y-3 pb-6">
        {syllabusData.map((section, sectionIndex) => (
          <AnimatedCollapsible
            key={sectionIndex}
            isOpen={!!expandedSections[sectionIndex]}
            headerContent={
              <div className="flex justify-between w-full items-center">
                <span className="font-medium text-gray-900">{section.title}</span>
                <Badge variant="outline" className={`flex items-center justify-center min-w-[42px] py-1 ${
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

                return (
                  <li
                    key={`${sectionIndex}-${lectureIndex}`}
                    onClick={() => onLectureClick(lecture)}
                    className={`
                      flex items-center justify-between p-4 cursor-pointer 
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
                      
                      {stats.total > 0 && (
                        <div className="flex flex-col items-end gap-1 ml-2">
                          <div className="flex space-x-1 text-xs">
                            {stats.pending > 0 && (
                              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">
                                待审 {stats.pending}
                              </span>
                            )}
                            {stats.reviewed > 0 && (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                                通过 {stats.reviewed}
                              </span>
                            )}
                            {stats.rejected > 0 && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                                未通过 {stats.rejected}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </AnimatedCollapsible>
        ))}
      </div>
    </div>
  );
}

export default HomeworkCourseSyllabus;
