import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CourseNew } from "@/lib/types/course-new";
import { Book, Play, CheckCircle, Globe, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";

export function SimpleCourseTab() {
  const navigate = useNavigate();
  const [courses] = useState<CourseNew[]>(getSampleCourses());
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslations();

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
        <h3 className="text-xl font-medium">{t('dashboard:myCourses')} <span className="text-muted-foreground text-sm">({courses.length})</span></h3>
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
          <h3 className="text-lg font-medium mb-2">{t('dashboard:noPurchasedCoursesYet')}</h3>
          <p className="text-muted-foreground mb-6">
            {t('dashboard:browseCoursesToStartLearning')}
          </p>
          
          <Button 
            onClick={() => navigate('/courses')} 
            className="min-w-[150px] hover:scale-105 transition-all duration-300 hover:shadow-lg"
          >
            {t('dashboard:browseCourses')}
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
  const { t } = useTranslations();
  
  // 随机判断是否已经开始学习
  const hasStarted = Math.random() > 0.5;
  const isCompleted = hasStarted && Math.random() > 0.7;
  
  // 获取状态标签
  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <Badge variant="courseTag" className="group-hover:bg-gray-100 transition-colors flex items-center gap-1">
          <CheckCircle className="h-3.5 w-3.5" />
          {t('dashboard:completed')}
        </Badge>
      );
    } else if (hasStarted) {
      return (
        <Badge variant="courseTag" className="group-hover:bg-gray-100 transition-colors">
          {t('dashboard:ongoing')}
        </Badge>
      );
    } else {
      return (
        <Badge variant="courseTag" className="group-hover:bg-gray-100 transition-colors">
          {t('dashboard:notStarted')}
        </Badge>
      );
    }
  };

  // 获取语言标签
  const getLanguageBadge = () => {
    const languages = ["chinese", "english", "japanese", "korean", "french", "german"];
    const randomLanguage = languages[Math.floor(Math.random() * languages.length)];
    
    return (
      <Badge variant="courseTag" className="group-hover:bg-gray-100 transition-colors flex items-center gap-1">
        <Globe className="h-3.5 w-3.5" />
        {t(`dashboard:${randomLanguage}`)}
      </Badge>
    );
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
          {getLanguageBadge()}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0 w-full sm:w-auto z-10">
        <Button 
          size="sm" 
          onClick={() => navigate(`/course-learn/${course.id}`)}
          className="flex-1 sm:flex-none transition-all duration-300 hover:scale-105 hover:shadow-md"
        >
          <Book className="h-4 w-4 mr-1" />
          {t('dashboard:startLearning')}
        </Button>
        
        <Button 
          size="sm"
          variant="outline"
          onClick={() => navigate(`/courses-new/${course.id}`)}
          className="flex-1 sm:flex-none transition-all duration-300 hover:scale-105 hover:shadow-md"
        >
          <Eye className="h-4 w-4 mr-1" />
          {t('dashboard:viewCourse')}
        </Button>
      </div>
    </motion.div>
  );
};

// Fixed sample course data function with all required properties
function getSampleCourses(): CourseNew[] {
  return [
    { 
      id: 1, 
      title: 'Advanced React Development', 
      price: 299, 
      status: 'published', 
      currency: 'USD', 
      display_order: 1, 
      is_featured: true,
      language: 'en'
    },
    { 
      id: 2, 
      title: 'Full Stack Development with Node.js', 
      price: 349, 
      status: 'published', 
      currency: 'USD', 
      display_order: 2, 
      is_featured: false,
      language: 'en'
    },
    { 
      id: 3, 
      title: 'Machine Learning Fundamentals', 
      price: 399, 
      status: 'published', 
      currency: 'USD', 
      display_order: 3, 
      is_featured: true,
      language: 'en'
    }
  ];
}
