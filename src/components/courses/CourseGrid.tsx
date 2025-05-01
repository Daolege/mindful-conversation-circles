
import { useState } from "react";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/CourseCard";
import type { Course } from "@/lib/types/course";
import { Loader2 } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

interface CourseGridProps {
  courses: Course[];
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading?: boolean;
}

const CourseGrid = ({ courses, hasMore, onLoadMore, isLoading = false }: CourseGridProps) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { t } = useTranslations();

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
            style={{
              animationDelay: `${index * 100}ms`,
              opacity: 0,
              animation: `pulse 2s infinite, fade-in 0.5s forwards ${index * 100}ms`
            }}
          >
            <div className="h-48 bg-gray-200 relative overflow-hidden">
              <div className="absolute inset-0 skeleton-wave"></div>
            </div>
            <div className="p-5 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4 relative overflow-hidden">
                <div className="absolute inset-0 skeleton-wave"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full relative overflow-hidden">
                <div className="absolute inset-0 skeleton-wave"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-2/3 relative overflow-hidden">
                <div className="absolute inset-0 skeleton-wave"></div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="h-6 bg-gray-200 rounded w-1/4 relative overflow-hidden">
                  <div className="absolute inset-0 skeleton-wave"></div>
                </div>
                <div className="h-9 bg-gray-200 rounded w-1/3 relative overflow-hidden">
                  <div className="absolute inset-0 skeleton-wave"></div>
                </div>
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
      <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-12 text-center animate-in fade-in duration-500">
        <div className="mx-auto max-w-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('courses:noCourseInThisCategory')}</h3>
          <p className="text-gray-500 mb-6">{t('common:noContentFound')}</p>
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
        {courses.map((course, index) => (
          <div 
            key={course.id} 
            className="transition-all duration-500 hover:translate-y-[-5px] opacity-0"
            style={{
              animation: `fade-in 0.5s forwards ${index * 100}ms`
            }}
          >
            <CourseCard {...course} />
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-center mt-10 animate-in fade-in-50 duration-700 delay-300">
          <Button 
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="bg-knowledge-primary text-white hover:bg-knowledge-secondary shadow-sm transition-all duration-200 min-w-[150px]"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('actions:loading')}
              </>
            ) : (
              t('courses:loadMoreCourses')
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CourseGrid;
