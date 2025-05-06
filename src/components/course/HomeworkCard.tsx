
import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HomeworkSubmissionForm } from "./HomeworkSubmissionForm";
import { ChevronDown, ChevronUp } from "lucide-react";

interface HomeworkCardProps {
  homework: {
    id: string;
    title: string;
    description: string | null;
    type: 'single_choice' | 'multiple_choice' | 'fill_blank';
    options: any;
    image_url: string | null;
    lecture_id: string;
    position?: number;
  };
  courseId: string; 
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

  // 确定显示的编号
  const displayPosition = position || homework.position || 1;

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
        }`}
        onClick={handleHeaderClick}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 bg-blue-100 text-blue-700 font-medium text-sm px-2.5 py-0.5 rounded">
            {displayPosition}
          </div>
          <div className="font-medium">{homework.title}</div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isSubmitted ? "success" : "outline"} className="text-xs">
            {isSubmitted ? "已提交" : "未提交"}
          </Badge>
          {!isSubmitted && (
            <div className="transition-transform duration-200">
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent 
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded && !isSubmitted ? 'max-h-[1000px]' : 'max-h-0'
        }`}
        style={{ display: isExpanded && !isSubmitted ? 'block' : 'none' }}
      >
        {isExpanded && !isSubmitted && (
          <div className="space-y-4 bg-white rounded-md border border-gray-100 shadow-sm">
            <HomeworkSubmissionForm 
              homework={homework}
              courseId={courseId}
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
