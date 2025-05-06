
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/authHooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HomeworkCard } from './HomeworkCard';
import { FileCheck, Loader2, BookOpen } from 'lucide-react';
import { getHomeworkByLectureId, getHomeworkSubmissionsByUserAndLecture } from '@/lib/services/homeworkService';
import { Homework, HomeworkSubmission } from '@/lib/types/homework';
import { toast } from 'sonner';
import { trackCourseProgress } from '@/lib/services/courseNewLearnService';

interface HomeworkModuleSimpleProps {
  courseId: string;
  lectureId: string;
  onHomeworkSubmit?: () => void;
}

export const HomeworkModuleSimple: React.FC<HomeworkModuleSimpleProps> = ({
  courseId,
  lectureId,
  onHomeworkSubmit
}) => {
  const { user } = useAuth();
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [allSubmitted, setAllSubmitted] = useState(false);
  
  const loadHomeworkData = async () => {
    try {
      setLoading(true);
      
      // Check if we have a user, lecture and course ID
      if (!user?.id || !lectureId || !courseId) {
        setHomeworks([]);
        setSubmissions([]);
        setLoading(false);
        return;
      }
      
      // Load homework assignments for this lecture
      const homeworkItems = await getHomeworkByLectureId(lectureId, courseId);
      console.log('Loaded homework items:', homeworkItems.length);
      
      // If there are no homework items, exit early
      if (homeworkItems.length === 0) {
        setHomeworks([]);
        setSubmissions([]);
        setLoading(false);
        return;
      }
      
      // Load any existing submissions by this user
      const userSubmissions = await getHomeworkSubmissionsByUserAndLecture(
        user.id, 
        lectureId,
        courseId
      );
      console.log('Loaded user submissions:', userSubmissions.length);
      
      // Set state with the fetched data
      setHomeworks(homeworkItems);
      setSubmissions(userSubmissions);
      
      // Check if all required homework is already submitted
      const requiredHomeworks = homeworkItems.filter(h => h.is_required);
      if (requiredHomeworks.length === 0) {
        // No required homework, all homework is optional
        setAllSubmitted(userSubmissions.length >= homeworkItems.length);
      } else {
        // Check if all required homework is submitted
        const allRequiredSubmitted = requiredHomeworks.every(hw => 
          userSubmissions.some(sub => sub.homework_id === hw.id)
        );
        setAllSubmitted(allRequiredSubmitted);
      }
    } catch (error) {
      console.error('Error loading homework data:', error);
      toast.error('加载作业数据失败');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadHomeworkData();
  }, [courseId, lectureId, user?.id]);
  
  const handleSubmissionComplete = async () => {
    // Refresh submissions
    await loadHomeworkData();
    
    // Call parent callback if provided
    onHomeworkSubmit?.();
    
    // Mark course progress as completed if all required homework is submitted
    if (user?.id && allSubmitted) {
      try {
        await trackCourseProgress(courseId, lectureId, user.id, true);
      } catch (error) {
        console.error('Error updating course progress:', error);
      }
    }
  };
  
  const isHomeworkSubmitted = (homeworkId: string) => {
    return submissions.some(sub => sub.homework_id === homeworkId);
  };
  
  // If there are no homework items, don't show anything
  if (homeworks.length === 0 && !loading) {
    return null;
  }
  
  return (
    <Card className="mt-6 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <h2 className="text-xl font-semibold">课程作业</h2>
        </div>
        
        {allSubmitted && (
          <div className="flex items-center text-green-600">
            <FileCheck className="h-5 w-5 mr-2" />
            <span>已完成所有必修作业</span>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {homeworks.map((homework, index) => {
            // Ensure homework has the required id property
            if (!homework.id) {
              console.error('Homework missing ID:', homework);
              return null;
            }
            
            // Ensure course_id is set on the homework object
            const hwWithCourseId = {
              ...homework,
              course_id: typeof homework.course_id === 'number' ? homework.course_id : 
                typeof courseId === 'string' ? parseInt(courseId, 10) : courseId
            };
            
            return (
              <HomeworkCard
                key={homework.id}
                homework={hwWithCourseId}
                courseId={courseId}
                lectureId={lectureId}
                isSubmitted={isHomeworkSubmitted(homework.id)}
                onSubmitted={handleSubmissionComplete}
                position={index + 1}
              />
            );
          })}
        </div>
      )}
      
      {allSubmitted && onHomeworkSubmit && (
        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            className="bg-green-50 text-green-700 hover:bg-green-100"
            onClick={onHomeworkSubmit}
          >
            继续学习下一章节
          </Button>
        </div>
      )}
    </Card>
  );
};
