
import React, { useState, useCallback } from 'react';
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

export const HomeworkCard = React.memo(({ 
  homework, 
  courseId, 
  lectureId, 
  isSubmitted, 
  onSubmitted,
  position 
}: HomeworkCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Ensure courseId is always a number
  const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;

  const handleHeaderClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isSubmitted) {
      setIsExpanded(prev => !prev);
    }
  }, [isSubmitted]);

  const handleSubmissionSuccess = useCallback(() => {
    setIsExpanded(false);
    onSubmitted?.();
  }, [onSubmitted]);

  const handleCancel = useCallback(() => {
    setIsExpanded(false);
  }, []);

  return (
    <Card 
      className={`w-full border border-gray-200 shadow-sm transition-all duration-200 ${
        isHovered ? 'shadow-md transform translate-y-[-2px]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader 
        className={`flex flex-row items-center justify-between ${
          !isSubmitted ? 'cursor-pointer hover:bg-gray-50' : ''
        } p-4`}
        onClick={handleHeaderClick}
      >
        <div className="flex items-center gap-3">
          <div className="font-medium">{homework.title}</div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isSubmitted ? "outline" : "outline"} className={`text-xs ${isSubmitted ? "bg-gray-100 text-gray-700" : "border border-gray-300 text-gray-500"}`}>
            {isSubmitted ? "已提交" : "未提交"}
          </Badge>
          {!isSubmitted && (
            <div className="transition-transform duration-200">
              {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent 
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded && !isSubmitted ? 'max-h-[1000px]' : 'max-h-0'
        }`}
        style={{ padding: isExpanded && !isSubmitted ? '1rem' : '0', display: isExpanded && !isSubmitted ? 'block' : 'none' }}
      >
        {isExpanded && !isSubmitted && (
          <div className="space-y-4 bg-white rounded-md border border-gray-100 shadow-sm">
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
