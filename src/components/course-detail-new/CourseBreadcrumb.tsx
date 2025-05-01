
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
    <nav className={`py-4 animate-in fade-in duration-500`}>
      <ol className={`flex ${isMobile ? 'flex-wrap gap-y-2' : 'items-center'}`}>
        <li>
          <Link 
            to="/" 
            className="text-gray-500 hover:text-gray-800 transition-colors duration-300"
          >
            首页
          </Link>
        </li>
        <li className="mx-2 flex items-center">
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </li>
        <li>
          <Link 
            to="/courses" 
            className="text-gray-500 hover:text-gray-800 transition-colors duration-300"
          >
            课程
          </Link>
        </li>
        {course.category && (
          <>
            <li className="mx-2 flex items-center">
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </li>
            <li>
              <Link 
                to={`/courses?category=${encodeURIComponent(course.category)}`} 
                className="text-gray-500 hover:text-gray-800 transition-colors duration-300 max-w-[150px] truncate"
              >
                {course.category}
              </Link>
            </li>
          </>
        )}
        <li className="mx-2 flex items-center">
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </li>
        <li>
          <span className="text-gray-900 font-medium truncate max-w-[200px] md:max-w-none">
            {course.title}
          </span>
        </li>
      </ol>
    </nav>
  );
};
