
import React from 'react';
import { CourseWithDetails } from '@/lib/types/course-new';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface CourseBreadcrumbProps {
  course: CourseWithDetails;
}

export const CourseBreadcrumb: React.FC<CourseBreadcrumbProps> = ({ course }) => {
  const isMobile = useIsMobile();

  return (
    <div className={`flex ${isMobile ? 'flex-wrap' : 'items-center'} py-4 animate-in fade-in duration-500`}>
      <Link 
        to="/" 
        className="text-gray-500 hover:text-gray-800 transition-colors duration-300 flex items-center"
      >
        首页
      </Link>
      <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
      <Link 
        to="/courses" 
        className="text-gray-500 hover:text-gray-800 transition-colors duration-300 flex items-center"
      >
        课程
      </Link>
      {course.category && (
        <>
          <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
          <Link 
            to={`/courses?category=${encodeURIComponent(course.category)}`} 
            className="text-gray-500 hover:text-gray-800 transition-colors duration-300 max-w-[150px] truncate flex items-center"
          >
            {course.category}
          </Link>
        </>
      )}
      <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
      <span className="text-gray-900 font-medium truncate max-w-[200px] md:max-w-none">
        {course.title}
      </span>
    </div>
  );
};
