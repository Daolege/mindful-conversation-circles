import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { UserCourse } from "@/types/dashboard"
import { memo, useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Languages, Book, Calendar, RefreshCcw } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { useAuth } from "@/contexts/authHooks"
import { enrollUserInSampleCourses } from "@/lib/services/userEnrollmentService"
import { InfiniteScroll } from "./common/InfiniteScroll"
import { TooltipProvider } from "@/components/ui/tooltip"

const COURSES_PER_PAGE = 6;

export const EnrolledCourses = memo(({ 
  coursesWithProgress,
  showAll = false
}: {
  coursesWithProgress: UserCourse[] | undefined,
  showAll?: boolean
}) => {
  const [displayLimit, setDisplayLimit] = useState(COURSES_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { user } = useAuth();

  const displayCourses = coursesWithProgress?.slice(0, displayLimit);
  const hasMore = coursesWithProgress ? displayLimit < coursesWithProgress.length : false;
  
  const handleLoadMore = useCallback(async () => {
    setIsLoadingMore(true);
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setDisplayLimit(prev => prev + COURSES_PER_PAGE);
    setIsLoadingMore(false);
  }, []);
  
  const handleGenerateSampleData = useCallback(async () => {
    if (!user?.id) {
      toast.error('请先登录');
      return;
    }
    
    toast.loading('正在生成示例数据...');
    try {
      await enrollUserInSampleCourses(user.id);
      toast.success('已添加示例数据', {
        description: '请刷新页面查看',
        action: {
          label: '刷新',
          onClick: () => window.location.reload()
        }
      });
    } catch (error) {
      console.error('Error generating sample data:', error);
      toast.error('生成示例数据失败');
    }
  }, [user]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Book className="h-5 w-5 text-knowledge-primary" />
          我报名的课程
        </CardTitle>
        {(!displayCourses || displayCourses.length === 0) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateSampleData}
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            <span>添加示例数据</span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          {displayCourses && displayCourses.length > 0 ? (
            <InfiniteScroll
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              isLoading={isLoadingMore}
            >
              <div className="space-y-4">
                {displayCourses.map((item) => (
                  <div key={item.course_id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex-grow">
                        <Link 
                          to={`/courses/${item.course_id}`}
                          className="text-knowledge-primary hover:underline font-medium"
                        >
                          {item.courses.title}
                        </Link>
                        <div className="text-sm text-muted-foreground mt-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Languages className="h-4 w-4" />
                            <span>授课语言: 中文</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Book className="h-4 w-4" />
                            <span>{item.courses.syllabus?.length || 0} 章节</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>报名时间: {format(new Date(item.purchased_at), 'yyyy-MM-dd')}</span>
                          </div>
                        </div>
                        {item.course_progress && item.course_progress.length > 0 && (
                          <div className="mt-2">
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-knowledge-primary" 
                                style={{ width: `${item.course_progress[0]?.progress_percent || 0}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              进度: {item.course_progress[0]?.progress_percent || 0}%
                            </div>
                          </div>
                        )}
                      </div>
                      <Link to={`/courses/${item.course_id}`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">查看课程</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                
                {!showAll && coursesWithProgress && coursesWithProgress.length > displayLimit && (
                  <div className="text-center pt-2">
                    <Link to="/dashboard?tab=courses">
                      <Button variant="link">
                        查看全部课程
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </InfiniteScroll>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">暂无报名课程</p>
              <p className="text-sm text-muted-foreground mb-6">您可以浏览课程列表，找到感兴趣的课程进行报名</p>
              <div className="flex justify-center gap-4">
                <Link to="/courses">
                  <Button variant="outline">
                    浏览全部课程
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
});

EnrolledCourses.displayName = 'EnrolledCourses';
