
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
import { dismissAllToasts } from '@/hooks/use-toast';

interface HomeworkModuleSimpleProps {
  courseId: string | number; // Changed to accept both string and number
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
  const [errorCount, setErrorCount] = useState(0); // 添加错误计数器
  
  // Clean up toast notifications when component unmounts
  useEffect(() => {
    return () => {
      dismissAllToasts();
    };
  }, []);
  
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
      
      // Ensure courseId is a number for consistency
      const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
      
      // Load homework assignments for this lecture
      const homeworkItems = await getHomeworkByLectureId(lectureId, numericCourseId);
      console.log('Loaded homework items:', homeworkItems.length);
      
      // If there are no homework items, exit early
      if (homeworkItems.length === 0) {
        setHomeworks([]);
        setSubmissions([]);
        setLoading(false);
        return;
      }
      
      // 改进：对作业进行多重排序，确保即使position有重复也能按创建时间排序
      const sortedHomeworks = [...homeworkItems].sort((a, b) => {
        // 首先按position排序
        if (a.position !== b.position) {
          return (a.position || 0) - (b.position || 0);
        }
        
        // 如果position相同，按created_at排序
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB;
      });
      
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
      
      // 只有在第一次错误时显示toast
      if (!toastShown) {
        toast.error('加载作业数据失败');
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
  };
  
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
  }, [courseId, lectureId, user?.id]);
  
  const handleSubmissionComplete = async () => {
    // Dismiss any existing toasts before showing new ones
    dismissAllToasts();
    
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
  
  // 改进：增加调试检查，确认是否所有作业都被正确显示
  useEffect(() => {
    if (homeworks.length > 0) {
      console.log('[HomeworkModuleSimple] 作业加载状态:', {
        total: homeworks.length,
        positions: homeworks.map(hw => ({ id: hw.id, position: hw.position }))
      });
    }
  }, [homeworks]);
  
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
            
            // Ensure course_id is set on the homework object and is a number
            const hwWithCourseId = {
              ...homework,
              id: homework.id, // Explicitly include ID to satisfy the type constraint
              course_id: typeof homework.course_id === 'number' ? homework.course_id : 
                typeof courseId === 'string' ? parseInt(courseId, 10) : courseId
            };
            
            return (
              <HomeworkCard
                key={homework.id}
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
