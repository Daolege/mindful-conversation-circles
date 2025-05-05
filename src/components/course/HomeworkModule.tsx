
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
  // Clean up toasts when component unmounts
  useEffect(() => {
    return () => {
      // Ensure any lingering toast notifications are dismissed when navigating away
      dismissAllToasts();
    };
  }, []);
  
  return (
    <>
      {/* Always include the database fixer to ensure homework tables are properly set up */}
      <DatabaseFixInitializer />
      
      {/* Use the simplified version with better error handling */}
      <HomeworkModuleSimple {...props} />
    </>
  );
};
