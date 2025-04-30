
import { Link } from "react-router-dom";
import { Star, Users, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/lib/types/course";

interface CourseGridItemProps {
  course: Course;
}

export default function CourseGridItem({ course }: CourseGridItemProps) {
  // Safely access nested properties with fallbacks
  const price = course.price || 0;
  const originalPrice = course.originalprice;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const hasDiscount = originalPrice && originalPrice > price;
  
  // Use consistent URL format for courses
  const courseUrl = `/courses-new/${course.id}`;
  
  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-all">
      <Link to={courseUrl}>
        <div className="relative h-44 w-full overflow-hidden">
          <img 
            src={course.imageurl || course.imageUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"} 
            alt={course.title} 
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {hasDiscount && (
            <Badge className="absolute top-2 right-2 bg-red-500 text-white">
              {discount}% 优惠
            </Badge>
          )}
          {course.featured && (
            <Badge variant="secondary" className="absolute bottom-2 left-2">
              精选课程
            </Badge>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-medium line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          
          <p className="text-sm text-gray-500 mb-2">
            {course.instructor}
          </p>
          
          <div className="flex items-center gap-1 text-sm mb-3">
            <div className="flex items-center text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="ml-1 font-medium">{course.rating || 0}</span>
            </div>
            <span className="text-gray-400">
              ({course.ratingCount || course.ratingcount || 0})
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                <span>{course.studentCount || course.studentcount || 0}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Layers className="h-4 w-4 mr-1" />
                <span>{course.lectures || 0}讲</span>
              </div>
            </div>
            
            <div className="flex items-center">
              {hasDiscount && (
                <span className="text-xs line-through text-gray-400 mr-1">
                  ¥{originalPrice}
                </span>
              )}
              <span className="text-lg font-bold text-primary">
                ¥{price}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
