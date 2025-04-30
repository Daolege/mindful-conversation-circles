
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
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
            <Book size={14} />
            {course.category}
          </Badge>
        )}
        
        <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
          <Users size={14} />
          {course.enrollment_count || 0} 名学员
        </Badge>
        
        <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
          <Book size={14} />
          {course.sections?.length || 0} 章节
        </Badge>
        
        <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
          <Clock size={14} />
          {course.lecture_count || 0} 课时
        </Badge>
        
        {course.language && (
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
            <Globe size={14} />
            {course.language}
          </Badge>
        )}
        
        {course.published_at && (
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
            <Calendar size={14} />
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
          className="capitalize px-3 py-1"
        >
          {course.status === 'published' ? '已发布' : 
           course.status === 'draft' ? '草稿' : '已归档'}
        </Badge>
      </div>
    </div>
  );
};
