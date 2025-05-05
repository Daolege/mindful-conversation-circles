
import React from 'react';
import { HomeworkModuleSimple } from './HomeworkModuleSimple';

interface HomeworkModuleProps {
  courseId: string;
  lectureId: string;
  onHomeworkSubmit?: () => void;
}

export const HomeworkModule: React.FC<HomeworkModuleProps> = (props) => {
  // We're now using the simplified version which has better error handling
  return <HomeworkModuleSimple {...props} />;
};
