
import React, { useEffect } from 'react';
import { HomeworkModuleSimple } from './HomeworkModuleSimple';
import { DatabaseFixInitializer } from './DatabaseFixInitializer';
import { dismissAllToasts } from '@/hooks/use-toast';

interface HomeworkModuleProps {
  courseId: string;
  lectureId: string;
  onHomeworkSubmit?: () => void;
}

export const HomeworkModule: React.FC<HomeworkModuleProps> = (props) => {
  // Clean up toasts when component mounts and unmounts
  useEffect(() => {
    console.log('[HomeworkModule] Mounted, clearing any existing toasts');
    dismissAllToasts();
    
    return () => {
      // Ensure any lingering toast notifications are dismissed when navigating away
      console.log('[HomeworkModule] Cleaning up on unmount, dismissing all toasts');
      dismissAllToasts();
    };
  }, []);
  
  // Convert courseId to number if it's a string
  const normalizedProps = {
    ...props,
    courseId: typeof props.courseId === 'string' ? parseInt(props.courseId, 10) : props.courseId
  };
  
  return (
    <div className="homework-module animate-fade-in">
      {/* Always include the database fixer to ensure homework tables are properly set up */}
      <DatabaseFixInitializer />
      
      {/* Use the simplified version with better error handling */}
      <HomeworkModuleSimple {...normalizedProps} />
    </div>
  );
};
