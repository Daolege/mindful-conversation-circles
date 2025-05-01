
import { useCallback } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Languages, Book, Calendar, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { UserCourse } from "@/types/dashboard";

interface EnrolledCourseCardProps {
  course: UserCourse;
  index: number;
}

export const EnrolledCourseCard = ({ course, index }: EnrolledCourseCardProps) => {
  const getRandomDuration = useCallback(() => {
    return 0.3 + (index % 3) * 0.1;
  }, [index]);
  
  const getRandomDelay = useCallback(() => {
    return 0.1 + (index % 5) * 0.05;
  }, [index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: getRandomDuration(), 
        delay: getRandomDelay(),
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -8, 
        transition: { duration: 0.2 } 
      }}
      className="h-full"
    >
      <Link to={`/courses/${course.course_id}`} className="block h-full">
        <Card className="h-full border p-5 rounded-xl transition-all duration-300 hover:shadow-xl hover:border-knowledge-primary/30 bg-white/80 backdrop-blur-md relative overflow-hidden group">
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-knowledge-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Top right decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-knowledge-primary/10 to-transparent rounded-bl-[100px] transform translate-x-8 -translate-y-8 group-hover:translate-x-6 group-hover:-translate-y-6 transition-all duration-500"></div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-knowledge-primary transition-colors duration-300 line-clamp-2">{course.courses.title}</h3>
            
            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-knowledge-primary/70" />
                <span>授课语言: 中文</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Book className="h-4 w-4 text-knowledge-primary/70" />
                <span>{course.courses.syllabus?.length || 0} 章节</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-knowledge-primary/70" />
                <span>报名时间: {format(new Date(course.purchased_at), 'yyyy-MM-dd')}</span>
              </div>
            </div>
            
            {course.course_progress && course.course_progress.length > 0 && (
              <div className="mt-4">
                <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${course.course_progress[0]?.progress_percent || 0}%` }}
                    transition={{ duration: 1, delay: getRandomDelay() + 0.3 }}
                    className="absolute h-full bg-gradient-to-r from-knowledge-primary to-knowledge-secondary"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <div>进度: {course.course_progress[0]?.progress_percent || 0}%</div>
                  <div className="flex items-center gap-1 text-knowledge-primary group-hover:translate-x-1 transition-transform duration-300">
                    继续学习 <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Bottom left decoration */}
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-knowledge-primary/10 to-transparent rounded-tr-[100px] transform -translate-x-8 translate-y-8 group-hover:-translate-x-6 group-hover:translate-y-6 transition-all duration-500"></div>
        </Card>
      </Link>
    </motion.div>
  );
};
