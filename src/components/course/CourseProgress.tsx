
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/authHooks";
import { handleQueryError, CourseProgressData } from "@/lib/supabaseUtils";

interface CourseProgressProps {
  courseId: string | number;
  userId?: string;
  videoCount?: number;
}

export const CourseProgress = ({ courseId, userId, videoCount = 0 }: CourseProgressProps) => {
  const [progress, setProgress] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const isMounted = useRef(true);
  const fetchingRef = useRef(false);
  const dataFetchedRef = useRef(false);
  const renderCountRef = useRef(0);
  const componentMountedAt = useRef(Date.now());
  
  const currentUserId = userId || user?.id;

  useEffect(() => {
    renderCountRef.current += 1;
    console.log(`[CourseProgress] 组件渲染 #${renderCountRef.current}，courseId=${courseId}, userId=${currentUserId}, videoCount=${videoCount}`);
    
    return () => {
      const mountDuration = Date.now() - componentMountedAt.current;
      console.log(`[CourseProgress] 组件卸载，存活时间：${mountDuration}ms`);
    };
  }, [courseId, currentUserId, videoCount]);

  // 使用 useCallback 减少不必要的函数重建
  const fetchProgress = useCallback(async () => {
    // 防止重复请求和组件卸载后的状态更新
    if (fetchingRef.current || !isMounted.current || !currentUserId || !courseId) {
      console.log(`[CourseProgress] 跳过进度获取: fetchingRef=${fetchingRef.current}, isMounted=${isMounted.current}, userId=${!!currentUserId}, courseId=${!!courseId}`);
      if (!currentUserId || !courseId) setIsLoading(false);
      return;
    }

    // 如果数据已经获取,不再重新获取
    if (dataFetchedRef.current) {
      console.log(`[CourseProgress] 跳过进度获取: 数据已获取`);
      return;
    }

    fetchingRef.current = true;
    const parsedCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
    console.log(`[CourseProgress] 开始获取进度: courseId=${parsedCourseId}, userId=${currentUserId}`);
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('course_progress')
        .select('progress_percent')
        .eq('user_id', currentUserId as string)
        .eq('course_id', parsedCourseId as number)
        .single();

      // Using our universal error handler
      const result = handleQueryError<CourseProgressData>(data as CourseProgressData, error);
      
      if (isMounted.current) {
        console.log(`[CourseProgress] 获取进度成功: ${result?.progress_percent || 0}%`);
        setProgress(result?.progress_percent || 0);
        dataFetchedRef.current = true; // 标记数据已获取
      }
    } catch (error) {
      console.error("[CourseProgress] 获取进度异常:", error);
      if (isMounted.current) setProgress(null);
    } finally {
      if (isMounted.current) setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [courseId, currentUserId]);

  useEffect(() => {
    // 组件挂载
    isMounted.current = true;
    dataFetchedRef.current = false; // 重置数据获取状态
    console.log(`[CourseProgress] 组件挂载监听器`);
    
    // 只有在有必要数据且未获取时才获取
    if (currentUserId && courseId && !fetchingRef.current && !dataFetchedRef.current) {
      console.log(`[CourseProgress] 组件挂载时触发获取进度`);
      fetchProgress();
    } else if (!currentUserId || !courseId) {
      console.log(`[CourseProgress] 组件挂载但跳过获取进度: userId=${!!currentUserId}, courseId=${!!courseId}`);
      setIsLoading(false);
    }
    
    // 组件卸载
    return () => {
      console.log(`[CourseProgress] 移除监听器`);
      isMounted.current = false;
    };
  }, [fetchProgress, currentUserId, courseId]); 

  if (!currentUserId) {
    console.log(`[CourseProgress] 渲染: 未登录状态`);
    return (
      <p className="text-sm italic text-gray-500">
        请先<a href="/auth" className="text-knowledge-primary hover:underline">登录</a>以追踪学习进度
      </p>
    );
  }

  if (isLoading) {
    console.log(`[CourseProgress] 渲染: 加载中状态`);
    return <Skeleton className="w-full h-2" />;
  }

  const progressPercentage = progress !== null ? progress : 0;
  console.log(`[CourseProgress] 渲染: 显示进度 ${progressPercentage}%`);

  return (
    <div className="mt-2">
      <Progress value={progressPercentage} />
      <p className="text-sm text-muted-foreground mt-2">
        {progress !== null ? `已完成 ${Math.round(progressPercentage / 100 * videoCount)} / ${videoCount} 节` : '尚未开始学习'}
      </p>
    </div>
  );
};
