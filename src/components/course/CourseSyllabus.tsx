
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Video, BookOpen, Lock, Check, Circle, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/hooks/useTranslations";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatedCollapsible } from '@/components/ui/animated-collapsible';

export function CourseSyllabus({ 
  syllabusData, 
  selectedLecture, 
  completedLectures, 
  onLectureClick 
}) {
  const [expandedSections, setExpandedSections] = useState({0: true});
  const [hoveredLectureId, setHoveredLectureId] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const scrollAreaRef = useRef(null);
  const scrollViewportRef = useRef(null);
  const { t } = useTranslations();

  // If there's no expanded sections yet, open the first one
  useEffect(() => {
    if (syllabusData && syllabusData.length > 0 && Object.keys(expandedSections).length === 0) {
      setExpandedSections({0: true});
    }
  }, [syllabusData]);

  // Check if scroll is needed and detect position
  useEffect(() => {
    const checkScroll = () => {
      const viewport = scrollViewportRef.current;
      if (!viewport) return;
      
      const { scrollHeight, clientHeight, scrollTop } = viewport;
      const hasScroll = scrollHeight > clientHeight;
      setShowScrollButton(hasScroll);
      
      // Check if we're at the bottom (with a 20px threshold)
      const isBottom = scrollTop + clientHeight >= scrollHeight - 20;
      setIsAtBottom(isBottom);
    };

    // Initial check
    checkScroll();
    
    // Add scroll event listener to the viewport
    const viewport = scrollViewportRef.current;
    if (viewport) {
      viewport.addEventListener('scroll', checkScroll);
      
      // Also check when window resizes
      window.addEventListener('resize', checkScroll);
    }

    return () => {
      if (viewport) {
        viewport.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const toggleSection = (sectionIndex) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  const handleScrollAction = () => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    if (isAtBottom) {
      // Scroll to top
      viewport.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      // Scroll to bottom
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative">
      <ScrollArea 
        ref={scrollAreaRef} 
        className="h-[70vh]"
      >
        <ScrollArea.Viewport ref={scrollViewportRef}>
          <div className="space-y-3 pr-4">
            {syllabusData.map((section, sectionIndex) => (
              <AnimatedCollapsible
                key={sectionIndex}
                isOpen={!!expandedSections[sectionIndex]}
                headerContent={
                  <div className="flex justify-between w-full items-center">
                    <span className="font-medium text-gray-900">{section.title}</span>
                    <Badge variant="outline" className={`${
                      expandedSections[sectionIndex] 
                        ? "bg-gray-200 text-gray-800" 
                        : "bg-white border-gray-200"
                    }`}>
                      {section.lectures?.length || 0} {t('courses:lessons')}
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
                          border rounded-lg bg-white
                          transition-all duration-300 ease-in-out
                          shadow-sm hover:shadow-md
                          ${isSelected 
                            ? 'bg-gray-100 border-gray-300 transform translate-x-1' 
                            : isHovered 
                              ? 'bg-gray-50 transform translate-x-1' 
                              : 'hover:bg-gray-50 hover:translate-x-1'
                          }
                          ${isLocked ? 'opacity-75' : ''}
                        `}
                        style={{
                          boxShadow: isSelected ? 'inset 4px 0 0 #262626' : 'none',
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
              </AnimatedCollapsible>
            ))}
          </div>
        </ScrollArea.Viewport>
      </ScrollArea>
      
      {/* Floating scroll button */}
      {showScrollButton && (
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-4 right-2 rounded-full shadow-lg transition-all duration-300 hover:bg-gray-200 z-10"
          onClick={handleScrollAction}
        >
          {isAtBottom ? (
            <ArrowUp className="h-5 w-5" />
          ) : (
            <ArrowDown className="h-5 w-5" />
          )}
        </Button>
      )}
    </div>
  );
}
