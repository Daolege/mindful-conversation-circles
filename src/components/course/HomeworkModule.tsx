
import React from 'react';
import { HomeworkModuleSimple } from './HomeworkModuleSimple';
import { DatabaseFixInitializer } from './DatabaseFixInitializer';

interface HomeworkModuleProps {
  courseId: string;
  lectureId: string;
  onHomeworkSubmit?: () => void;
}

export const HomeworkModule: React.FC<HomeworkModuleProps> = (props) => {
  return (
    <>
      {/* Always include the database fixer to ensure homework tables are properly set up */}
      <DatabaseFixInitializer />
      
      {/* Use the simplified version with better error handling */}
      <HomeworkModuleSimple {...props} />
    </>
  );
};
