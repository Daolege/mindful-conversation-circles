
// This is a simplified mock version since we don't have access to the actual file
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllCoursesNew } from '@/lib/services/courseNewService';
import { CourseData } from '@/lib/types/course-new';

const CourseManagementNew = () => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  
  const { data: coursesResponse, isLoading } = useQuery({
    queryKey: ['courses-new-management'],
    queryFn: getAllCoursesNew
  });
  
  useEffect(() => {
    if (coursesResponse && 'data' in coursesResponse && Array.isArray(coursesResponse.data)) {
      setCourses(coursesResponse.data);
    }
  }, [coursesResponse]);
  
  if (isLoading) {
    return <div>Loading courses...</div>;
  }
  
  return (
    <div>
      <h2>Course Management</h2>
      <div>
        {courses.map(course => (
          <div key={course.id}>{course.title}</div>
        ))}
      </div>
    </div>
  );
};

export default CourseManagementNew;
