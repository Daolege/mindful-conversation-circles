
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCourse } from "@/types/dashboard";
import { memo, useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Book, RefreshCcw, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/authHooks";
import { enrollUserInSampleCourses } from "@/lib/services/userEnrollmentService";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EnrolledCourseCard } from "./EnrolledCourseCard";
import { Link } from "react-router-dom";
import { PaginatedContent } from "./common/PaginatedContent";
import { motion } from "framer-motion";

const COURSES_PER_PAGE = 6;

interface EnrolledCoursesNewProps {
  coursesWithProgress: UserCourse[] | undefined;
  showAll?: boolean;
}

export const EnrolledCoursesNew = memo(({ 
  coursesWithProgress,
  showAll = false
}: EnrolledCoursesNewProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { user } = useAuth();
  
  const totalPages = coursesWithProgress ? Math.ceil(coursesWithProgress.length / COURSES_PER_PAGE) : 0;
  const displayCourses = coursesWithProgress?.slice(
    (currentPage - 1) * COURSES_PER_PAGE, 
    currentPage * COURSES_PER_PAGE
  );
  
  const handlePageChange = useCallback((page: number) => {
    setIsLoadingMore(true);
    // Simulate a small delay for smooth transition
    setTimeout(() => {
      setCurrentPage(page);
      setIsLoadingMore(false);
      // Scroll to top of the container
      document.querySelector('.enrolled-courses-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <Card className="shadow-md border-gray-200 hover:shadow-lg transition-all duration-300 enrolled-courses-container">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Book className="h-5 w-5 text-knowledge-primary" />
          我报名的课程
        </CardTitle>
        {(!displayCourses || displayCourses.length === 0) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateSampleData}
            className="flex items-center gap-2 hover:bg-knowledge-primary hover:text-white transition-all duration-200"
          >
            <RefreshCcw className="h-4 w-4" />
            <span>添加示例数据</span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          {displayCourses && displayCourses.length > 0 ? (
            <PaginatedContent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            >
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {displayCourses.map((item, index) => (
                  <EnrolledCourseCard 
                    key={item.course_id} 
                    course={item} 
                    index={index}
                  />
                ))}
              </motion.div>

              {!showAll && coursesWithProgress && coursesWithProgress.length > COURSES_PER_PAGE && (
                <div className="text-center pt-6">
                  <Link to="/dashboard?tab=courses">
                    <Button variant="outline" className="group hover:bg-knowledge-primary hover:text-white transition-all duration-200">
                      查看全部课程
                      <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:translate-y-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </PaginatedContent>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground mb-4">暂无报名课程</p>
              <p className="text-sm text-muted-foreground mb-6">您可以浏览课程列表，找到感兴趣的课程进行报名</p>
              <div className="flex justify-center gap-4">
                <Link to="/courses">
                  <Button variant="outline" className="hover:bg-knowledge-primary hover:text-white transition-all duration-200">
                    浏览全部课程
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
});

EnrolledCoursesNew.displayName = 'EnrolledCoursesNew';
