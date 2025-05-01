
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
      <ol className={`flex flex-wrap items-center ${isMobile ? 'gap-1 text-sm' : ''}`}>
        <li>
          <Link 
            to="/" 
            className="text-gray-500 hover:text-gray-800 transition-colors duration-300"
          >
            首页
          </Link>
        </li>
        <li className="mx-1 flex items-center">
          <ChevronRight className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-gray-400`} />
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
            <li className="mx-1 flex items-center">
              <ChevronRight className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-gray-400`} />
            </li>
            <li>
              <Link 
                to={`/courses?category=${encodeURIComponent(course.category)}`} 
                className="text-gray-500 hover:text-gray-800 transition-colors duration-300 truncate"
                style={{ maxWidth: isMobile ? '80px' : '150px', display: 'inline-block' }}
              >
                {course.category}
              </Link>
            </li>
          </>
        )}
        <li className="mx-1 flex items-center">
          <ChevronRight className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-gray-400`} />
        </li>
        <li>
          <span 
            className="text-gray-900 font-medium truncate inline-block"
            style={{ maxWidth: isMobile ? '120px' : '200px' }}
          >
            {course.title}
          </span>
        </li>
      </ol>
    </nav>
  );
};
