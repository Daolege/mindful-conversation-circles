
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
  const [containerHeight, setContainerHeight] = useState('550px'); // Increased default minimum height
  const scrollAreaRef = useRef(null);
  const viewportRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const mutationObserverRef = useRef(null);
  const [hasHomework, setHasHomework] = useState(true);
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
    
    setShowScrollButton(hasScroll);
    
    // Check if we're at the bottom (with a 20px threshold)
    const isBottom = scrollTop + clientHeight >= scrollHeight - 20;
    setIsAtBottom(isBottom);
  }, []);

  // Detect if homework exists and update container height accordingly
  const updateSyllabusHeight = useCallback(() => {
    try {
      // Try to find both homework content and "no homework" message elements
      const homeworkSelectors = [
        '.homework-module .HomeworkCard',
        '.homework-module form',
        '.homework-module [class*="form"]',
        '.homework-module [class*="editor"]'
      ];
      
      const noHomeworkSelectors = [
        '.homework-module p:contains("该课时暂无作业")',
        '.homework-module div:contains("该课时暂无作业")',
        '.homework-module .text-center', // Common pattern for no homework message
        '.homework-module div.flex.justify-center',
        '.homework-module div.py-8',
        '.homework-module div.p-6',
        '.HomeworkModule .text-center',
        '.HomeworkModule .py-8'
      ];
      
      // Check for homework content
      let hasHomeworkContent = false;
      for (const selector of homeworkSelectors) {
        try {
          const elements = document.querySelectorAll(selector);
          if (elements && elements.length > 0) {
            hasHomeworkContent = true;
            break;
          }
        } catch (e) {
          // Skip selector if it causes an error
        }
      }
      
      // Check for no homework message
      let hasNoHomeworkMessage = false;
      for (const selector of noHomeworkSelectors) {
        try {
          const elements = document.querySelectorAll(selector);
          if (elements && elements.length > 0) {
            const centerElements = Array.from(elements).filter(el => {
              const computedStyle = window.getComputedStyle(el);
              const textAlign = computedStyle.textAlign;
              const content = el.textContent || '';
              return (textAlign === 'center' || content.includes('暂无') || content.includes('没有'));
            });
            
            if (centerElements.length > 0) {
              hasNoHomeworkMessage = true;
              break;
            }
          }
        } catch (e) {
          // Skip selector if it causes an error
        }
      }

      // Direct text content check as fallback
      if (!hasNoHomeworkMessage) {
        const allHomeworkElements = document.querySelectorAll('.homework-module *');
        for (const el of allHomeworkElements) {
          const content = el.textContent || '';
          if (content.includes('该课时暂无作业') || 
              content.includes('暂无作业') || 
              content.includes('没有作业')) {
            hasNoHomeworkMessage = true;
            break;
          }
        }
      }
      
      // Update state based on findings
      const newHasHomework = hasHomeworkContent && !hasNoHomeworkMessage;
      setHasHomework(newHasHomework);
      
      // Set appropriate height
      if (hasNoHomeworkMessage) {
        // Get the homework module height or default to taller value for no homework
        const homeworkModule = document.querySelector('.homework-module');
        if (homeworkModule) {
          const homeworkHeight = homeworkModule.getBoundingClientRect().height;
          // Ensure minimum height for "no homework" state is sufficient 
          // (minimum 550px, or match homework module height + padding)
          const targetHeight = Math.max(550, homeworkHeight + 50);
          setContainerHeight(`${targetHeight}px`);
        } else {
          // Fallback if couldn't find homework module
          setContainerHeight('550px');
        }
      } else if (hasHomeworkContent) {
        // For actual homework content, match height with padding
        const homeworkModule = document.querySelector('.homework-module');
        if (homeworkModule) {
          const homeworkHeight = homeworkModule.getBoundingClientRect().height;
          const targetHeight = Math.max(550, homeworkHeight);
          setContainerHeight(`${targetHeight}px`);
        }
      } else {
        // Default height
        setContainerHeight('550px');
      }
      
      // After height is updated, check if scroll is needed
      setTimeout(checkScroll, 100);
      return true;
    } catch (error) {
      console.error('[CourseSyllabus] Error updating height:', error);
      return false;
    }
  }, [checkScroll]);
  
  // Set up observers and update height when component mounts
  useEffect(() => {
    // Initial height check with delay to allow rendering
    const initialCheckTimer = setTimeout(() => {
      updateSyllabusHeight();
    }, 1000);
    
    // Set up ResizeObserver for size changes
    if (!resizeObserverRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        updateSyllabusHeight();
      });
      
      // Observe homework module and parent containers
      const homeworkModule = document.querySelector('.homework-module');
      const mainContent = document.querySelector('.lg\\:col-span-2');
      
      if (homeworkModule) {
        resizeObserverRef.current.observe(homeworkModule);
      }
      
      if (mainContent) {
        resizeObserverRef.current.observe(mainContent);
      }
    }
    
    // Set up MutationObserver for DOM changes
    if (!mutationObserverRef.current) {
      mutationObserverRef.current = new MutationObserver(() => {
        updateSyllabusHeight();
      });
      
      // Observe the main content area
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mutationObserverRef.current.observe(mainContent, {
          childList: true,
          subtree: true,
          attributes: true
        });
      }
    }
    
    // Add window load/resize listeners
    window.addEventListener('load', updateSyllabusHeight);
    window.addEventListener('resize', updateSyllabusHeight);
    
    // Setup regular height checks for stability
    const regularCheckTimer = setInterval(updateSyllabusHeight, 2000);
    
    return () => {
      clearTimeout(initialCheckTimer);
      clearInterval(regularCheckTimer);
      
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }
      
      window.removeEventListener('load', updateSyllabusHeight);
      window.removeEventListener('resize', updateSyllabusHeight);
    };
  }, [updateSyllabusHeight]);

  // When section toggle state changes, update height
  useEffect(() => {
    const timer = setTimeout(() => {
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
        className="flex-grow bg-white rounded-lg"
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
            minHeight: '550px', // Increased minimum height
            overflow: 'auto',
            scrollbarGutter: 'stable',
            width: '100%', // Use full width
            transition: 'max-height 0.3s ease-in-out',
          }}
        >
          <div className={`space-y-3 pb-6 ${!hasHomework ? 'min-h-[500px]' : ''}`}>
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
                            
                            {/* Video and homework status indicators */}
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
                            
                            {/* Free indicator or lock icon */}
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
