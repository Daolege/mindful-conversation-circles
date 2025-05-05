
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
  };
  courseId: string; // Add courseId prop to interface
  lectureId: string; // Add lectureId prop to interface
  isSubmitted: boolean;
  onSubmitted?: () => void;
}

// 使用 memo 优化组件，避免不必要的重新渲染
export const HomeworkCard = React.memo(({ homework, courseId, lectureId, isSubmitted, onSubmitted }: HomeworkCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
    <Card className="w-full border border-gray-200 shadow-sm">
      <CardHeader 
        className={`flex flex-row items-center justify-between ${!isSubmitted ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={handleHeaderClick}
      >
        <div className="font-medium">{homework.title}</div>
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
      
      <CardContent className={`data-[state=${isExpanded ? 'open' : 'closed'}]:animate-${isExpanded ? 'accordion-down' : 'accordion-up'} overflow-hidden`}
        style={{ display: isExpanded && !isSubmitted ? 'block' : 'none' }}
      >
        {isExpanded && !isSubmitted && (
          <div className="space-y-4 bg-white rounded-md border border-gray-100 shadow-sm">
            <HomeworkSubmissionForm 
              homework={homework}
              courseId={courseId} // Pass courseId to HomeworkSubmissionForm
              lectureId={lectureId} // Pass lectureId to HomeworkSubmissionForm
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
