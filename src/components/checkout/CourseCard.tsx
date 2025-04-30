
import React from 'react';
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface CourseCardProps {
  title: string;
  description?: string;
  imageUrl?: string;
  courseId?: number | string;
}

export const CourseCard: React.FC<CourseCardProps> = ({ 
  title, 
  description, 
  imageUrl, 
  courseId 
}) => {
  return (
    <Card className="p-6 animate-in fade-in duration-500">
      <div className="mb-4">
        <Link 
          to={courseId ? `/course/${courseId}` : "/courses"} 
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
