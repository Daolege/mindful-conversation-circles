
import React from 'react';
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Star } from "lucide-react";
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
        <Card className="overflow-hidden h-[400px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 bg-white group">
          {/* Card image section */}
          <div className="h-52 relative overflow-hidden">
            {course.thumbnail_url ? (
              <img 
                src={course.thumbnail_url} 
                alt={course.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">课程图片</span>
              </div>
            )}
            
            {/* Discount tag */}
            {hasDiscount && (
              <div className="absolute top-0 left-0">
                <div className="bg-black text-white px-3 py-1 font-medium">
                  {discount}% OFF
                </div>
              </div>
            )}
          </div>
          
          {/* Card content */}
          <div className="p-5 flex flex-col h-[200px]">
            {/* Title with ellipsis for long titles */}
            <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 group-hover:text-black">
              {course.title}
            </h3>
            
            {/* Course meta info */}
            <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
              <div className="flex items-center">
                <Users className="w-3.5 h-3.5 mr-1" />
                <span>{course.enrollment_count || 0}人已学习</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" />
                <span>随时学习</span>
              </div>
              {course.is_featured && (
                <Badge variant="outline" className="bg-black text-white border-black text-[10px] py-0">
                  热门
                </Badge>
              )}
            </div>
            
            {/* Category if available */}
            {course.category && (
              <div className="mb-2">
                <Badge variant="outline" className="text-xs font-normal text-gray-600">
                  {course.category}
                </Badge>
              </div>
            )}
            
            {/* Rating stars visualization */}
            <div className="flex items-center mt-auto mb-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className="w-4 h-4 text-yellow-400 fill-yellow-400" 
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-2">(5.0)</span>
            </div>
            
            {/* Price section */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-900">¥{course.price}</span>
                {hasDiscount && (
                  <span className="text-sm text-gray-400 line-through">¥{course.original_price}</span>
                )}
              </div>
              <Badge className="bg-black hover:bg-gray-800 cursor-pointer">
                立即查看
              </Badge>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default CourseCardNew;
