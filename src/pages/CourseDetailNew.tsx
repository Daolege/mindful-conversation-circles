
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCourseNewById } from '@/lib/services/courseNewService';
import { CourseDetailHeaderNew } from '@/components/course-detail-new/CourseDetailHeaderNew';
import { CourseDetailContentNew } from '@/components/course-detail-new/CourseDetailContentNew';
import { CourseEnrollCardNew } from '@/components/course-detail-new/CourseEnrollCardNew';
import { CourseLoadingState } from '@/components/course/CourseLoadingState';
import { CourseNotFound } from '@/components/course/CourseNotFound';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CourseDetailNew = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const courseIdNum = parseInt(courseId || '0', 10);

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course-new', courseIdNum],
    queryFn: () => getCourseNewById(courseIdNum),
    enabled: !!courseIdNum && !isNaN(courseIdNum),
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <CourseLoadingState />
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
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CourseDetailHeaderNew course={courseData} />
            <CourseDetailContentNew course={courseData} />
          </div>
          <div className="lg:col-span-1">
            <CourseEnrollCardNew course={courseData} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CourseDetailNew;
