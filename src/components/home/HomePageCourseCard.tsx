import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowRight } from "lucide-react";
import { CourseNew } from '@/lib/types/course-new';
import { useTranslations } from "@/hooks/useTranslations";
import LocalizedCurrency from "@/components/LocalizedCurrency";

interface HomePageCourseCardProps {
  course: CourseNew;
  index: number;
}

const HomePageCourseCard = ({ course, index }: HomePageCourseCardProps) => {
  const { t } = useTranslations();
  
  // Calculate discount if applicable
  const hasDiscount = course.original_price && course.original_price > course.price;
  const discount = hasDiscount 
    ? Math.round(((course.original_price - course.price) / course.original_price) * 100) 
    : 0;
  
  // Generate gradient variants based on index
  const gradientVariants = [
    "from-blue-600/20 via-indigo-500/20 to-purple-500/20",
    "from-purple-600/20 via-pink-500/20 to-rose-500/20",
    "from-emerald-600/20 via-teal-500/20 to-cyan-500/20",
    "from-orange-600/20 via-amber-500/20 to-yellow-500/20",
  ];
  
  // Select gradient based on index
  const gradientClass = gradientVariants[index % gradientVariants.length];

  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Link to={`/courses-new/${course.id}`}>
        <Card className="overflow-hidden h-[300px] relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-80"></div>
          
          {/* Background shapes */}
          <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-gradient-to-r from-white/5 to-white/10 transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute left-0 bottom-0 w-24 h-24 rounded-full bg-gradient-to-r from-white/5 to-white/10 transform -translate-x-1/3 translate-y-1/3"></div>
          
          {/* Content */}
          <div className="relative p-5 flex flex-col h-full z-10">
            {/* Category tag */}
            {course.language && (
              <div className="mb-2">
                <Badge variant="outline" className="px-2 py-1 text-xs">
                  {course.language || '中文'}
                </Badge>
              </div>
            )}
            
            {/* Title */}
            <h3 className="font-bold text-xl mb-2 text-white drop-shadow-sm line-clamp-2 group-hover:text-white/90 transition-colors">
              {course.title}
            </h3>
            
            {/* Description if available */}
            {course.description && (
              <p className="text-sm text-white/80 line-clamp-2 mb-2">{course.description}</p>
            )}
            
            {/* Statistics Row */}
            <div className="mt-auto">
              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex">
                  {Array(5).fill(0).map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-4 h-4 text-yellow-400 fill-yellow-400" 
                    />
                  ))}
                </div>
                <span className="text-xs text-white/90 ml-2">(5.0)</span>
                
                {/* Enrollment count */}
                {course.enrollment_count !== undefined && (
                  <span className="text-xs text-white/80 ml-auto">
                    {course.enrollment_count} {t('courses:students')}
                  </span>
                )}
              </div>
              
              {/* Price section */}
              <div className="flex items-end justify-between pt-3 border-t border-white/20">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white">
                    <LocalizedCurrency amount={course.price} currency="CNY" />
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-white/70 line-through">
                      <LocalizedCurrency amount={course.original_price || 0} currency="CNY" />
                    </span>
                  )}
                  {hasDiscount && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {discount}% {t('common:off')}
                    </Badge>
                  )}
                </div>
                
                {/* View button */}
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all duration-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default HomePageCourseCard;
