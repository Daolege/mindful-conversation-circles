
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Video, BookOpen, Lock, Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/hooks/useTranslations";

export function CourseSyllabus({ 
  syllabusData, 
  selectedLecture, 
  completedLectures, 
  onLectureClick 
}) {
  const [expandedSections, setExpandedSections] = useState({0: true});
  const [hoveredLectureId, setHoveredLectureId] = useState(null);
  const { t } = useTranslations();

  const toggleSection = (sectionIndex) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  return (
    <div className="space-y-2">
      {syllabusData.map((section, sectionIndex) => (
        <div key={sectionIndex} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Button 
            variant="ghost"
            className="w-full rounded-none flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection(sectionIndex)}
          >
            <span className="font-medium text-gray-900">{section.title}</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white border-gray-200">
                {section.lectures?.length || 0} {t('courses:lessons')}
              </Badge>
              {expandedSections[sectionIndex] ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </Button>
          
          {expandedSections[sectionIndex] && section.lectures && Array.isArray(section.lectures) && (
            <ul className="divide-y divide-gray-100">
              {section.lectures.map((lecture, lectureIndex) => {
                const lectureKey = `${sectionIndex}-${lectureIndex}`;
                const isSelected = selectedLecture && selectedLecture.id === lecture.id;
                const isHovered = hoveredLectureId === lectureKey;
                const isCompleted = completedLectures?.[lecture.id];
                const hasVideo = lecture.videoUrl || lecture.video_url;
                const hasHomework = lecture.has_homework;
                const isPreviousLectureCompleted = lectureIndex === 0 || completedLectures?.[section.lectures[lectureIndex-1]?.id];
                const isLocked = lectureIndex > 0 && !isPreviousLectureCompleted;

                return (
                  <li
                    key={lectureKey}
                    onClick={() => onLectureClick(lecture)}
                    onMouseEnter={() => setHoveredLectureId(lectureKey)}
                    onMouseLeave={() => setHoveredLectureId(null)}
                    className={`
                      flex items-center justify-between p-4 cursor-pointer 
                      transition-all duration-300 ease-in-out
                      group relative
                      ${isSelected 
                        ? 'bg-gray-100' 
                        : isHovered 
                          ? 'bg-gray-50' 
                          : 'hover:bg-gray-50'
                      }
                      ${isLocked ? 'opacity-75' : ''}
                    `}
                    style={{
                      boxShadow: isSelected ? 'inset 4px 0 0 #262626' : 'none',
                      fontWeight: isSelected ? '500' : 'normal',
                    }}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {/* Status indicator */}
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <Check className="h-5 w-5 text-gray-700" />
                        ) : isLocked ? (
                          <Lock className="h-5 w-5 text-gray-400" />
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
                        
                        {/* 视频和作业状态指示器 */}
                        <div className="flex gap-2 mt-1">
                          {hasVideo && (
                            <div className="flex items-center text-xs text-gray-500">
                              <Video className="h-3 w-3 mr-1" />
                              视频
                            </div>
                          )}
                          {hasHomework && (
                            <div className="flex items-center text-xs text-gray-500">
                              <BookOpen className="h-3 w-3 mr-1" />
                              作业
                            </div>
                          )}
                          {lecture.requires_homework_completion && (
                            <div className="text-xs text-amber-600">
                              须提交作业
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1 ml-2">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {lecture.duration || '未知时长'}
                        </span>
                        
                        {/* 免费标识或锁定图标 */}
                        {lecture.is_free ? (
                          <span className="text-xs px-1 py-0.5 bg-gray-100 text-gray-700 rounded whitespace-nowrap">
                            免费
                          </span>
                        ) : isLocked ? (
                          <Lock size={14} className="text-gray-400" />
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
