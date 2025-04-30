
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CourseWithDetails } from '@/lib/types/course-new';
import { Book, Users, Clock, Globe, Calendar } from 'lucide-react';

interface CourseDetailHeaderNewProps {
  course: CourseWithDetails;
}

export const CourseDetailHeaderNew: React.FC<CourseDetailHeaderNewProps> = ({ course }) => {
  return (
    <div className="mb-8 animate-in fade-in duration-500">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
      
      <div className="flex flex-wrap gap-3 mb-6">
        {course.category && (
          <Badge 
            variant="course" 
            className="text-sm"
          >
            <Book size={16} className="mr-1" />
            {course.category}
          </Badge>
        )}
        
        <Badge 
          variant="course" 
          className="text-sm"
        >
          <Users size={16} className="mr-1" />
          {course.enrollment_count || 0} 名学员
        </Badge>
        
        <Badge 
          variant="course" 
          className="text-sm"
        >
          <Book size={16} className="mr-1" />
          {course.sections?.length || 0} 章节
        </Badge>
        
        <Badge 
          variant="course" 
          className="text-sm"
        >
          <Clock size={16} className="mr-1" />
          {course.lecture_count || 0} 课时
        </Badge>
        
        {course.language && (
          <Badge 
            variant="course" 
            className="text-sm"
          >
            <Globe size={16} className="mr-1" />
            {course.language}
          </Badge>
        )}
        
        {course.published_at && (
          <Badge 
            variant="course" 
            className="text-sm"
          >
            <Calendar size={16} className="mr-1" />
            {new Date(course.published_at).toLocaleDateString('zh-CN')} 发布
          </Badge>
        )}
        
        <Badge
          variant={
            course.status === 'published'
              ? 'success'
              : course.status === 'draft'
              ? 'outline'
              : 'secondary'
          }
          className="capitalize px-3 py-1 text-sm"
        >
          {course.status === 'published' ? '已发布' : 
           course.status === 'draft' ? '草稿' : '已归档'}
        </Badge>
      </div>
    </div>
  );
};
