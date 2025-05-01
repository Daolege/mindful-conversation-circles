
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CourseNew } from "@/lib/types/course-new";
import { Book, Play, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export function SimpleCourseTab() {
  const navigate = useNavigate();
  const [courses] = useState<CourseNew[]>(getSampleCourses());
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Animation variants for staggered loading
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
        <h3 className="text-xl font-medium">我的课程 <span className="text-muted-foreground text-sm">({courses.length})</span></h3>
        <Button 
          onClick={() => navigate('/my-courses')} 
          variant="outline" 
          size="sm"
          className="shrink-0 hover:scale-105 transition-transform duration-200 hover:shadow-md"
        >
          查看全部课程
        </Button>
      </div>

      {isLoading ? (
        // Loading animation cards
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="flex flex-col sm:flex-row justify-between">
                <div className="space-y-3 mb-3 sm:mb-0 w-full sm:w-2/3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="flex gap-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="w-full sm:max-w-xs mt-2">
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <div className="h-9 bg-gray-200 rounded w-24"></div>
                  <div className="h-9 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {courses.map((course) => (
            <CourseListItem key={course.id} course={course} />
          ))}
        </motion.div>
      ) : (
        <motion.div 
          className="bg-muted/50 border rounded-lg p-8 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-medium mb-2">暂无已购课程</h3>
          <p className="text-muted-foreground mb-6">
            您还没有购买任何课程，浏览我们的课程库开始您的学习之旅
          </p>
          
          <Button 
            onClick={() => navigate('/courses')} 
            className="min-w-[150px] hover:scale-105 transition-all duration-300 hover:shadow-lg"
          >
            浏览课程
          </Button>
        </motion.div>
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
      return (
        <Badge variant="success" className="group-hover:animate-pulse flex items-center gap-1">
          <CheckCircle className="h-3.5 w-3.5" />
          已完成
        </Badge>
      );
    } else if (hasStarted) {
      return <Badge variant="warning" className="group-hover:scale-105 transition-transform">进行中</Badge>;
    } else {
      return <Badge variant="outline" className="group-hover:bg-gray-100 transition-colors">未开始</Badge>;
    }
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg 
        hover:bg-gray-50/70 transition-all duration-300 hover:shadow-md relative overflow-hidden"
    >
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1500 
        bg-gradient-to-r from-transparent via-white/10 to-transparent z-0 opacity-70"></div>
      
      <div className="space-y-2 mb-3 sm:mb-0 w-full sm:w-auto relative z-10">
        <h4 className="font-medium text-base group-hover:text-gray-800 transition-colors">
          {course.title}
        </h4>
        
        <div className="flex items-center gap-2 flex-wrap">
          {getStatusBadge()}
          
          <Badge variant="courseTag" className="group-hover:bg-gray-100 transition-colors">
            {course.category || "通用课程"}
          </Badge>
          
          <span className="text-sm text-muted-foreground flex items-center gap-1 group-hover:text-gray-700 transition-colors">
            <Clock className="h-3.5 w-3.5" />
            {Math.floor(Math.random() * 10) + 1}小时内容
          </span>
        </div>
        
        <div className="flex flex-col gap-1 w-full sm:max-w-xs">
          <div className="flex justify-between items-center text-xs">
            <span>学习进度</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="relative w-full h-2">
            {/* Background progress bar */}
            <Progress value={progress} className="h-2 transition-all duration-500 ease-out" />
            
            {/* Animated progress pill that shows on hover */}
            {progress > 0 && (
              <div 
                className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-300
                  opacity-0 group-hover:opacity-100 group-hover:animate-pulse"
                style={{ 
                  width: `${progress}%`, 
                  boxShadow: '0 0 8px rgba(var(--primary), 0.5)' 
                }}
              />
            )}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0 w-full sm:w-auto z-10">
        <Button 
          size="sm" 
          onClick={() => navigate(`/course-learn/${course.id}`)}
          className="flex-1 sm:flex-none transition-all duration-300 hover:scale-105 hover:shadow-md"
          variant={hasStarted ? "default" : "success"}
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
          className="flex-1 sm:flex-none transition-all duration-300 hover:scale-105 hover:shadow-md
            hover:bg-gray-100/80"
        >
          课程详情
        </Button>
      </div>
    </motion.div>
  );
};

// 生成示例课程数据
function getSampleCourses(): CourseNew[] {
  const courseTitles = [
    "JavaScript 高级编程技巧",
    "React 框架实战课程",
    "数据结构与算法入门",
    "Web前端性能优化指南",
    "Python 数据分析基础",
    "Node.js 服务端开发",
    "Vue.js 组件化开发",
    "TypeScript 项目实践",
    "微信小程序开发入门",
    "CSS3 动画与交互设计",
    "MongoDB 数据库开发",
    "React Native 移动应用开发"
  ];
  
  const categories = ["前端开发", "后端开发", "算法", "数据分析", "云计算", "移动开发", "UI设计", "数据库"];
  
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
