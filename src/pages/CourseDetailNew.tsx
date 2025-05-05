
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

// Lazy-load the EnrollCardMobile component
const EnrollCardMobile = React.lazy(() => import('@/components/course-detail-new/EnrollCardMobile'));

const CourseDetailNew = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const courseIdNum = parseInt(courseId || '0', 10);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course-new', courseIdNum],
    queryFn: () => getCourseNewById(courseIdNum),
    enabled: !!courseIdNum && !isNaN(courseIdNum),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Force smooth scrolling to top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [courseId]);

  // Enable feature flags if they don't exist
  useEffect(() => {
    if (!localStorage.getItem('enableProgressiveLoading')) {
      localStorage.setItem('enableProgressiveLoading', 'true');
    }
    
    if (!localStorage.getItem('enableMobileOptimizations')) {
      localStorage.setItem('enableMobileOptimizations', 'true');
    }
  }, []);

  const isProgressiveLoadingEnabled = localStorage.getItem('enableProgressiveLoading') === 'true';
  const isMobileOptimizationsEnabled = localStorage.getItem('enableMobileOptimizations') === 'true';

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

  if (error || !course?.data) {
    return (
      <>
        <Navbar />
        <CourseNotFound />
        <Footer />
      </>
    );
  }

  const courseData = course.data;

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
        <CourseBreadcrumb course={courseData} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`${isMobile ? 'order-2' : 'order-1'} lg:col-span-2`}>
            <CourseDetailHeaderNew course={courseData} />
            <CourseDetailContentNew course={courseData} />
          </div>
          
          <div className={`${isMobile ? 'hidden' : 'order-2 block'} lg:col-span-1`}>
            <CourseEnrollCardNew course={courseData} />
          </div>
        </div>
      </div>
      
      {/* Mobile-optimized fixed enrollment card at the bottom */}
      {isMobile && isMobileOptimizationsEnabled && (
        <Suspense fallback={null}>
          <EnrollCardMobile course={courseData} />
        </Suspense>
      )}
      
      {/* Add padding at bottom on mobile to account for the fixed enrollment card */}
      {isMobile && isMobileOptimizationsEnabled && (
        <div className="h-24 md:h-0"></div>
      )}
      
      <Footer />
    </>
  );
};

export default CourseDetailNew;
