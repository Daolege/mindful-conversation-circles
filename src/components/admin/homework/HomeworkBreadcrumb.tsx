
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface HomeworkBreadcrumbProps {
  courseId: number;
  sectionTitle?: string;
  lectureTitle?: string;
  studentId?: string | null;
  onClearLecture: () => void;
  onClearStudent: () => void;
}

export const HomeworkBreadcrumb: React.FC<HomeworkBreadcrumbProps> = ({
  courseId,
  sectionTitle = '',
  lectureTitle = '',
  studentId,
  onClearLecture,
  onClearStudent
}) => {
  // Fetch course info if needed
  const { data: courseInfo } = useQuery({
    queryKey: ['course-info', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('title')
        .eq('id', courseId)
        .single();
        
      if (error) {
        console.error('Error fetching course info:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000
  });

  // Fetch student name if a student is selected
  const { data: studentInfo } = useQuery({
    queryKey: ['student-info', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', studentId)
        .single();
        
      if (error) {
        console.error('Error fetching student info:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000
  });

  const courseTitle = courseInfo?.title || `课程 #${courseId}`;
  
  return (
    <nav className="flex">
      <ol className="flex items-center flex-wrap text-sm">
        <li className="flex items-center">
          <Link to="/admin?tab=courses-new" className="text-blue-600 hover:text-blue-800 flex items-center">
            <Home className="h-4 w-4 mr-1" />
            <span>课程管理</span>
          </Link>
        </li>
        
        <li className="mx-2 text-gray-400">
          <ChevronRight className="h-4 w-4" />
        </li>
        
        <li>
          <span className="font-medium" title={courseTitle}>
            {courseTitle.length > 20 ? courseTitle.substring(0, 20) + '...' : courseTitle}
          </span>
        </li>
        
        {sectionTitle && lectureTitle && (
          <>
            <li className="mx-2 text-gray-400">
              <ChevronRight className="h-4 w-4" />
            </li>
            
            <li>
              <button 
                onClick={onClearLecture}
                className="text-blue-600 hover:text-blue-800"
                title={sectionTitle}
              >
                {sectionTitle.length > 20 ? sectionTitle.substring(0, 20) + '...' : sectionTitle}
              </button>
            </li>
            
            <li className="mx-2 text-gray-400">
              <ChevronRight className="h-4 w-4" />
            </li>
            
            <li>
              <span className="font-medium" title={lectureTitle}>
                {lectureTitle.length > 20 ? lectureTitle.substring(0, 20) + '...' : lectureTitle}
              </span>
            </li>
          </>
        )}
        
        {studentId && studentInfo && (
          <>
            <li className="mx-2 text-gray-400">
              <ChevronRight className="h-4 w-4" />
            </li>
            
            <li>
              <button 
                onClick={onClearStudent}
                className="text-blue-600 hover:text-blue-800"
              >
                {studentInfo.full_name || '未知学生'}
              </button>
            </li>
          </>
        )}
      </ol>
    </nav>
  );
};

export default HomeworkBreadcrumb;
