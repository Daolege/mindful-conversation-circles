
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
  const viewportRef = useRef(null);
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
      if (!viewportRef.current) return;
      
      const viewport = viewportRef.current;
      const { scrollHeight, clientHeight, scrollTop } = viewport;
      const hasScroll = scrollHeight > clientHeight;
      
      console.log('Scroll check:', { 
        scrollHeight, 
        clientHeight, 
        scrollTop,
        hasScroll,
        sectionsExpanded: Object.keys(expandedSections).length
      });
      
      setShowScrollButton(hasScroll);
      
      // Check if we're at the bottom (with a 20px threshold)
      const isBottom = scrollTop + clientHeight >= scrollHeight - 20;
      setIsAtBottom(isBottom);
    };

    // Use setTimeout to ensure the DOM has updated after state changes
    const timer = setTimeout(() => {
      checkScroll();
    }, 100);
    
    // Add scroll event listener
    const viewport = viewportRef.current;
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
      clearTimeout(timer);
    };
  }, [syllabusData, expandedSections]); // Add expandedSections as dependency

  const toggleSection = (sectionIndex) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  const handleScrollAction = () => {
    if (!viewportRef.current) return;
    
    const viewport = viewportRef.current;
    
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
    <div className="relative flex flex-col h-full">
      <ScrollArea 
        ref={scrollAreaRef} 
        className="flex-grow"
        scrollHideDelay={0}
      >
        <div 
          ref={viewportRef} 
          className="h-full w-full rounded-[inherit] pr-3"
          style={{ maxHeight: 'calc(100vh - 280px)', minHeight: '300px', overflow: 'auto' }}
        >
          <div className="space-y-3">
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
        </div>
      </ScrollArea>
      
      {/* Floating scroll button - Enhanced visibility */}
      {showScrollButton && (
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-4 right-2 rounded-full shadow-lg transition-all duration-300 hover:bg-gray-200 z-10 w-10 h-10 border border-gray-300 bg-white hover:scale-110"
          onClick={handleScrollAction}
          title={isAtBottom ? "Scroll to top" : "Scroll to bottom"}
        >
          {isAtBottom ? (
            <ArrowUp className="h-5 w-5 text-gray-700" />
          ) : (
            <ArrowDown className="h-5 w-5 text-gray-700" />
          )}
        </Button>
      )}
    </div>
  );
}
