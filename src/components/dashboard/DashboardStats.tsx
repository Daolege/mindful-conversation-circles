
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookUser, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useEffect, useRef, memo } from "react"

interface DashboardStatsProps {
  totalCourses: number
  completedCourses: number
  averageProgress: number
}

// 使用React.memo优化组件，避免不必要的重渲染
export const DashboardStats = memo(({
  totalCourses,
  completedCourses,
  averageProgress,
}: DashboardStatsProps) => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());
  const prevPropsRef = useRef({ totalCourses: -1, completedCourses: -1, averageProgress: -1 });
  
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    lastRenderTimeRef.current = now;
    
    renderCountRef.current += 1;
    
    // 检查Props是否有实际变化
    const propsChanged = (
      prevPropsRef.current.totalCourses !== totalCourses ||
      prevPropsRef.current.completedCourses !== completedCourses ||
      prevPropsRef.current.averageProgress !== averageProgress
    );
    
    prevPropsRef.current = { totalCourses, completedCourses, averageProgress };
    
    // 仅在开发环境和有变化时记录详细日志
    if (import.meta.env.DEV && (renderCountRef.current === 1 || propsChanged)) {
      console.log(`[DashboardStats] 组件渲染 #${renderCountRef.current}，stats=${JSON.stringify({
        totalCourses,
        completedCourses,
        averageProgress
      })}, 距上次渲染: ${timeSinceLastRender}ms, 数据变化: ${propsChanged}`);
    }
    
    // 监测重复渲染但props未变化的情况
    if (timeSinceLastRender < 50 && renderCountRef.current > 1 && !propsChanged) {
      console.warn(`[DashboardStats] 警告：不必要的渲染 (${timeSinceLastRender}ms)! Props未变化却触发重新渲染`);
    }
    
    return () => {
      if (import.meta.env.DEV) {
        console.log('[DashboardStats] 组件卸载');
      }
    };
  }, [totalCourses, completedCourses, averageProgress]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookUser className="h-5 w-5 text-knowledge-primary" />
            总课程数
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalCourses}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-knowledge-primary" />
            已完成课程
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{completedCourses}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            总体进度
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={averageProgress} />
          <p className="text-sm text-muted-foreground text-right">
            {Math.round(averageProgress)}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
});

// 添加显示名称，有助于调试
DashboardStats.displayName = 'DashboardStats';
