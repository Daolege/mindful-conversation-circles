
import React from 'react';
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CourseNew } from "@/lib/types/course-new";
import { Users, Clock } from "lucide-react";

interface NewHomePageCourseCardProps {
  course: CourseNew;
  index: number;
}

const NewHomePageCourseCard = ({ course, index }: NewHomePageCourseCardProps) => {
  // Calculate discount if applicable
  const hasDiscount = course.original_price && course.original_price > course.price;
  const discount = hasDiscount 
    ? Math.round(((course.original_price - course.price) / course.original_price) * 100) 
    : 0;
  
  const getGrayGradient = (index: number) => {
    const variants = [
      'from-gray-100 to-gray-200',
      'from-gray-200 to-gray-300',
      'from-gray-50 to-gray-200',
      'from-gray-200 to-gray-100',
    ];
    return variants[index % variants.length];
  };

  return (
    <Link to={`/courses-new/${course.id}`} className="block transform transition-all duration-500 hover:translate-y-[-8px]">
      <Card className="overflow-hidden h-[320px] relative border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Card background */}
        <div className="absolute inset-0 bg-gradient-to-br ${getGrayGradient(index)} opacity-80"></div>
        
        {/* Top section with course tags */}
        <div className="relative p-3 flex flex-wrap gap-2 border-b border-gray-100">
          <div className="flex items-center bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs">
            <Users className="w-3.5 h-3.5 mr-1.5" />
            <span>{course.enrollment_count || 0}人已学习</span>
          </div>
          
          <div className="flex items-center bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            <span>随时学习</span>
          </div>
          
          {hasDiscount && (
            <div className="ml-auto bg-gray-800 text-white rounded-full px-3 py-1 text-xs font-medium">
              {discount}% OFF
            </div>
          )}
        </div>
        
        {/* Main content */}
        <div className="relative p-5 flex flex-col h-[220px]">
          {/* Title - allow space for long titles */}
          <h3 className="text-xl font-bold mb-4 line-clamp-3 text-gray-900 group-hover:text-black">
            {course.title}
          </h3>
          
          {/* Optional description if available */}
          {course.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{course.description}</p>
          )}
          
          {/* Price section at bottom */}
          <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">¥{course.price}</span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">¥{course.original_price}</span>
              )}
            </div>
            
            <Badge 
              variant="outline" 
              className="bg-gray-900 hover:bg-black text-white border-gray-900 hover:border-black hover:text-white transition-colors duration-200">
              立即查看
            </Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default NewHomePageCourseCard;
