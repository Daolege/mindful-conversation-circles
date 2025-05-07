
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/authHooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HomeworkCard } from './HomeworkCard';
import { Loader2, BookOpen, AlertTriangle } from 'lucide-react';
import { getHomeworkByLectureId, getHomeworkSubmissionsByUserAndLecture } from '@/lib/services/homeworkService';
import { Homework, HomeworkSubmission } from '@/lib/types/homework';
import { toast } from 'sonner';
import { trackCourseProgress } from '@/lib/services/courseNewLearnService';
import { dismissAllToasts } from '@/hooks/use-toast';

interface HomeworkModuleSimpleProps {
  courseId: string | number;
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
  const [toastShown, setToastShown] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Clean up toast notifications when component unmounts
  useEffect(() => {
    return () => {
      dismissAllToasts();
    };
  }, []);
  
  // 改进的排序函数，增加多层次的排序依据
  const sortHomeworks = useCallback((homeworkItems: Homework[]): Homework[] => {
    if (!homeworkItems || homeworkItems.length === 0) return [];
    
    console.log('[HomeworkModuleSimple] 对作业进行多维度排序, 原始项目:', homeworkItems.length);
    
    // 检查是否所有作业都有有效的position
    const hasValidPositions = homeworkItems.every(hw => 
      typeof hw.position === 'number' && hw.position > 0
    );
    
    return [...homeworkItems].sort((a, b) => {
      // 1. 首先按position排序（如果有效）
      if (hasValidPositions) {
        const posA = typeof a.position === 'number' ? a.position : Number.MAX_SAFE_INTEGER;
        const posB = typeof b.position === 'number' ? b.position : Number.MAX_SAFE_INTEGER;
        if (posA !== posB) return posA - posB;
      }
      
      // 2. 如果position相同或无效，按创建时间排序
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (dateA !== dateB) return dateA - dateB;
      
      // 3. 如果创建时间也相同，按ID排序确保稳定性
      return (a.id || '').localeCompare(b.id || '');
    });
  }, []);
  
  const loadHomeworkData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      
      // Check if we have a user, lecture and course ID
      if (!user?.id || !lectureId || !courseId) {
        const missingParams = [];
        if (!user?.id) missingParams.push('用户ID');
        if (!lectureId) missingParams.push('课时ID');
        if (!courseId) missingParams.push('课程ID');
        
        console.error(`[HomeworkModuleSimple] Missing params: ${missingParams.join(', ')}`);
        setHomeworks([]);
        setSubmissions([]);
        setErrorMessage(`缺少必要参数: ${missingParams.join(', ')}`);
        setLoading(false);
        return;
      }
      
      // Ensure courseId is a number for consistency
      const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
      
      // Detailed logging of parameters
      console.log('[HomeworkModuleSimple] 加载作业数据', { 
        userId: user.id, 
        lectureId, 
        courseId: numericCourseId,
        courseIdType: typeof numericCourseId
      });
      
      // Load homework assignments for this lecture
      const homeworkItems = await getHomeworkByLectureId(lectureId, numericCourseId);
      console.log('Loaded homework items:', homeworkItems.length);
      
      // 记录作业项的位置信息，帮助调试
      if (homeworkItems.length > 0) {
        console.log('[HomeworkModuleSimple] 获取到作业项目的位置数据:', 
          homeworkItems.map(hw => ({ id: hw.id, position: hw.position, created_at: hw.created_at }))
        );
      }
      
      // 重新检查position是否有重复或无效值
      const positionCounts: Record<number, number> = {};
      let hasPositionIssues = false;
      
      homeworkItems.forEach(hw => {
        if (hw.position !== undefined && hw.position > 0) {
          positionCounts[hw.position] = (positionCounts[hw.position] || 0) + 1;
          if (positionCounts[hw.position] > 1) {
            hasPositionIssues = true;
          }
        } else {
          hasPositionIssues = true;
        }
      });
      
      if (hasPositionIssues) {
        console.warn('[HomeworkModuleSimple] 发现作业position异常，将使用增强排序算法', positionCounts);
      }
      
      // 对作业进行多重排序，确保即使position有问题也能正确显示
      const sortedHomeworks = sortHomeworks(homeworkItems);
      
      // Load any existing submissions by this user
      const userSubmissions = await getHomeworkSubmissionsByUserAndLecture(
        user.id, 
        lectureId,
        numericCourseId
      );
      console.log('Loaded user submissions:', userSubmissions.length);
      
      // Set state with the fetched data
      setHomeworks(sortedHomeworks); // 使用排序后的作业列表
      setSubmissions(userSubmissions);
      
