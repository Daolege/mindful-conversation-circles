
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookUser, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useEffect, useRef, memo } from "react"
import { useTranslations } from "@/hooks/useTranslations"

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
  const { t } = useTranslations();
  
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
      console.log(`[DashboardStats] ${t('dashboard:componentRender')} #${renderCountRef.current}, stats=${JSON.stringify({
        totalCourses,
        completedCourses,
        averageProgress
      })}, ${t('dashboard:timeSinceLastRender')}: ${timeSinceLastRender}ms, ${t('dashboard:dataChanged')}: ${propsChanged}`);
    }
    
    // 监测重复渲染但props未变化的情况
    if (timeSinceLastRender < 50 && renderCountRef.current > 1 && !propsChanged) {
      console.warn(`[DashboardStats] ${t('dashboard:unnecessaryRenderWarning')} (${timeSinceLastRender}ms)! ${t('dashboard:propsUnchangedWarning')}`);
    }
    
    return () => {
      if (import.meta.env.DEV) {
        console.log(`[DashboardStats] ${t('dashboard:componentUnmounted')}`);
      }
    };
  }, [totalCourses, completedCourses, averageProgress, t]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookUser className="h-5 w-5 text-knowledge-primary" />
            {t('dashboard:totalCourses')}
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
            {t('dashboard:completedCourses')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{completedCourses}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t('dashboard:overallProgress')}
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
