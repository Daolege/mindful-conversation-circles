
import React from 'react';
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface CourseCardProps {
  title: string;
  description?: string;
  imageUrl?: string;
  courseId?: number | string;
  isNewCourse?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({ 
  title, 
  description, 
  imageUrl, 
  courseId,
  isNewCourse
}) => {
  const location = useLocation();
  
  // Determine if this is a new course from location state if not explicitly provided
  const isNewCourseFromState = location.state?.isNewCourse;
  const isFromNewSystem = isNewCourse !== undefined ? isNewCourse : isNewCourseFromState;
  
  // Determine the return URL based on course system
  const returnUrl = courseId 
    ? (isFromNewSystem 
        ? `/courses-new/${courseId}` 
        : `/course/${courseId}`)
    : "/courses";

  return (
    <Card className="p-6 animate-in fade-in duration-500">
      <div className="mb-4">
        <Link 
          to={returnUrl}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回课程详情
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        {imageUrl && (
          <div className="w-full md:w-1/4">
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-32 md:h-24 object-cover rounded-md"
            />
          </div>
        )}
        
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
          )}
        </div>
      </div>
    </Card>
  );
};
