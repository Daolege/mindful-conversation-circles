
import React from 'react';
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Tag } from "lucide-react";
import { CourseNew } from "@/lib/types/course-new";

interface CourseCardNewProps {
  course: CourseNew;
  variantIndex?: number;
}

const CourseCardNew = ({ course, variantIndex = 0 }: CourseCardNewProps) => {
  // Calculate discount percentage if there's an original price
  const hasDiscount = course.original_price && course.original_price > course.price;
  const discount = hasDiscount 
    ? Math.round(((course.original_price - course.price) / course.original_price) * 100) 
    : 0;

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/courses-new/${course.id}`} className="block">
        <Card className="overflow-hidden h-[380px] border-0 shadow-md hover:shadow-xl transition-shadow duration-300 bg-white relative">
          {/* Card top image section */}
          <div className="h-48 relative overflow-hidden">
            {course.thumbnail_url ? (
              <img 
                src={course.thumbnail_url} 
                alt={course.title} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-500">课程图片</span>
              </div>
            )}
            
            {/* Featured badge */}
            {course.is_featured && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-black text-white">热门课程</Badge>
              </div>
            )}
            
            {/* Discount badge */}
            {hasDiscount && (
              <div className="absolute top-3 left-3">
                <Badge variant="destructive" className="font-bold">
                  {discount}% OFF
                </Badge>
              </div>
            )}
          </div>
          
          {/* Card content */}
          <div className="p-5 flex flex-col h-[200px]">
            {/* Category */}
            {course.category && (
              <Badge 
                variant="outline" 
                className="self-start mb-2 text-xs font-normal border-gray-200 text-gray-600 flex items-center gap-1"
              >
                <Tag className="w-3 h-3" />
                {course.category}
              </Badge>
            )}
            
            {/* Title */}
            <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900">{course.title}</h3>
            
            {/* Stats row */}
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{course.enrollment_count || 0}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>随时学习</span>
              </div>
            </div>
            
            {/* Price section */}
            <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
              <div className="flex items-end gap-2">
                <span className="text-xl font-bold text-gray-900">¥{course.price}</span>
                {hasDiscount && (
                  <span className="text-sm text-gray-500 line-through">¥{course.original_price}</span>
                )}
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge className="bg-black text-white hover:bg-gray-800 cursor-pointer px-3 py-1">
                  立即查看
                </Badge>
              </motion.div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default CourseCardNew;
