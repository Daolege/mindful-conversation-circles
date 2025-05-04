import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCourseById } from "@/lib/services/courseService";
import { CourseDetailHeader } from "@/components/course-detail/CourseDetailHeader";
import { CourseDetailContent } from "@/components/course-detail/CourseDetailContent";
import { CourseEnrollCard } from "@/components/course-detail/CourseEnrollCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CourseWithDetails } from "@/lib/types/course";
import React from 'react';

// Let's replace only the problematic section that has the type error
const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const courseIdNumber = Number(courseId);

  const { data: courseResponse, isLoading } = useQuery({
    queryKey: ['course', courseIdNumber],
    queryFn: () => getCourseById(courseIdNumber),
    enabled: !!courseIdNumber,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  });

  // Ensure we have a single course, not an array
  const course = courseResponse?.data && !Array.isArray(courseResponse.data) ? courseResponse.data : null;
  
  // Now we can safely access course.price
  const price = course?.price || 0;
  
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce" />
              <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
              <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
            </div>
            <p className="text-gray-600">加载课程信息中...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">课程未找到</h1>
            <p className="text-gray-600 mb-6">抱歉，您查找的课程不存在或已被移除。</p>
            <Link to="/courses">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                返回课程列表
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Fix the type conversion here
  const courseData = {
    ...course,
    price: course.price ?? 0  // Ensure price is always defined
  } as unknown as CourseWithDetails;

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CourseDetailHeader course={courseData} />
            <CourseDetailContent course={courseData} />
          </div>
          <div className="lg:col-span-1">
            <CourseEnrollCard course={courseData} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CourseDetail;
