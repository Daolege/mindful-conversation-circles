
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
  
  // Dynamic gradient variants based on index
  const getGradientClass = (index: number) => {
    // These gradients use grayscale colors but with dynamic effects
    const gradientVariants = [
      'from-gray-100 via-gray-200 to-gray-300',
      'from-gray-200 via-gray-300 to-gray-200',
      'from-gray-50 via-gray-100 to-gray-200',
      'from-gray-300 via-gray-200 to-gray-100',
    ];
    return gradientVariants[index % gradientVariants.length];
  };
  
  // Dynamic hover effect class
  const getHoverEffect = (index: number) => {
    const hoverEffects = [
      'hover:from-gray-200 hover:via-gray-300 hover:to-gray-400',
      'hover:from-gray-300 hover:via-gray-400 hover:to-gray-300',
      'hover:from-gray-100 hover:via-gray-200 hover:to-gray-300',
      'hover:from-gray-400 hover:via-gray-300 hover:to-gray-200',
    ];
    return hoverEffects[index % hoverEffects.length];
  };

  return (
    <Link to={`/courses-new/${course.id}`} className="block transform transition-all duration-500 hover:translate-y-[-8px]">
      <Card className="overflow-hidden h-[320px] relative border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Dynamic background with gradient effects */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getGradientClass(index)} ${getHoverEffect(index)} transition-all duration-300`}></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-gray-400/5 rounded-full transform translate-x-1/3 -translate-y-1/3 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tl from-white/5 to-gray-400/5 rounded-full transform -translate-x-1/3 translate-y-1/3 blur-xl"></div>
          
          {/* Animated subtle particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-white/20 animate-pulse" style={{animationDuration: '3s'}}></div>
          <div className="absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-white/10 animate-pulse" style={{animationDuration: '5s'}}></div>
        </div>
        
        {/* Top section with course tags - ALL TAGS GO HERE */}
        <div className="relative p-3 flex flex-wrap gap-2">
          {/* Enrollment count tag if available */}
          {course.enrollment_count !== undefined && (
            <div className="flex items-center bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              <span>{course.enrollment_count}人已学习</span>
            </div>
          )}
          
          {/* "Study anytime" tag */}
          <div className="flex items-center bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            <span>随时学习</span>
          </div>
          
          {/* Discount tag */}
          {hasDiscount && (
            <div className="ml-auto bg-gray-800 text-white rounded-full px-3 py-1 text-xs font-medium">
              {discount}% OFF
            </div>
          )}
        </div>
        
        {/* Main content */}
        <div className="relative p-5 flex flex-col h-[250px]">
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
