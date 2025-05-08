
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HomeworkBreadcrumbProps {
  courseId: number;
  sectionTitle?: string;
  lectureTitle?: string;
  studentId?: string;
  studentName?: string;
  onClearLecture?: () => void;
  onClearStudent?: () => void;
}

const HomeworkBreadcrumb: React.FC<HomeworkBreadcrumbProps> = ({
  courseId,
  sectionTitle,
  lectureTitle,
  studentId,
  studentName,
  onClearLecture,
  onClearStudent
}) => {
  return (
    <div className="flex items-center text-sm text-gray-500">
      <Link to="/admin" className="flex items-center hover:text-primary">
        <Home size={16} />
        <span className="ml-1">后台管理</span>
      </Link>
      
      <ChevronRight size={14} className="mx-1" />
      
      <Link to="/admin/courses-new" className="hover:text-primary">
        课程管理
      </Link>
      
      <ChevronRight size={14} className="mx-1" />
      
      <Link to={`/admin/courses-new/${courseId}`} className="hover:text-primary">
        课程 {courseId}
      </Link>
      
      <ChevronRight size={14} className="mx-1" />
      
      <Link to={`/admin/courses-new/${courseId}/homework`} className="hover:text-primary">
        作业管理
      </Link>
      
      {sectionTitle && lectureTitle && (
        <>
          <ChevronRight size={14} className="mx-1" />
          
          <span className="text-gray-700">
            {sectionTitle} - {lectureTitle}
          </span>
          
          {onClearLecture && (
            <Button
              variant="ghost" 
              size="sm" 
              onClick={onClearLecture} 
              className="ml-2 text-xs h-6 px-2"
            >
              清除选择
            </Button>
          )}
        </>
      )}
      
      {studentId && studentName && (
        <>
          <ChevronRight size={14} className="mx-1" />
          
          <span className="text-gray-700">
            学生: {studentName}
          </span>
          
          {onClearStudent && (
            <Button
              variant="ghost" 
              size="sm" 
              onClick={onClearStudent} 
              className="ml-2 text-xs h-6 px-2"
            >
              清除选择
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default HomeworkBreadcrumb;
