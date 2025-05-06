
import React, { useState, useEffect, useCallback } from 'react';
import { HomeworkCard } from './HomeworkCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { fixHomeworkPositions } from '@/lib/services/homeworkService';

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

  // Helper function to safely convert courseId to a number
  const getNumericCourseId = (courseIdString: string): number | null => {
    try {
      const numericId = parseInt(courseIdString, 10);
      if (isNaN(numericId) || numericId <= 0) {
        console.error('[HomeworkModuleSimple] Invalid courseId:', courseIdString, 'parsed as', numericId);
        return null;
      }
      return numericId;
    } catch (err) {
      console.error('[HomeworkModuleSimple] Error parsing courseId:', err);
      return null;
    }
  };

  // 按位置字段排序作业
  const sortHomeworkByPosition = (homeworks: any[]) => {
    return [...homeworks].sort((a, b) => {
      // 如果有位置字段，优先按位置排序
      if (a.position !== undefined && b.position !== undefined) {
        return a.position - b.position;
      }
      // 否则按ID排序
      return a.id.localeCompare(b.id);
    });
  };

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
        
        // 验证输入
        if (!lectureId) {
          throw new Error('无效的课时ID');
        }
        
        const numericCourseId = getNumericCourseId(courseId);
        if (numericCourseId === null) {
          throw new Error('无效的课程ID: ' + courseId);
        }
        
        console.log('[HomeworkModuleSimple] Fetching homework for lecture:', lectureId, 'courseId:', numericCourseId);
        
        // First try to fix homework constraints if needed
        try {
          await supabase.rpc('fix_homework_constraints');
          
          // 修复作业排序
          await fixHomeworkPositions(lectureId);
        } catch (fixError) {
          console.warn('[HomeworkModuleSimple] Error fixing homework constraints:', fixError);
          // Continue with the rest of the process
        }
        
        const { data: homeworkData, error: homeworkError } = await supabase
          .from('homework')
          .select('*')
          .eq('lecture_id', lectureId)
          .order('position', { ascending: true });
          
        if (homeworkError) {
          console.error('[HomeworkModuleSimple] Error fetching homework:', homeworkError);
          throw homeworkError;
        }
        
        console.log('[HomeworkModuleSimple] Homework data:', homeworkData);
        
        // If no homework exists for this lecture, create a default one
        if (!homeworkData || homeworkData.length === 0) {
          try {
            // Create a default homework for this lecture with the properly converted courseId
            const defaultHomework = {
              title: '课时练习',
              type: 'fill_blank',
              lecture_id: lectureId,
              course_id: numericCourseId,
              position: 1, // 设置默认位置
              options: {
                question: '请简要总结本节课的主要内容和您的收获：'
              }
            };
            
            console.log('[HomeworkModuleSimple] Creating default homework:', defaultHomework);
            
            const { data: newHomework, error: createError } = await supabase
              .from('homework')
              .insert([defaultHomework])
              .select();
              
            if (createError) {
              console.error('[HomeworkModuleSimple] Error creating default homework:', createError);
              throw createError;
            }
            
            console.log('[HomeworkModuleSimple] Default homework created:', newHomework);
            
            if (newHomework && newHomework.length > 0) {
              setHomeworkList(newHomework);
            }
          } catch (createErr: any) {
            console.error('[HomeworkModuleSimple] Failed to create default homework:', createErr);
            // Don't show error to user for this case, just log it
          }
        } else {
          // 按位置排序作业
          setHomeworkList(sortHomeworkByPosition(homeworkData));
        }
        
        // Check submission status for each homework
        if (homeworkData && homeworkData.length > 0) {
          const { data: submissionsData, error: submissionsError } = await supabase
            .from('homework_submissions')
            .select('homework_id')
            .eq('lecture_id', lectureId);
            
          if (submissionsError) {
            console.error('[HomeworkModuleSimple] Error fetching submissions:', submissionsError);
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
        console.error('[HomeworkModuleSimple] Error in homework module:', err);
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
  }, [courseId, lectureId, activeToastId]);

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
        <p className="text-red-600">加载作业时发生错误：{error}</p>
        <p className="text-gray-600 text-sm mt-2">您可以刷新页面再试一次。</p>
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
        {homeworkList.map((homework, index) => (
          <HomeworkCard
            key={homework.id}
            homework={homework}
            courseId={courseId}
            lectureId={lectureId}
            isSubmitted={!!submittedHomework[homework.id]}
            onSubmitted={handleHomeworkSubmitted}
            position={index + 1} // 添加位置编号
          />
        ))}
      </div>
    </div>
  );
};
