
import { useState } from "react";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/CourseCard";
import type { Course } from "@/lib/types/course";
import { Loader2 } from "lucide-react";

interface CourseGridProps {
  courses: Course[];
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading?: boolean;
}

const CourseGrid = ({ courses, hasMore, onLoadMore, isLoading = false }: CourseGridProps) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    await onLoadMore();
    setIsLoadingMore(false);
  };

  // 骨架屏加载状态
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(null).map((_, index) => (
          <div 
            key={index} 
            className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-[360px] animate-pulse"
          >
            <div className="h-48 bg-gray-200"></div>
            <div className="p-5 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="flex justify-between items-center mt-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-9 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 无课程状态
  if (courses.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-12 text-center">
        <div className="mx-auto max-w-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无课程</h3>
          <p className="text-gray-500 mb-6">该分类下暂时没有课程，请查看其他分类或稍后再来</p>
          <img 
            src="/placeholder.svg" 
            alt="No courses" 
            className="mx-auto h-32 w-32 opacity-50 mb-4"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div 
            key={course.id} 
            className="transition-all duration-300 hover:translate-y-[-5px]"
          >
            <CourseCard {...course} />
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-center mt-10">
          <Button 
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="bg-knowledge-primary text-white hover:bg-knowledge-secondary shadow-sm transition-all duration-200 min-w-[150px]"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                加载中...
              </>
            ) : (
              "加载更多课程"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CourseGrid;
