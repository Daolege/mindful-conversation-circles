
import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomeworkCard } from "./HomeworkCard";
import { useAuth } from "@/contexts/authHooks";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { handleHomeworkQueryError, handleHomeworkSubmissionsQueryError } from "@/lib/supabaseUtils";
import { debugHomeworkTable } from '@/lib/services/homeworkService';
import { executeHomeworkMigration } from '@/api/executeHomeworkMigration';

interface HomeworkModuleProps {
  courseId: string;
  lectureId: string;
  onHomeworkSubmit?: () => void;
}

export const HomeworkModule = ({ courseId, lectureId, onHomeworkSubmit }: HomeworkModuleProps) => {
  const { user } = useAuth();
  const [allHomeworkCompleted, setAllHomeworkCompleted] = useState(false);
  const [isCreatingDefaultHomework, setIsCreatingDefaultHomework] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<{
    executed: boolean;
    success: boolean;
    message: string;
  }>({
    executed: false,
    success: false,
    message: ''
  });
  const [databaseError, setDatabaseError] = useState<string | null>(null);
  
  // Track toast IDs to manage them properly
  const [activeToastIds, setActiveToastIds] = useState<Record<string, string>>({});

  // Get course ID as number - crucial for database operations
  const numericCourseId = parseInt(courseId);
  console.log('[HomeworkModule] Course ID conversion:', {
    original: courseId,
    type: typeof courseId,
    parsed: numericCourseId,
    parsedType: typeof numericCourseId,
    isValid: !isNaN(numericCourseId)
  });
  
  // Show toast helper function
  const showToast = (key: string, toastFn: () => string | number) => {
    // Clear existing toast if present
    if (activeToastIds[key]) {
      toast.dismiss(activeToastIds[key]);
    }
    
    // Ensure ID is string
    const id = String(toastFn());
    
    // Store new toast ID
    setActiveToastIds(prev => ({...prev, [key]: id}));
    return id;
  };

  // Clear specific toast
  const clearToast = (key: string) => {
    if (activeToastIds[key]) {
      toast.dismiss(activeToastIds[key]);
      setActiveToastIds(prev => {
        const updated = {...prev};
        delete updated[key];
        return updated;
      });
    }
  };

  // Clear all toasts
  const clearAllToasts = () => {
    Object.entries(activeToastIds).forEach(([key, id]) => {
      if (id) toast.dismiss(id);
    });
    setActiveToastIds({});
  };
  
  // Execute database migration with enhanced error handling
  const handleExecuteMigration = async () => {
    showToast('migration', () => toast.loading('正在修复数据库关系...'));
    try {
      console.log('[HomeworkModule] Starting database migration for course ID:', numericCourseId);
      
      // Validate course exists in courses_new before proceeding
      try {
        const { count, error } = await supabase
          .from('courses_new')
          .select('*', { count: 'exact', head: true })
          .eq('id', numericCourseId);
          
        console.log('[HomeworkModule] Course existence check in courses_new:', { count, error });
        
        if (error || count === 0) {
          throw new Error(`课程ID ${numericCourseId} 不存在于新课程系统`);
        }
      } catch (err: any) {
        console.error('[HomeworkModule] Course validation error:', err);
        throw new Error(`验证课程失败: ${err.message}`);
      }
      
      // Execute the migration
      const result = await executeHomeworkMigration();
      clearToast('migration');
      
      console.log('[HomeworkModule] Migration result:', result);
      
      setMigrationStatus({
        executed: true,
        success: result.success,
        message: result.message
      });
      
      if (result.success) {
        showToast('migration', () => toast.success('数据库关系修复成功'));
        // Refresh homework list after successful migration
        await refetchHomework();
        localStorage.setItem('homework_migration_executed', 'true');
      } else {
        showToast('migration', () => toast.error(`数据库关系修复失败: ${result.message}`));
      }
    } catch (error: any) {
      clearToast('migration');
      setMigrationStatus({
        executed: true,
        success: false,
        message: error.message || '未知错误'
      });
      showToast('migration', () => toast.error(`执行迁移时出错: ${error.message || '未知错误'}`));
    }
  };

  // Diagnose table function - unmodified
  const handleDiagnoseTable = async () => {
    showToast('diagnose', () => toast.loading('正在诊断数据库表...'));
    try {
      const result = await debugHomeworkTable();
      clearToast('diagnose');
      
      if (result.success) {
        showToast('diagnose', () => toast.success(`诊断成功，共有 ${result.count || 0} 条作业记录`));
      } else {
        showToast('diagnose', () => toast.error(`诊断失败: ${result.error?.message || '未知错误'}`));
      }
      
      return result;
    } catch (error: any) {
      clearToast('diagnose');
      showToast('diagnose', () => toast.error(`诊断时出错: ${error.message || '未知错误'}`));
      return { success: false, error };
    }
  };

  // Homework query - enhanced to check with courses_new
  const { data: homework, isLoading: isLoadingHomework, error: homeworkError, refetch: refetchHomework } = useQuery({
    queryKey: ['homework', numericCourseId, lectureId],
    queryFn: async () => {
      console.log('[HomeworkModule] Fetching homework for lecture ID:', lectureId);
      console.log('[HomeworkModule] Current courseId:', courseId, 'type:', typeof courseId);
      console.log('[HomeworkModule] Converted numericCourseId:', numericCourseId, 'type:', typeof numericCourseId);
      
      // Validate course ID
      if (isNaN(numericCourseId) || numericCourseId <= 0) {
        const error = new Error(`无效的课程ID: ${courseId}`);
        console.error('[HomeworkModule]', error.message);
        setDatabaseError(error.message);
        throw error;
      }
      
      // Check migration status
      const migrationExecuted = localStorage.getItem('homework_migration_executed') === 'true';
      console.log('[HomeworkModule] Migration status check:', { migrationExecuted });
      
      if (!migrationExecuted) {
        console.log('[HomeworkModule] Migration not yet executed, attempting now...');
        try {
          const result = await executeHomeworkMigration();
          if (result.success) {
            localStorage.setItem('homework_migration_executed', 'true');
            console.log('[HomeworkModule] Auto-migration succeeded');
          } else {
            console.error('[HomeworkModule] Auto-migration failed:', result.message);
            setDatabaseError(`数据库迁移失败: ${result.message}`);
          }
        } catch (err: any) {
          console.error('[HomeworkModule] Auto-migration error:', err);
          setDatabaseError(`数据库迁移出错: ${err.message || '未知错误'}`);
        }
      }
      
      // Confirm course exists in courses_new
      try {
        const { data: courseExists, error: courseError } = await supabase
          .from('courses_new')
          .select('id')
          .eq('id', numericCourseId)
          .single();
        
        console.log('[HomeworkModule] Course validation in courses_new:', { courseExists, courseError });
        
        if (courseError || !courseExists) {
          console.error('[HomeworkModule] Course does not exist in courses_new:', courseError);
          setDatabaseError(`课程ID ${numericCourseId} 在新课程系统中不存在`);
          throw new Error(`课程不存在: ${courseError?.message || '未知错误'}`);
        }
      } catch (error: any) {
        if (error.code === 'PGRST116') {
          console.error('[HomeworkModule] No results found for course in courses_new');
          setDatabaseError(`课程ID ${numericCourseId} 在新课程系统中不存在`);
          throw new Error('课程在新系统中不存在');
        }
        console.error('[HomeworkModule] Course validation error:', error);
        setDatabaseError(`验证课程失败: ${error.message || '未知错误'}`);
        throw error;
      }
      
      // Query homework data
      try {
        console.log('[HomeworkModule] Executing homework query for course_id:', numericCourseId);
        const { data, error } = await supabase
          .from('homework')
          .select('*')
          .eq('course_id', numericCourseId)
          .eq('lecture_id', lectureId);
        
        console.log('[HomeworkModule] Query result:', { 
          count: data?.length || 0,
          error: error?.message || null,
          firstItem: data && data.length > 0 ? data[0].id : null
        });
        
        if (error) {
          if (error.code === '23503') {
            // Foreign key constraint error
            console.error('[HomeworkModule] Foreign key constraint error:', error);
            setDatabaseError('数据库外键约束错误，需要修复数据库关系');
            throw new Error('外键约束错误: ' + error.message);
          }
          
          console.error('[HomeworkModule] Error querying homework:', error);
          throw error;
        }
        
        // Clear error state on success
        setDatabaseError(null);
        return data || [];
      } catch (error: any) {
        console.error('[HomeworkModule] Error in homework query:', error);
        if (error.message !== '外键约束错误') {
          setDatabaseError(error.message || '未知数据库错误');
        }
        throw error;
      }
    },
    enabled: !!courseId && !!lectureId && !isNaN(numericCourseId) && numericCourseId > 0,
    retry: 1,
    refetchInterval: false,
  });

  // Homework submissions query - unmodified
  const { data: submissions, isLoading: isLoadingSubmissions, refetch: refetchSubmissions } = useQuery({
    queryKey: ['homework-submissions', numericCourseId, lectureId, user?.id],
    queryFn: async () => {
      if (!user?.id) return {};
      
      // Validate course ID
      if (isNaN(numericCourseId)) {
        console.error('无效的课程ID，无法转换为数字:', courseId);
        throw new Error('无效的课程ID');
      }
      
      const { data, error } = await supabase
        .from('homework_submissions')
        .select('homework_id, submitted_at')
        .eq('course_id', numericCourseId)
        .eq('lecture_id', lectureId)
        .eq('user_id', user.id);

      const result = handleHomeworkSubmissionsQueryError(data, error);
      
      return result?.reduce((acc: Record<string, boolean>, curr: any) => {
        acc[curr.homework_id] = true;
        return acc;
      }, {}) || {};
    },
    enabled: !!courseId && !!lectureId && !!user?.id && !isNaN(numericCourseId),
  });

  // Cleanup toasts on unmount
  useEffect(() => {
    return () => {
      clearAllToasts();
    };
  }, []);

  // Create default homework - improved to make sure course exists in courses_new
  useEffect(() => {
    const createDefaultHomework = async () => {
      // Check prerequisites
      if (!user?.id || !courseId || !lectureId || isCreatingDefaultHomework || isNaN(numericCourseId)) return;
      if (homeworkError) return; // Skip if query error occurred
      if (homework && homework.length > 0) return; // Skip if homework exists
      
      setIsCreatingDefaultHomework(true);
      try {
        console.log('[HomeworkModule] Creating default homework for lecture:', lectureId);
        console.log('[HomeworkModule] Using numericCourseId:', numericCourseId, 'type:', typeof numericCourseId);
        
        // Validate course ID
        if (numericCourseId <= 0) {
          console.error('[HomeworkModule] Invalid course ID for default homework creation:', numericCourseId);
          throw new Error('课程ID必须是有效数字');
        }
        
        // Verify course exists in courses_new table
        const { data: courseCheck, error: courseError } = await supabase
          .from('courses_new')
          .select('id')
          .eq('id', numericCourseId)
          .maybeSingle();
          
        console.log('[HomeworkModule] Course existence check in courses_new:', { courseCheck, courseError });
          
        if (courseError || !courseCheck) {
          console.error('[HomeworkModule] Course existence check failed:', {courseId: numericCourseId, error: courseError});
          throw new Error(`课程ID ${numericCourseId} 不存在于新课程系统`);
        }
        
        // Make sure foreign key constraint is fixed before creating homework
        try {
          const migrationResult = await executeHomeworkMigration();
          console.log('[HomeworkModule] Migration check before homework creation:', migrationResult);
          
          if (!migrationResult.success) {
            throw new Error(`无法创建作业: ${migrationResult.message}`);
          }
        } catch (err: any) {
          console.error('[HomeworkModule] Migration error before creating homework:', err);
          throw new Error(`修复数据库关系失败，无法创建作业: ${err.message}`);
        }
        
        // Delete any existing homework for this lecture
        await supabase
          .from('homework')
          .delete()
          .eq('course_id', numericCourseId)
          .eq('lecture_id', lectureId);
        
        // Create new default homework
        const homeworkTypes = [
          {
            id: uuidv4(),
            course_id: numericCourseId,
            lecture_id: lectureId,
            title: '单选题 - 知识掌握度评估',
            description: '请选择最适合的答案',
            type: 'single_choice',
            options: {
              question: '您对本节课内容理解程度如何？',
              choices: ['非常理解', '基本理解', '一般', '需要再复习']
            }
          },
          {
            id: uuidv4(),
            course_id: numericCourseId,
            lecture_id: lectureId,
            title: '多选题 - 知识点复习',
            description: '请选择所有适用的选项',
            type: 'multiple_choice',
            options: {
              question: '本节课中您学到了哪些知识点？（可多选）',
              choices: ['基础概念', '实践技巧', '案例分析', '历史背景', '行业应用']
            }
          },
          {
            id: uuidv4(),
            course_id: numericCourseId,
            lecture_id: lectureId,
            title: '填空题 - 课程内容总结',
            description: '请用文字总结本节课的主要内容，并可选择上传相关资料或笔记',
            type: 'fill_blank',
            options: {
              question: '请用自己的话总结本节课的主要内容（200字以内），如有补充资料请一并提交'
            }
          }
        ];
        
        console.log('[HomeworkModule] Creating homework with types:', homeworkTypes.length);
        
        // Create homework
        const { data, error } = await supabase
          .from('homework')
          .insert(homeworkTypes);
          
        console.log('[HomeworkModule] Homework creation result:', { success: !error, error: error?.message });
          
        if (error) {
          console.error('[HomeworkModule] Error creating homework:', error);
          
          if (error.code === '23503') {
            // Foreign key constraint error
            setDatabaseError('数据库外键约束错误，需要修复数据库关系');
            showToast('create', () => toast.error('创建作业失败: 数据库外键约束错误，需要修复数据库关系'));
          } else {
            showToast('create', () => toast.error('创建作业失败: ' + error.message));
          }
        } else {
          console.log('[HomeworkModule] Successfully created homework for lecture:', lectureId);
          showToast('create', () => toast.success('已创建课后练习'));
          setDatabaseError(null);
          await refetchHomework();
        }
      } catch (error: any) {
        console.error('[HomeworkModule] Error in createDefaultHomework:', error);
        showToast('error', () => toast.error('创建作业时出错: ' + (error.message || '未知错误')));
      } finally {
        setIsCreatingDefaultHomework(false);
      }
    };
    
    if (!homework || homework.length < 3) {
      createDefaultHomework();
    }
  }, [homework, numericCourseId, lectureId, user?.id, refetchHomework, isCreatingDefaultHomework, courseId, homeworkError]);

  // Monitor homework completion - unmodified
  useEffect(() => {
    if (homework && homework.length > 0 && submissions) {
      const allCompleted = homework.every(hw => !!submissions[hw.id]);
      setAllHomeworkCompleted(allCompleted);
      
      if (allCompleted && !allHomeworkCompleted) {
        console.log('All homework completed, calling onHomeworkSubmit');
        onHomeworkSubmit?.();
      }
    } else if (homework && homework.length === 0 && !databaseError && !homeworkError) {
      console.log('No homework found, marking as completed');
      setAllHomeworkCompleted(true);
      onHomeworkSubmit?.();
    }
  }, [homework, submissions, allHomeworkCompleted, onHomeworkSubmit, databaseError, homeworkError]);

  // Handle homework submission - unmodified
  const handleHomeworkSubmitted = async () => {
    await refetchSubmissions();
    await refetchHomework();
  };

  // Manual refresh function - unmodified
  const manualRefresh = async () => {
    console.log('手动刷新作业数据');
    showToast('refresh', () => toast.info('正在刷新作业数据...'));
    try {
      await refetchHomework();
      showToast('refresh', () => toast.success('作业数据已刷新'));
    } catch (error: any) {
      console.error('刷新作业数据失败:', error);
      showToast('refresh', () => toast.error('刷新作业数据失败: ' + (error.message || '未知错误')));
    }
  };

  // 渲染组件
  return (
    <div className="w-full">
      {/* 数据库错误显示 */}
      {databaseError && (
        <div className="mb-4 p-4 border border-red-300 bg-red-50 rounded-lg flex items-start">
          <AlertCircle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-red-700 font-medium">数据库错误</p>
            <p className="text-red-600 text-sm">{databaseError}</p>
            <div className="mt-2 flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleExecuteMigration}
                disabled={migrationStatus.executed && migrationStatus.success}
              >
                修复数据库关系
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleDiagnoseTable}
              >
                诊断表结构
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={manualRefresh}
              >
                重新加载
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {isLoadingHomework && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">正在加载课后练习...</span>
        </div>
      )}

      {/* 错误状态处理 */}
      {homeworkError && !databaseError && (
        <div className="mb-4 p-4 border border-red-300 bg-red-50 rounded-lg flex items-start">
          <AlertCircle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-red-700 font-medium">加载作业时出错</p>
            <p className="text-red-600 text-sm">{(homeworkError as Error).message}</p>
            <div className="mt-2 flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={manualRefresh}
              >
                重新加载
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 没有作业时显示 */}
      {!isLoadingHomework && !homeworkError && homework && homework.length === 0 && !databaseError && (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
          <p className="text-gray-500">此课程没有课后练习</p>
          {user && (
            <Button
              onClick={() => {
                console.log('Creating default homework for lecture:', lectureId);
                // Fix: Use refetchHomework instead of setHomework
                refetchHomework();
              }}
              className="mt-4"
              variant="outline"
              size="sm"
              disabled={isCreatingDefaultHomework}
            >
              {isCreatingDefaultHomework ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  创建中...
                </>
              ) : (
                '创建默认练习'
              )}
            </Button>
          )}
        </div>
      )}

      {/* 作业列表 */}
      {!isLoadingHomework && homework && homework.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">课后练习</h3>
          {homework.map((item: any) => (
            <HomeworkCard
              key={item.id}
              homework={item}
              courseId={numericCourseId.toString()}
              lectureId={lectureId}
              isSubmitted={!!submissions?.[item.id]}
              onSubmitted={handleHomeworkSubmitted}
            />
          ))}
          
          {allHomeworkCompleted && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-green-700 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              恭喜！你已完成所有课后练习
            </div>
          )}
        </div>
      )}
    </div>
  );
};
