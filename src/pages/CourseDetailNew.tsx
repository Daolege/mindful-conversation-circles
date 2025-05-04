
import React, { Suspense, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCourseNewById } from '@/lib/services/courseNewService';
import { CourseDetailHeaderNew } from '@/components/course-detail-new/CourseDetailHeaderNew';
import { CourseDetailContentNew } from '@/components/course-detail-new/CourseDetailContentNew';
import { CourseEnrollCardNew } from '@/components/course-detail-new/CourseEnrollCardNew';
import { CourseBreadcrumb } from '@/components/course-detail-new/CourseBreadcrumb';
import { DetailPageSkeleton } from '@/components/course/DetailPageSkeleton';
import { CourseNotFound } from '@/components/course/CourseNotFound';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { CourseWithDetails } from '@/lib/types/course-new';

// Use the new course service to load course data
const CourseDetailNew = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const courseIdNum = parseInt(courseId || '0', 10);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // 强制每次访问页面时重新获取数据，使用新的 React Query v5 属性
  const { data: courseResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['course-new', courseIdNum],
    queryFn: () => getCourseNewById(courseIdNum),
    enabled: !!courseIdNum && !isNaN(courseIdNum),
    staleTime: 0, // 确保每次访问页面时都重新获取数据
    refetchOnWindowFocus: true, // 当窗口重获焦点时刷新数据
    refetchOnMount: 'always', // 修改为"always"，确保每次组件挂载时都刷新数据
    gcTime: 1000, // 替换 cacheTime，设置很短的垃圾回收时间，确保数据总是最新的
  });
  
  // Force smooth scrolling to top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Force data refetch when courseId changes or component mounts
    if (courseIdNum && !isNaN(courseIdNum)) {
      console.log(`[CourseDetailNew] 强制重新获取课程 ${courseIdNum} 数据`);
      refetch();
    }
  }, [courseId, courseIdNum, refetch]);

  // 直接访问 courseResponse.data 作为 CourseWithDetails
  const course = courseResponse?.data as CourseWithDetails | undefined;

  // Add enhanced debug logging
  useEffect(() => {
    if (course) {
      console.log('[CourseDetailNew] 课程数据加载成功:', course);
      console.log('[CourseDetailNew] 学习目标数据:', {
        length: course.learning_objectives?.length || 0,
        data: course.learning_objectives,
        isArray: Array.isArray(course.learning_objectives),
      });
      console.log('[CourseDetailNew] 课程要求数据:', {
        length: course.requirements?.length || 0,
        data: course.requirements,
        isArray: Array.isArray(course.requirements),
      });
      console.log('[CourseDetailNew] 适合人群数据:', {
        length: course.target_audience?.length || 0,
        data: course.target_audience,
        isArray: Array.isArray(course.target_audience),
      });
    }
    if (error) {
      console.error('[CourseDetailNew] 加载课程时出错:', error);
    }
  }, [course, error]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <DetailPageSkeleton />
        </div>
        <Footer />
      </>
    );
  }

  if (error || !course) {
    return (
      <>
        <Navbar />
        <CourseNotFound />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
        <CourseBreadcrumb course={course} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`${isMobile ? 'order-2' : 'order-1'} lg:col-span-2`}>
            <CourseDetailHeaderNew course={course} />
            <Suspense fallback={<div className="space-y-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>}>
              <CourseDetailContentNew course={course} />
            </Suspense>
          </div>
          <div className={`${isMobile ? 'order-1 mb-6' : 'order-2'} lg:col-span-1`}>
            <CourseEnrollCardNew course={course} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CourseDetailNew;
