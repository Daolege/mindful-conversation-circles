
import { Link } from "react-router-dom";
import { ChevronRight, Users, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/lib/types/course";

interface CourseDetailHeaderProps {
  course: Course;
}

export function CourseDetailHeader({ course }: CourseDetailHeaderProps) {
  return (
    <div className="bg-gradient-to-b from-gray-100 to-white border-b">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center text-sm text-gray-600 mb-8 fade-in">
          <Link to="/" className="hover:text-gray-900 transition-colors">首页</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link to="/courses" className="hover:text-gray-900 transition-colors">全部课程</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-900 font-medium">{course.title}</span>
        </div>
        
        <div className="max-w-4xl space-y-6 slide-up">
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">{course.title}</h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">{course.description}</p>
          
          <div className="flex flex-wrap gap-3">
            <Badge 
              variant="outline" 
              className="rounded-10 px-4 py-2 text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <Users className="h-4 w-4 text-gray-600" />
              <span>{course.studentcount || course.studentCount || 0} 名学员</span>
            </Badge>
            
            <Badge 
              variant="outline" 
              className="rounded-10 px-4 py-2 text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <Layers className="h-4 w-4 text-gray-600" />
              <span>{course.lectures || 0} 章节</span>
            </Badge>

            <Badge 
              variant="outline" 
              className="rounded-10 px-4 py-2 text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-all"
            >
              {course.category || "在线课程"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
