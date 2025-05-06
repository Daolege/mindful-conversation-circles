
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [containerHeight, setContainerHeight] = useState('500px'); // Start with a reasonable height
  const [heightChecksAttempted, setHeightChecksAttempted] = useState(0);
  const scrollAreaRef = useRef(null);
  const viewportRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const mutationObserverRef = useRef(null);
  const heightCheckTimersRef = useRef([]);
  const { t } = useTranslations();

  // If there's no expanded sections yet, open the first one
  useEffect(() => {
    if (syllabusData && syllabusData.length > 0 && Object.keys(expandedSections).length === 0) {
      setExpandedSections({0: true});
    }
  }, [syllabusData]);

  // Check if scroll is needed and detect position
  const checkScroll = useCallback(() => {
    if (!viewportRef.current) return;
    
    const viewport = viewportRef.current;
    const { scrollHeight, clientHeight, scrollTop } = viewport;
    const hasScroll = scrollHeight > clientHeight;
    
    console.log('[CourseSyllabus] Scroll check:', { 
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
  }, [expandedSections]);

  // Function to update height based on homework module
  const updateSyllabusHeight = useCallback(() => {
    try {
      // Find the homework section
      const homeworkSection = document.querySelector('.homework-module');
      
      if (!homeworkSection) {
        console.log('[CourseSyllabus] Homework section not found yet, attempt:', heightChecksAttempted);
        return false; // Not found yet
      }
      
      const homeworkHeight = homeworkSection.getBoundingClientRect().height;
      console.log('[CourseSyllabus] Found homework section with height:', homeworkHeight);
      
      if (homeworkHeight < 50) {
        console.log('[CourseSyllabus] Homework height too small, likely still loading');
        return false; // Height too small, probably still loading
      }
      
      // Set the container height to match homework module with a minimum
      const targetHeight = Math.max(500, homeworkHeight);
      setContainerHeight(`${targetHeight}px`);
      console.log('[CourseSyllabus] Setting syllabus height to:', targetHeight);

      // After height is updated, check if scroll is needed
      setTimeout(checkScroll, 100);
      return true; // Successfully updated
    } catch (error) {
      console.error('[CourseSyllabus] Error updating height:', error);
      return false;
    }
  }, [checkScroll, heightChecksAttempted]);
  
  // Progressive height checking with multiple attempts
  const scheduleProgressiveHeightChecks = useCallback(() => {
    // Clear any existing timers
    heightCheckTimersRef.current.forEach(timer => clearTimeout(timer));
    heightCheckTimersRef.current = [];
    
    // Schedule multiple checks with increasing delays
    const checkDelays = [500, 1000, 2000, 3000, 5000];
    
    checkDelays.forEach((delay, index) => {
      const timer = setTimeout(() => {
        console.log(`[CourseSyllabus] Performing height check #${index + 1} after ${delay}ms`);
        const success = updateSyllabusHeight();
        
        if (success) {
          console.log(`[CourseSyllabus] Height check #${index + 1} successful`);
          // Cancel remaining checks
          heightCheckTimersRef.current.slice(index + 1).forEach(t => clearTimeout(t));
          heightCheckTimersRef.current = heightCheckTimersRef.current.slice(0, index + 1);
        } else {
          setHeightChecksAttempted(prev => prev + 1);
        }
      }, delay);
      
      heightCheckTimersRef.current.push(timer);
    });
  }, [updateSyllabusHeight]);

  // Set up observers for homework module
  useEffect(() => {
    console.log('[CourseSyllabus] Setting up observers for homework module');
    
    // Initial delay to ensure basic DOM is loaded
    const initialSetupTimer = setTimeout(() => {
      // Initialize height
      updateSyllabusHeight();
      
      // Set up ResizeObserver for homework section size changes
      if (!resizeObserverRef.current) {
        resizeObserverRef.current = new ResizeObserver(entries => {
          console.log('[CourseSyllabus] Resize detected in homework module');
          updateSyllabusHeight();
        });
        
        // Find and observe the homework section
        const homeworkSection = document.querySelector('.homework-module');
        if (homeworkSection) {
          console.log('[CourseSyllabus] Found homework section, setting up ResizeObserver');
          resizeObserverRef.current.observe(homeworkSection);
        } else {
          console.log('[CourseSyllabus] Homework section not found initially, scheduling checks');
          scheduleProgressiveHeightChecks();
        }
      }
      
      // Set up MutationObserver to detect content changes in homework section
      if (!mutationObserverRef.current) {
        mutationObserverRef.current = new MutationObserver((mutations) => {
          console.log('[CourseSyllabus] DOM mutation detected in homework area, mutations:', mutations.length);
          // Schedule height update on mutation
          setTimeout(() => {
            updateSyllabusHeight();
          }, 300); // Slight delay to allow DOM to stabilize after mutation
        });
        
        // Find parent containers of homework module
        const contentArea = document.querySelector('.lg\\:col-span-2');
        if (contentArea) {
          console.log('[CourseSyllabus] Found content area, setting up MutationObserver');
          mutationObserverRef.current.observe(contentArea, { 
            childList: true, 
            subtree: true, 
            attributes: true,
            characterData: true
          });
        }
      }
      
      // Additional hook for window resize
      const handleResize = () => {
        console.log('[CourseSyllabus] Window resize detected');
        updateSyllabusHeight();
      };
      
      window.addEventListener('resize', handleResize);
      
      // Wait for everything to be fully loaded
      if (document.readyState === 'complete') {
        console.log('[CourseSyllabus] Document already complete, checking height');
        updateSyllabusHeight();
      } else {
        window.addEventListener('load', () => {
          console.log('[CourseSyllabus] Window load event, checking height');
          updateSyllabusHeight();
          scheduleProgressiveHeightChecks();
        });
      }
      
      return () => {
        // Clean up
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }
        if (mutationObserverRef.current) {
          mutationObserverRef.current.disconnect();
        }
        window.removeEventListener('resize', handleResize);
        heightCheckTimersRef.current.forEach(timer => clearTimeout(timer));
      };
    }, 1500); // Longer initial delay to ensure DOM is ready
    
    return () => clearTimeout(initialSetupTimer);
  }, [updateSyllabusHeight, scheduleProgressiveHeightChecks]);

  // When section toggle state changes, update height
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('[CourseSyllabus] Sections changed, checking height');
      updateSyllabusHeight();
      checkScroll();
    }, 500);
    
    // Add scroll event listener
    const viewport = viewportRef.current;
    if (viewport) {
      viewport.addEventListener('scroll', checkScroll);
    }

    return () => {
      if (viewport) {
        viewport.removeEventListener('scroll', checkScroll);
      }
      clearTimeout(timer);
    };
  }, [syllabusData, expandedSections, checkScroll, updateSyllabusHeight]);

  const toggleSection = (sectionIndex) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
    
    // Check scroll after toggling section (with delay to allow animation)
    setTimeout(checkScroll, 500);
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
          ref={node => {
            if (node) {
              viewportRef.current = node;
              checkScroll();
            }
          }}
          className="h-full w-full rounded-[inherit] pr-3"
          style={{
            maxHeight: containerHeight,
            minHeight: '500px',
            transition: 'max-height 0.3s ease-in-out',
            overflow: 'auto'
          }}
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
      
      {/* Centered floating scroll button with updated colors */}
      {showScrollButton && (
        <div className="absolute -bottom-4 left-0 right-0 flex justify-center z-10">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full shadow-lg transition-all duration-300 z-10 w-10 h-10 
                     bg-[#8B8B8B] text-white border border-gray-300 
                     hover:bg-gray-700 hover:scale-110"
            onClick={handleScrollAction}
            title={isAtBottom ? "Scroll to top" : "Scroll to bottom"}
          >
            {isAtBottom ? (
              <ArrowUp className="h-5 w-5 text-white" />
            ) : (
              <ArrowDown className="h-5 w-5 text-white" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