      // Check if all required homework is already submitted
      const requiredHomeworks = sortedHomeworks.filter(h => h.is_required);
      if (requiredHomeworks.length === 0) {
        // No required homework, all homework is optional
        setAllSubmitted(userSubmissions.length >= sortedHomeworks.length);
      } else {
        // Check if all required homework is submitted
        const allRequiredSubmitted = requiredHomeworks.every(hw => 
          userSubmissions.some(sub => sub.homework_id === hw.id)
        );
        setAllSubmitted(allRequiredSubmitted);
      }
      
      // 重置错误计数器
      setErrorCount(0);
    } catch (error) {
      console.error('Error loading homework data:', error);
      
      // 增加错误计数
      setErrorCount(prev => prev + 1);
      
      // 显示更详细的错误消息
      setErrorMessage(`加载作业数据失败: ${(error as Error).message || '未知错误'}`);
      
      // 只有在第一次错误时显示toast
      if (!toastShown) {
        toast.error('加载作业数据失败，请刷新页面重试');
        setToastShown(true);
      }
      
      // 如果多次尝试失败，记录更详细的错误信息以帮助调试
      if (errorCount >= 2) {
        console.error('Multiple attempts to load homework failed:', error);
        console.error('Context:', { courseId, lectureId, userId: user?.id });
      }
    } finally {
      setLoading(false);
    }
  }, [courseId, lectureId, user?.id, sortHomeworks, errorCount, toastShown]);
  
  useEffect(() => {
    // Reset toast state when dependencies change
    setToastShown(false);
    
    // Load homework data
    loadHomeworkData();
    
    // Clean up function
    return () => {
      // Ensure any lingering toast notifications are dismissed
      dismissAllToasts();
    };
  }, [courseId, lectureId, user?.id, loadHomeworkData]);
  
  const handleSubmissionComplete = useCallback(async () => {
    // Dismiss any existing toasts before showing new ones
    dismissAllToasts();
    
    // Refresh submissions
    await loadHomeworkData();
    
    // Call parent callback if provided
    if (onHomeworkSubmit) {
      // Use setTimeout to ensure we don't update state during rendering
      setTimeout(() => {
        onHomeworkSubmit();
      }, 0);
    }
    
    // Mark course progress as completed if all required homework is submitted
    if (user?.id && allSubmitted) {
      try {
        await trackCourseProgress(courseId, lectureId, user.id, true);
      } catch (error) {
        console.error('Error updating course progress:', error);
      }
    }
  }, [loadHomeworkData, onHomeworkSubmit, courseId, lectureId, user?.id, allSubmitted]);
  
  const isHomeworkSubmitted = useCallback((homeworkId: string) => {
    return submissions.some(sub => sub.homework_id === homeworkId);
  }, [submissions]);
  
  const handleRetryLoad = useCallback(() => {
    setToastShown(false);
    loadHomeworkData();
  }, [loadHomeworkData]);
  
  return (
    <Card className="mt-6 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <h2 className="text-xl font-semibold">课程作业</h2>
        </div>
        
        {/* 删除"已完成所有必修作业"提示 */}
      </div>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : errorMessage ? (
        <div className="bg-red-50 p-6 rounded-md border border-red-200 text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-red-800 mb-4">{errorMessage}</p>
          <Button onClick={handleRetryLoad} variant="outline">重新加载</Button>
        </div>
      ) : homeworks.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-md border border-gray-200 text-center">
          <p className="text-gray-600">该课时暂无作业</p>
        </div>
      ) : (
        <div className="space-y-4">
          {homeworks.map((homework, index) => {
            // Ensure homework has the required id property
            if (!homework.id) {
              console.error('Homework missing ID:', homework);
              return null;
            }
            
            // Ensure course_id is set on the homework object and is a number
            const hwWithCourseId = {
              ...homework,
              id: homework.id, // Explicitly include ID to satisfy the type constraint
              course_id: typeof homework.course_id === 'number' ? homework.course_id : 
                typeof courseId === 'string' ? parseInt(courseId, 10) : courseId
            };
            
            return (
              <HomeworkCard
                key={`homework-${homework.id}-${index}`}
                homework={hwWithCourseId}
                courseId={typeof courseId === 'string' ? parseInt(courseId, 10) : courseId}
                lectureId={lectureId}
                isSubmitted={isHomeworkSubmitted(homework.id)}
                onSubmitted={handleSubmissionComplete}
                position={index + 1} // 使用数组索引加1作为前端显示的位置
              />
            );
          })}
        </div>
      )}
    </Card>
  );
};
