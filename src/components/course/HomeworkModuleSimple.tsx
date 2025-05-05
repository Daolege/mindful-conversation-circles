
import React, { useState, useEffect } from 'react';
import { HomeworkCard } from './HomeworkCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
  const [homeworkList, setHomeworkList] = useState<any[]>([]);
  const [submittedHomework, setSubmittedHomework] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeToastId, setActiveToastId] = useState<string | number | null>(null);

  // Fetch homework for the lecture
  useEffect(() => {
    const fetchHomework = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Clear any previous toast
        if (activeToastId) {
          toast.dismiss(activeToastId);
          setActiveToastId(null);
        }
        
        console.log('Fetching homework for lecture:', lectureId, 'courseId:', courseId);
        
        const { data: homeworkData, error: homeworkError } = await supabase
          .from('homework')
          .select('*')
          .eq('lecture_id', lectureId);
          
        if (homeworkError) {
          console.error('Error fetching homework:', homeworkError);
          throw homeworkError;
        }
        
        console.log('Homework data:', homeworkData);
        
        // If no homework exists for this lecture, create a default one
        if (!homeworkData || homeworkData.length === 0) {
          try {
            // Create a default homework for this lecture
            const numericCourseId = parseInt(courseId);
            
            if (isNaN(numericCourseId)) {
              console.error('无效的课程ID (NaN):', courseId);
              throw new Error('无效的课程ID (NaN)');
            }
            
            const defaultHomework = {
              title: '课时练习',
              description: '完成本练习以检验学习成果',
              type: 'fill_blank',
              lecture_id: lectureId,
              course_id: numericCourseId,
              options: {
                question: '请简要总结本节课的主要内容和您的收获：'
              }
            };
            
            console.log('Creating default homework:', defaultHomework);
            
            const { data: newHomework, error: createError } = await supabase
              .from('homework')
              .insert([defaultHomework])
              .select();
              
            if (createError) {
              console.error('Error creating default homework:', createError);
              throw createError;
            }
            
            console.log('Default homework created:', newHomework);
            
            if (newHomework && newHomework.length > 0) {
              setHomeworkList(newHomework);
            }
          } catch (createErr: any) {
            console.error('Failed to create default homework:', createErr);
            // Don't show error to user for this case, just log it
          }
        } else {
          setHomeworkList(homeworkData);
        }
        
        // Check submission status for each homework
        if (homeworkData && homeworkData.length > 0) {
          const { data: submissionsData, error: submissionsError } = await supabase
            .from('homework_submissions')
            .select('homework_id')
            .eq('lecture_id', lectureId);
            
          if (submissionsError) {
            console.error('Error fetching submissions:', submissionsError);
            // Don't throw here, still show homework list
          }
          
          if (submissionsData && submissionsData.length > 0) {
            const submitted: Record<string, boolean> = {};
            submissionsData.forEach((submission) => {
              submitted[submission.homework_id] = true;
            });
            setSubmittedHomework(submitted);
          }
        }
      } catch (err: any) {
        console.error('Error in homework module:', err);
        setError(err.message || '加载作业失败');
        const toastId = toast.error('加载作业失败: ' + (err.message || '未知错误'));
        setActiveToastId(toastId);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (courseId && lectureId) {
      fetchHomework();
    }
    
    // Cleanup function
    return () => {
      if (activeToastId) {
        toast.dismiss(activeToastId);
      }
    };
  }, [courseId, lectureId]);

  // Handle homework submission
  const handleHomeworkSubmitted = () => {
    // Update submission status
    if (homeworkList.length > 0) {
      const updatedSubmissions = { ...submittedHomework };
      homeworkList.forEach((homework) => {
        updatedSubmissions[homework.id] = true;
      });
      setSubmittedHomework(updatedSubmissions);
    }
    
    // Call parent handler if provided
    if (onHomeworkSubmit) {
      onHomeworkSubmit();
    }
  };

  // If loading or error, show appropriate UI
  if (isLoading) {
    return (
      <div className="my-6 p-6 bg-white rounded-lg shadow-sm">
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">加载作业中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-6 p-6 bg-white rounded-lg shadow-sm border-l-4 border-red-500">
        <p className="text-red-600">加载作业时发生错误。您可以刷新页面再试一次。</p>
      </div>
    );
  }

  if (homeworkList.length === 0) {
    return null; // Don't show anything if no homework
  }

  return (
    <div className="my-6 space-y-4">
      <h2 className="text-xl font-bold">课时作业</h2>
      <div className="space-y-4">
        {homeworkList.map((homework) => (
          <HomeworkCard
            key={homework.id}
            homework={homework}
            courseId={courseId}
            lectureId={lectureId}
            isSubmitted={!!submittedHomework[homework.id]}
            onSubmitted={handleHomeworkSubmitted}
          />
        ))}
      </div>
    </div>
  );
};
