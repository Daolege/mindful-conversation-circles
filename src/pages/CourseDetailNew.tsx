import React, { Suspense } from 'react';
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
      <div className="container mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-3 duration-1000">
        <CourseBreadcrumb course={courseData} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`${isMobile ? 'order-2' : 'order-1'} lg:col-span-2`}>
            <CourseDetailHeaderNew course={courseData} />
            <Suspense fallback={<div className="space-y-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse skeleton-wave"></div>
              ))}
            </div>}>
              <CourseDetailContentNew course={courseData} />
            </Suspense>
          </div>
          <div className={`${isMobile ? 'order-1 mb-6' : 'order-2'} lg:col-span-1`}>
            <CourseEnrollCardNew course={courseData} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CourseDetailNew;
