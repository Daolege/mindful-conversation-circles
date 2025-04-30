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
  
  // 用于跟踪toast IDs - 统一管理且确保ID总是字符串
  const [activeToastIds, setActiveToastIds] = useState<Record<string, string>>({});

  // 获取课程ID - 确保是数值类型并记录详细的转换过程
  const numericCourseId = parseInt(courseId);
  console.log('[HomeworkModule] Course ID conversion:', {
    original: courseId,
    type: typeof courseId,
    parsed: numericCourseId,
    parsedType: typeof numericCourseId,
    isValid: !isNaN(numericCourseId)
  });
  
  // 显示toast的辅助函数，确保ID总是字符串类型
  const showToast = (key: string, toastFn: () => string | number) => {
    // 如果有现有toast，先清除
    if (activeToastIds[key]) {
      toast.dismiss(activeToastIds[key]);
    }
    
    // 确保ID被转换为字符串
    const id = String(toastFn());
    
    // 存储新的toast ID
    setActiveToastIds(prev => ({...prev, [key]: id}));
    return id;
  };

  // 清除特定类型的toast
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

  // 清除所有toasts
  const clearAllToasts = () => {
    Object.entries(activeToastIds).forEach(([key, id]) => {
      if (id) toast.dismiss(id);
    });
    setActiveToastIds({});
  };
  
  // 执行数据库迁移 - 增强错误处理和调试信息
  const handleExecuteMigration = async () => {
    showToast('migration', () => toast.loading('正在修复数据库关系...'));
    try {
      console.log('[HomeworkModule] Starting database migration for course ID:', numericCourseId);
      
      // 执行迁移前先验证课程存在
      try {
        const { count, error } = await supabase
          .from('courses_new')
          .select('*', { count: 'exact', head: true })
          .eq('id', numericCourseId);
          
        console.log('[HomeworkModule] Course existence check:', { count, error });
        
        if (error || count === 0) {
          throw new Error(`课程ID ${numericCourseId} 不存在于新课程系统`);
        }
      } catch (err: any) {
        console.error('[HomeworkModule] Course validation error:', err);
        throw new Error(`验证课程失败: ${err.message}`);
      }
      
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
        // 修复成功后，刷新作业列表并设置本地存储标记
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

  // 诊断数据库表
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

  // 作业查询 - 确保先执行迁移并增强错误处理
  const { data: homework, isLoading: isLoadingHomework, error: homeworkError, refetch: refetchHomework } = useQuery({
    queryKey: ['homework', numericCourseId, lectureId],
    queryFn: async () => {
      console.log('[HomeworkModule] Fetching homework for lecture ID:', lectureId);
      console.log('[HomeworkModule] Current courseId:', courseId, 'type:', typeof courseId);
      console.log('[HomeworkModule] Converted numericCourseId:', numericCourseId, 'type:', typeof numericCourseId);
      
      // 检查课程ID是否有效
      if (isNaN(numericCourseId) || numericCourseId <= 0) {
        const error = new Error(`无效的课程ID: ${courseId}`);
        console.error('[HomeworkModule]', error.message);
        setDatabaseError(error.message);
        throw error;
      }
      
      // 检查迁移是否已执行
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
      
      // 验证课程存在于courses_new表中
      try {
        const { data: courseExists, error: courseError } = await supabase
          .from('courses_new')
          .select('id')
          .eq('id', numericCourseId)
          .single();
        
        console.log('[HomeworkModule] Course validation result:', { courseExists, courseError });
        
        if (courseError || !courseExists) {
          console.error('[HomeworkModule] Course does not exist:', courseError);
          setDatabaseError(`课程ID ${numericCourseId} 在新课程系统中不存在`);
          throw new Error(`课程不存在: ${courseError?.message || '未知错误'}`);
        }
      } catch (error: any) {
        console.error('[HomeworkModule] Course validation error:', error);
        setDatabaseError(`验证课程失败: ${error.message || '未知错误'}`);
        throw error;
      }
      
      // 查询作业数据
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
            // 外键约束错误，需要修复数据库
            console.error('[HomeworkModule] Foreign key constraint error:', error);
            setDatabaseError('数据库外键约束错误，需要修复数据库关系');
            throw new Error('外键约束错误: ' + error.message);
          }
          
          console.error('[HomeworkModule] Error querying homework:', error);
          throw error;
        }
        
        // 清除错误状态
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

  // 作业提交查询
  const { data: submissions, isLoading: isLoadingSubmissions, refetch: refetchSubmissions } = useQuery({
    queryKey: ['homework-submissions', numericCourseId, lectureId, user?.id],
    queryFn: async () => {
      if (!user?.id) return {};
      
      // 确保课程ID是有效的数字
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

  // 组件卸载时清理toasts
  useEffect(() => {
    return () => {
      clearAllToasts();
    };
  }, []);

  // 创建默认作业的逻辑 - 增强课程ID检验
  useEffect(() => {
    const createDefaultHomework = async () => {
      // 检查是否需要创建默认作业
      if (!user?.id || !courseId || !lectureId || isCreatingDefaultHomework || isNaN(numericCourseId)) return;
      if (homeworkError) return; // 如果查询出错，不创建默认作业
      if (homework && homework.length > 0) return; // 如果已有作业，不创建默认作业
      
      setIsCreatingDefaultHomework(true);
      try {
        console.log('[HomeworkModule] Creating default homework for lecture:', lectureId);
        console.log('[HomeworkModule] Using numericCourseId:', numericCourseId, 'type:', typeof numericCourseId);
        
        // 检查课程ID是否有效
        if (numericCourseId <= 0) {
          console.error('[HomeworkModule] Invalid course ID for default homework creation:', numericCourseId);
          throw new Error('课程ID必须是有效数字');
        }
        
        // 先检查此课程是否存在于courses_new表
        const { data: courseCheck, error: courseError } = await supabase
          .from('courses_new')
          .select('id')
          .eq('id', numericCourseId)
          .maybeSingle();
          
        console.log('[HomeworkModule] Course existence check:', { courseCheck, courseError });
          
        if (courseError || !courseCheck) {
          console.error('[HomeworkModule] Course existence check failed:', {courseId: numericCourseId, error: courseError});
          throw new Error(`课程ID ${numericCourseId} 不存在`);
        }
        
        // 先删除可能存在的旧作业
        await supabase
          .from('homework')
          .delete()
          .eq('course_id', numericCourseId)
          .eq('lecture_id', lectureId);
        
        // 创建新的默认作业
        const homeworkTypes = [
          {
            id: uuidv4(),
            course_id: numericCourseId,
            lecture_id: lectureId,
            title: '单选题 - 知识���握度评估',
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
        
        // 在创建作业前检查外键约束是否正常
        try {
          const migrationResult = await executeHomeworkMigration();
          console.log('[HomeworkModule] Migration check before homework creation:', migrationResult);
        } catch (err) {
          console.warn('[HomeworkModule] Migration check failed:', err);
          // Continue anyway
        }
        
        // 创建作业
        const { data, error } = await supabase
          .from('homework')
          .insert(homeworkTypes);
          
        console.log('[HomeworkModule] Homework creation result:', { success: !error, error: error?.message });
          
        if (error) {
          console.error('[HomeworkModule] Error creating homework:', error);
          
          if (error.code === '23503') {
            // 外键约束错误
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

  // 监控作业完成状态
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

  // 处理作业提交
  const handleHomeworkSubmitted = async () => {
    await refetchSubmissions();
    await refetchHomework();
  };

  // 手动刷新作业数据
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

  if (isLoadingHomework || isLoadingSubmissions) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // 显示数据库错误
  if (databaseError) {
    return (
      <div className="mt-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">课后作业</h2>
        </div>
        
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">数据库错误</h3>
              <p className="mt-1 text-red-700">{databaseError}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  onClick={handleExecuteMigration}
                >
                  修复数据库关系
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDiagnoseTable}
                >
                  诊断数据库表
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={manualRefresh}
                >
                  重新加载
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {migrationStatus.executed && (
          <div className={`p-4 mt-4 rounded-md ${migrationStatus.success ? 'bg-green-50 border border-green-100' : 'bg-yellow-50 border border-yellow-100'}`}>
            <p className={migrationStatus.success ? 'text-green-700' : 'text-yellow-700'}>
              {migrationStatus.message}
            </p>
          </div>
        )}
      </div>
    );
  }

  // 显示普通错误
  if (homeworkError) {
    return (
      <div className="mt-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">课后作业</h2>
        </div>
        
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">获取作业失败</h3>
              <p className="mt-1 text-red-700">{(homeworkError as Error).message || '未知错误'}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={manualRefresh}
                >
                  重试
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDiagnoseTable}
                >
                  诊断数据库表
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!homework?.length && isCreatingDefaultHomework) {
    return (
      <div className="mt-6 flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>正在创建课后作业...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">课后作业</h2>
        <Button 
          onClick={manualRefresh} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
        >
          <Loader2 className="h-4 w-4" />
          刷新作业
        </Button>
      </div>
      
      {!homework?.length ? (
        <div className="mt-6 text-gray-500 mb-4">
          该课时暂无作业
        </div>
      ) : (
        <div className="space-y-4">
          {homework.map((hw) => (
            <HomeworkCard
              key={hw.id}
              homework={{
                id: hw.id,
                title: hw.title,
                description: hw.description || null,
                type: hw.type as 'single_choice' | 'multiple_choice' | 'fill_blank',
                options: hw.options,
                image_url: hw.image_url || null,
                lecture_id: hw.lecture_id
              }}
              isSubmitted={submissions?.[hw.id] || false}
              onSubmissionSuccess={handleHomeworkSubmitted}
            />
          ))}
        </div>
      )}
      
      {allHomeworkCompleted && (
        <div className="p-4 mt-4 bg-green-50 border border-green-100 rounded-md">
          <p className="text-green-700">所有作业已完成，课程进度已更新</p>
        </div>
      )}
    </div>
  );
};
