
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/authHooks";
import { generateMockData } from "@/lib/services/mockDataService";

export function EnrolledCoursesNew({ coursesWithProgress, showAll = false }: { 
  coursesWithProgress: any[];
  showAll?: boolean;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isGeneratingData, setIsGeneratingData] = useState(false);

  const displayedCourses = showAll 
    ? coursesWithProgress 
    : coursesWithProgress?.slice(0, 3);

  const handleGenerateData = async () => {
    if (!user?.id || isGeneratingData) return;
    
    setIsGeneratingData(true);
    try {
      const result = await generateMockData(user.id);
      
      if (result.success && result.courses) {
        toast.success("示例数据已生成", {
          description: "课程数据已添加到您的账户，请刷新页面查看"
        });
        // Reload the page to see the new data
        window.location.reload();
      } else {
        toast.error("生成示例数据失败", {
          description: "请稍后再试"
        });
      }
    } catch (err) {
      console.error("Error generating mock data:", err);
      toast.error("生成示例数据时发生错误");
    } finally {
      setIsGeneratingData(false);
    }
  };

  const getProgressPercentage = (courseProgress: any) => {
    if (!courseProgress) return 0;
    if (Array.isArray(courseProgress)) {
      return courseProgress[0]?.progress_percent || 0;
    }
    return courseProgress.progress_percent || 0;
  };

  if (coursesWithProgress?.length === 0) {
    return (
      <div className="bg-muted/50 border rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium mb-2">尚未购买课程</h3>
        <p className="text-muted-foreground mb-6">您尚未购买任何课程，浏览所有课程找到适合您的学习内容</p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            onClick={() => navigate('/courses')} 
            className="min-w-[150px]"
          >
            浏览课程
          </Button>
          
          <Button 
            onClick={handleGenerateData} 
            variant="outline" 
            disabled={isGeneratingData}
            className="min-w-[150px] inline-flex items-center"
          >
            {isGeneratingData ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            添加示例数据
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!showAll && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">我的课程</h3>
          {coursesWithProgress?.length > 3 && (
            <Button 
              variant="link" 
              className="text-knowledge-primary"
              onClick={() => navigate('/dashboard?tab=courses')}
            >
              查看全部
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedCourses?.map((item) => {
          const course = item.courses;
          const progress = getProgressPercentage(item.course_progress);
          const isCompleted = item.course_progress?.completed || false;

          return (
            <Card key={course?.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div 
                className="h-40 bg-cover bg-center" 
                style={{ backgroundImage: `url(${course?.imageurl || '/placeholder-course.jpg'})` }}
              />
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2 h-14 line-clamp-2">{course?.title}</h4>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>{isCompleted ? '已完成' : '进行中'}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="mt-4">
                  <Button 
                    onClick={() => navigate(`/learn/${course?.id}`)} 
                    className="w-full"
                    variant={isCompleted ? "outline" : "default"}
                  >
                    {isCompleted ? '复习课程' : '继续学习'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
