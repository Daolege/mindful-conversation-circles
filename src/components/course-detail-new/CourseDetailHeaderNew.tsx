
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CourseWithDetails } from '@/lib/types/course-new';

interface CourseDetailHeaderNewProps {
  course: CourseWithDetails;
}

export const CourseDetailHeaderNew: React.FC<CourseDetailHeaderNewProps> = ({ course }) => {
  return (
    <div className="mb-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 mb-4">
        {course.category && (
          <Badge variant="outline" className="bg-gray-100">
            {course.category}
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
          className="capitalize"
        >
          {course.status}
        </Badge>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
      {course.description && (
        <div className="text-gray-700 whitespace-pre-wrap">{course.description}</div>
      )}
      <div className="flex flex-wrap gap-4 mt-6 text-gray-600">
        {course.lecture_count !== undefined && (
          <div className="flex items-center gap-1">
            <span className="text-sm">课时: {course.lecture_count}</span>
          </div>
        )}
        {course.enrollment_count !== undefined && (
          <div className="flex items-center gap-1">
            <span className="text-sm">学员: {course.enrollment_count}</span>
          </div>
        )}
      </div>
    </div>
  );
};
