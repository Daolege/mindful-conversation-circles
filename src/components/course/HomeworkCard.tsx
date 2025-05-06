
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

  // 确保courseId始终为数字类型
  const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;

  // 使用useCallback缓存事件处理函数
  const handleHeaderClick = useCallback((e: React.MouseEvent) => {
    // 仅在未提交时展开，并防止事件冒泡
    if (!isSubmitted) {
      e.preventDefault();
      e.stopPropagation();
      setIsExpanded(prev => !prev);
    }
  }, [isSubmitted]);

  const handleSubmissionSuccess = useCallback(() => {
    // 关闭表单并通知父组件
    setIsExpanded(false);
    if (onSubmitted) {
      // 使用超时避免渲染期间的状态更新
      setTimeout(() => {
        onSubmitted();
      }, 10);
    }
  }, [onSubmitted]);

  const handleCancel = useCallback(() => {
    setIsExpanded(false);
  }, []);

  // 控制悬停状态
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // 防止内容区域的事件冒泡
  const handleContentClick = useCallback((e: React.MouseEvent) => {
    // 阻止向父元素传播
    e.stopPropagation();
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
          <Badge variant={isSubmitted ? "outline" : "outline"} className={`text-xs min-w-[80px] text-center ${isSubmitted ? "bg-gray-100 text-gray-700" : "border border-gray-300 text-gray-500"}`}>
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
        className={`transition-all duration-500 ease-in-out ${
          isExpanded && !isSubmitted ? 
            'opacity-100 pb-4' : 
            'max-h-0 opacity-0 p-0'
        }`}
        onClick={handleContentClick}
      >
        {isExpanded && !isSubmitted && (
          <div className="bg-white rounded-md border border-gray-100 shadow-sm">
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
