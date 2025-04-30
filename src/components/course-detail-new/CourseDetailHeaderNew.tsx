
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CourseWithDetails } from '@/lib/types/course-new';
import { Book, Users, Clock, Globe, Calendar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CourseDetailHeaderNewProps {
  course: CourseWithDetails;
}

export const CourseDetailHeaderNew: React.FC<CourseDetailHeaderNewProps> = ({ course }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="mb-10 animate-in fade-in duration-500">
      <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'} font-bold mb-12 animate-in fade-in slide-in-from-left-5 duration-700`}>{course.title}</h1>
      
      <div className="flex flex-wrap gap-4 mb-8">
        {course.category && (
          <Badge 
            variant="courseTag"
            className="text-sm flex items-center animate-in fade-in slide-in-from-bottom-3 duration-700 delay-[100ms]"
          >
            <Book size={16} className="mr-1" />
            {course.category}
          </Badge>
        )}
        
        <Badge 
          variant="courseTag"
          className="text-sm flex items-center animate-in fade-in slide-in-from-bottom-3 duration-700 delay-[200ms]"
        >
          <Users size={16} className="mr-1" />
          {course.enrollment_count || 0} 名学员
        </Badge>
        
        <Badge 
          variant="courseTag"
          className="text-sm flex items-center animate-in fade-in slide-in-from-bottom-3 duration-700 delay-[300ms]"
        >
          <Book size={16} className="mr-1" />
          {course.sections?.length || 0} 章节
        </Badge>
        
        <Badge 
          variant="courseTag"
          className="text-sm flex items-center animate-in fade-in slide-in-from-bottom-3 duration-700 delay-[400ms]"
        >
          <Clock size={16} className="mr-1" />
          {course.lecture_count || 0} 课时
        </Badge>
        
        {course.language && (
          <Badge 
            variant="courseTag"
            className="text-sm flex items-center animate-in fade-in slide-in-from-bottom-3 duration-700 delay-[500ms]"
          >
            <Globe size={16} className="mr-1" />
            {course.language}
          </Badge>
        )}
        
        {course.published_at && (
          <Badge 
            variant="courseTag"
            className="text-sm flex items-center animate-in fade-in slide-in-from-bottom-3 duration-700 delay-[600ms]"
          >
            <Calendar size={16} className="mr-1" />
            {new Date(course.published_at).toLocaleDateString('zh-CN')} 发布
          </Badge>
        )}
        
        <Badge
          variant="courseTag"
          className="text-sm animate-in fade-in slide-in-from-bottom-3 duration-700 delay-[700ms]"
        >
          {course.status === 'published' ? '已发布' : 
           course.status === 'draft' ? '草稿' : '已归档'}
        </Badge>
      </div>
    </div>
  );
};
