
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

  // 改进的作业排序函数，处理所有可能的情况
  const sortHomeworkByPosition = (homeworks: any[]) => {
    return [...homeworks].sort((a, b) => {
      // 检查是否存在position字段
      const hasPositionA = 'position' in a && a.position !== null && a.position !== undefined;
      const hasPositionB = 'position' in b && b.position !== null && b.position !== undefined;
      
      if (hasPositionA && hasPositionB) {
        // 如果两个作业都有position字段，按position排序
        return a.position - b.position;
      } else if (hasPositionA) {
        // 只有a有position，a排前面
        return -1;
      } else if (hasPositionB) {
        // 只有b有position，b排前面
        return 1;
      }
      
      // 如果都没有position，按创建时间排序
      if (a.created_at && b.created_at) {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      
      // 最后兜底按ID排序
      return (a.id || '').localeCompare(b.id || '');
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
          
          // 尝试修复作业排序，但要处理函数不存在的情况
          try {
            // 使用自定义类型断言绕过TypeScript检查
            const rpcClient = supabase.rpc as any;
            await rpcClient('fix_homework_order');
          } catch (orderError) {
            console.warn('[HomeworkModuleSimple] Error fixing homework order or function may not exist:', orderError);
            // 尝试使用客户端逻辑修复作业顺序
            try {
              await fixHomeworkPositions(lectureId);
            } catch (clientFixError) {
              console.warn('[HomeworkModuleSimple] Client-side fix for homework positions failed:', clientFixError);
              // 继续执行，不要中断流程
            }
          }
        } catch (fixError) {
          console.warn('[HomeworkModuleSimple] Error fixing homework constraints:', fixError);
          // Continue with the rest of the process
        }
        
        // 检查表中是否存在position字段
        let orderByField = 'created_at';
        try {
          const { error: testError } = await supabase
            .from('homework')
            .select('position')
            .limit(1);
          
          if (!testError) {
            orderByField = 'position';
          }
        } catch (fieldError) {
          console.warn('[HomeworkModuleSimple] Error checking for position field:', fieldError);
          // 使用默认的created_at排序
        }
        
        // 获取作业列表，添加更多的日志和错误处理
        console.log(`[HomeworkModuleSimple] Fetching homework with orderBy: ${orderByField}`);
        const { data: homeworkData, error: homeworkError } = await supabase
          .from('homework')
          .select('*')
          .eq('lecture_id', lectureId)
          .order(orderByField, { ascending: true });
          
        if (homeworkError) {
          console.error('[HomeworkModuleSimple] Error fetching homework:', homeworkError);
          throw homeworkError;
        }
        
        console.log(`[HomeworkModuleSimple] Homework data (${homeworkData?.length || 0} items):`, homeworkData);
        
        // If no homework exists for this lecture, create a default one
        if (!homeworkData || homeworkData.length === 0) {
          try {
            // Create a default homework for this lecture with the properly converted courseId
            const defaultHomework: any = {
              title: '课时练习',
              type: 'fill_blank',
              lecture_id: lectureId,
              course_id: numericCourseId,
              options: {
                question: '请简要总结本节课的主要内容和您的收获：'
              }
            };
            
            // 检查表中是否存在position字段，如果存在则设置默认值
            try {
              const { error: testError } = await supabase
                .from('homework')
                .select('position')
                .limit(1);
              
              if (!testError) {
                defaultHomework.position = 1; // 设置默认位置
              }
            } catch (fieldError) {
              console.warn('[HomeworkModuleSimple] Error checking for position field:', fieldError);
              // 不设置position字段
            }
            
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
          // 按位置排序作业，使用改进的排序函数处理所有可能的情况
          const sortedHomework = sortHomeworkByPosition(homeworkData);
          console.log('[HomeworkModuleSimple] Sorted homework:', sortedHomework);
          setHomeworkList(sortedHomework);
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
            console.log('[HomeworkModuleSimple] Submission data:', submissionsData);
            
            const submitted: Record<string, boolean> = {};
            submissionsData.forEach((submission) => {
              submitted[submission.homework_id] = true;
            });
            console.log('[HomeworkModuleSimple] Processed submission status:', submitted);
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
  const handleHomeworkSubmitted = useCallback(() => {
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
  }, [homeworkList, submittedHomework, onHomeworkSubmit]);

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
            position={index + 1} // 添加位置编号，确保正确显示序号
          />
        ))}
      </div>
    </div>
  );
};
