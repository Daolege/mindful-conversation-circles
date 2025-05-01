
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CourseNew } from "@/lib/types/course-new";
import { Book, Play, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function SimpleCourseTab() {
  const navigate = useNavigate();
  const [courses] = useState<CourseNew[]>(getSampleCourses());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
        <h3 className="text-xl font-medium">我的课程 <span className="text-muted-foreground text-sm">({courses.length})</span></h3>
        <Button 
          onClick={() => navigate('/my-courses')} 
          variant="outline" 
          size="sm"
          className="shrink-0"
        >
          查看全部课程
        </Button>
      </div>

      {courses.length > 0 ? (
        <div className="space-y-4">
          {courses.map((course) => (
            <CourseListItem key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="bg-muted/50 border rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">暂无已购课程</h3>
          <p className="text-muted-foreground mb-6">
            您还没有购买任何课程，浏览我们的课程库开始您的学习之旅
          </p>
          
          <Button 
            onClick={() => navigate('/courses')} 
            className="min-w-[150px]"
          >
            浏览课程
          </Button>
        </div>
      )}
    </div>
  );
}

interface CourseListItemProps {
  course: CourseNew;
}

const CourseListItem = ({ course }: CourseListItemProps) => {
  const navigate = useNavigate();
  
  // 随机生成课程进度 (0-100)
  const progress = Math.floor(Math.random() * 101);
  const isCompleted = progress === 100;
  const hasStarted = progress > 0;
  
  // 获取状态标签
  const getStatusBadge = () => {
    if (isCompleted) {
      return <Badge className="bg-green-500 hover:bg-green-600">已完成</Badge>;
    } else if (hasStarted) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">进行中</Badge>;
    } else {
      return <Badge variant="outline">未开始</Badge>;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg hover:bg-gray-50/50 transition-colors">
      <div className="space-y-2 mb-3 sm:mb-0 w-full sm:w-auto">
        <h4 className="font-medium text-base">
          {course.title}
        </h4>
        
        <div className="flex items-center gap-2 flex-wrap">
          {getStatusBadge()}
          
          <Badge variant="outline">
            {course.category || "通用课程"}
          </Badge>
          
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {Math.floor(Math.random() * 10) + 1}小时内容
          </span>
        </div>
        
        <div className="flex flex-col gap-1 w-full sm:max-w-xs">
          <div className="flex justify-between items-center text-xs">
            <span>学习进度</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0 w-full sm:w-auto">
        <Button 
          size="sm" 
          onClick={() => navigate(`/course-learn/${course.id}`)}
          className="flex-1 sm:flex-none"
        >
          {hasStarted ? (
            <>
              <Play className="h-4 w-4 mr-1" />
              继续学习
            </>
          ) : (
            <>
              <Book className="h-4 w-4 mr-1" />
              开始学习
            </>
          )}
        </Button>
        
        <Button 
          size="sm"
          variant="outline" 
          onClick={() => navigate(`/course-detail/${course.id}`)}
          className="flex-1 sm:flex-none"
        >
          课程详情
        </Button>
      </div>
    </div>
  );
};

// 生成示例课程数据
function getSampleCourses(): CourseNew[] {
  const courseTitles = [
    "JavaScript 高级编程技巧",
    "React 框架实战课程",
    "数据结构与算法入门",
    "Web前端性能优化指南",
    "Python 数据分析基础"
  ];
  
  const categories = ["前端开发", "后端开发", "算法", "数据分析", "云计算", null];
  
  return courseTitles.map((title, index) => ({
    id: index + 1,
    title,
    description: `这是${title}的详细描述，包含了课程的主要内容和学习目标。`,
    price: Math.floor(Math.random() * 10000) / 10,
    original_price: Math.floor(Math.random() * 20000) / 10,
    currency: "CNY",
    category: categories[Math.floor(Math.random() * categories.length)],
    display_order: index,
    status: 'published',
    is_featured: Math.random() > 0.7,
    student_count: Math.floor(Math.random() * 1000),
    enrollment_count: Math.floor(Math.random() * 2000),
    thumbnail_url: `/lovable-uploads/${index + 1}8b1149-2643-4e8c-b18a-658de84ead30.png`,
    created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
    updated_at: new Date().toISOString()
  }));
}
