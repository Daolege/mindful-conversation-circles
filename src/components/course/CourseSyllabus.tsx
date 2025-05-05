
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Video, BookOpen, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CourseSyllabus({ 
  syllabusData, 
  selectedLecture, 
  completedLectures, 
  onLectureClick 
}) {
  const [expandedSections, setExpandedSections] = useState({0: true});
  const [hoveredLectureId, setHoveredLectureId] = useState(null);

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
                {section.lectures?.length || 0} 讲
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
                const isSelected = selectedLecture && selectedLecture.title === lecture.title;
                const isHovered = hoveredLectureId === lectureKey;
                const isCompleted = completedLectures?.[lecture.title];
                const hasVideo = lecture.video_data || lecture.video_url;

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
                    `}
                    style={{
                      boxShadow: isSelected ? 'inset 4px 0 0 #000' : 'none',
                      fontWeight: isSelected ? '500' : 'normal',
                    }}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Video 
                        className={`
                          h-5 w-5 
                          ${isSelected 
                            ? 'text-black' 
                            : isHovered 
                              ? 'text-gray-700' 
                              : 'text-gray-500 group-hover:text-gray-700'
                          }
                        `} 
                      />
                      <div className="flex-grow flex justify-between items-center">
                        <div className="flex flex-col">
                          <span 
                            className={`
                              ${isSelected 
                                ? 'text-black font-semibold' 
                                : isHovered 
                                  ? 'text-gray-900' 
                                  : 'text-gray-700 group-hover:text-gray-900'
                              }
                            `}
                          >
                            {lecture.title}
                          </span>
                          {/* 视频和作业状态指示器 */}
                          {(hasVideo || lecture.has_homework) && (
                            <div className="flex gap-2 mt-1">
                              {hasVideo && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Video className="h-3 w-3 mr-1" />
                                  视频
                                </div>
                              )}
                              {lecture.has_homework && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <BookOpen className="h-3 w-3 mr-1" />
                                  作业
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">
                            {lecture.duration || '时长未知'}
                          </span>
                          {/* 免费标识或锁定图标 */}
                          {lecture.is_free ? (
                            <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded">
                              免费
                            </span>
                          ) : (
                            <Lock size={14} className="text-gray-400" />
                          )}
                        </div>
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
