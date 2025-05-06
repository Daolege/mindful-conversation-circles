
import React, { useState, useCallback, memo } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HomeworkSubmissionForm } from "./HomeworkSubmissionForm";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Homework } from '@/lib/types/homework';

interface HomeworkCardProps {
  homework: {
    id: string;
    title: string;
    description?: string | null;
    type: string;
    options?: any;
    image_url?: string | null;
    lecture_id: string;
    course_id: number;
    position?: number;
  };
  courseId: string | number; 
  lectureId: string;
  isSubmitted: boolean;
  onSubmitted?: () => void;
  position?: number;
}

export const HomeworkCard = memo(({ 
  homework, 
  courseId, 
  lectureId, 
  isSubmitted, 
  onSubmitted,
  position 
}: HomeworkCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  // Ensure courseId is always a number
  const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;

  // Use useCallback to memoize event handler functions
  const handleHeaderClick = useCallback((e: React.MouseEvent) => {
    // Only expand if not already submitted and prevent event bubbling
    if (!isSubmitted) {
      e.preventDefault();
      e.stopPropagation();
      setIsExpanded(prev => !prev);
    }
  }, [isSubmitted]);

  const handleSubmissionSuccess = useCallback(() => {
    // Close the form and notify parent
    setIsExpanded(false);
    if (onSubmitted) {
      // Use a timeout to avoid state updates during render
      setTimeout(() => {
        onSubmitted();
      }, 10);
    }
  }, [onSubmitted]);

  const handleCancel = useCallback(() => {
    setIsExpanded(false);
  }, []);

  // Control hover state
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Prevent event bubbling for the content area
  const handleContentClick = useCallback((e: React.MouseEvent) => {
    // Stop propagation to parent elements
    e.stopPropagation();
  }, []);

  // Check for content overflow and update state
  const handleContentRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      // We need a small delay to ensure the content is rendered
      setTimeout(() => {
        const hasVerticalScroll = node.scrollHeight > node.clientHeight;
        setHasOverflow(hasVerticalScroll);
      }, 50);
    }
  }, []);

  return (
    <Card 
      className={`w-full border border-gray-200 shadow-sm transition-all duration-300 ${
        isHovered ? 'shadow-md transform translate-y-[-2px]' : ''
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-homework-id={homework.id}
      data-position={position}
      data-testid={`homework-card-${homework.id}`}
    >
      <CardHeader 
        className={`flex flex-row items-center justify-between ${
          !isSubmitted ? 'cursor-pointer hover:bg-gray-50' : ''
        } p-4`}
        onClick={handleHeaderClick}
      >
        <div className="flex items-center gap-3 flex-1 mr-4">
          <div className="font-medium truncate">{homework.title}</div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Badge variant={isSubmitted ? "outline" : "outline"} className={`text-xs min-w-[60px] text-center ${isSubmitted ? "bg-gray-100 text-gray-700" : "border border-gray-300 text-gray-500"}`}>
            {isSubmitted ? "已提交" : "未提交"}
          </Badge>
          {!isSubmitted && (
            <div className="transition-transform duration-300">
              {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded && !isSubmitted ? 
            `max-h-[${hasOverflow ? '4000' : '2000'}px] opacity-100 pb-4` : 
            'max-h-0 opacity-0 p-0'
        }`}
        onClick={handleContentClick}
        ref={handleContentRef}
      >
        {isExpanded && !isSubmitted && (
          <div className="bg-white rounded-md border border-gray-100 shadow-sm max-h-[80vh] overflow-auto">
            <HomeworkSubmissionForm 
              homework={homework}
              courseId={numericCourseId}
              lectureId={lectureId}
              onSubmitSuccess={handleSubmissionSuccess}
              onCancel={handleCancel}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// 设置组件显示名称，便于调试
HomeworkCard.displayName = 'HomeworkCard';
