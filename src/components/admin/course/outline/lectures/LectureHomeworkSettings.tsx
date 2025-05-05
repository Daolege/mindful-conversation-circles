
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { HomeworkPanel } from './HomeworkPanel';

interface LectureHomeworkSettingsProps {
  lectureId: string;
  sectionId: string;
  courseId?: number;
  requiresHomework?: boolean;
  onHomeworkRequirementChange?: (sectionId: string, lectureId: string, requiresHomework: boolean) => void;
}

export const LectureHomeworkSettings: React.FC<LectureHomeworkSettingsProps> = ({
  lectureId,
  sectionId,
  courseId,
  requiresHomework = false,
  onHomeworkRequirementChange
}) => {
  const [showHomeworkPanel, setShowHomeworkPanel] = useState(false);

  const toggleHomeworkPanel = () => {
    setShowHomeworkPanel(prev => !prev);
  };

  return (
    <div className="space-y-2 mt-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={toggleHomeworkPanel}
        className="w-full flex justify-between items-center text-gray-700"
      >
        <span>作业</span>
        {showHomeworkPanel ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>
      
      {showHomeworkPanel && (
        <HomeworkPanel 
          lectureId={lectureId}
          courseId={courseId}
        />
      )}
    </div>
  );
};
