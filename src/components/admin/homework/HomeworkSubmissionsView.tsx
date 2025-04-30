
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { HomeworkSubmissionList } from './HomeworkSubmissionList';
import { CourseStructureNav } from './CourseStructureNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getCourseStructureForHomework,
  getHomeworkSubmissionsByCourseId,
  getHomeworkSubmissionsByLectureId
} from '@/lib/services/homeworkSubmissionService';

export const HomeworkSubmissionsView = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);

  // Convert courseId to number
  const courseIdNumber = courseId ? parseInt(courseId, 10) : 0;

  // Fetch course structure for navigation
  const { 
    data: courseStructure, 
    isLoading: isLoadingStructure 
  } = useQuery({
    queryKey: ['course-structure-homework', courseIdNumber],
    queryFn: () => getCourseStructureForHomework(courseIdNumber),
    enabled: !!courseIdNumber && courseIdNumber > 0,
  });

  // Fetch all submissions for the course
  const { 
    data: allSubmissions, 
    isLoading: isLoadingAll 
  } = useQuery({
    queryKey: ['homework-submissions-course', courseIdNumber],
    queryFn: () => getHomeworkSubmissionsByCourseId(courseIdNumber),
    enabled: !!courseIdNumber && courseIdNumber > 0,
  });

  // Fetch submissions for a specific lecture when selected
  const { 
    data: lectureSubmissions,
    isLoading: isLoadingLecture 
  } = useQuery({
    queryKey: ['homework-submissions-lecture', selectedLectureId],
    queryFn: () => getHomeworkSubmissionsByLectureId(selectedLectureId || ''),
    enabled: !!selectedLectureId,
  });

  // Handle lecture selection
  const handleLectureSelect = (lectureId: string) => {
    setSelectedLectureId(lectureId);
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Course Structure Navigation */}
      <div className="col-span-3">
        <CourseStructureNav 
          structure={courseStructure || []}
          isLoading={isLoadingStructure}
          selectedLectureId={selectedLectureId}
          onSelectLecture={handleLectureSelect}
        />
      </div>
      
      {/* Homework Submissions */}
      <div className="col-span-9">
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">所有作业</TabsTrigger>
            <TabsTrigger value="pending">待审核</TabsTrigger>
            <TabsTrigger value="reviewed">已通过</TabsTrigger>
            <TabsTrigger value="rejected">未通过</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <HomeworkSubmissionList 
              submissions={selectedLectureId ? lectureSubmissions : allSubmissions}
              isLoading={selectedLectureId ? isLoadingLecture : isLoadingAll}
              filter="all"
            />
          </TabsContent>
          
          <TabsContent value="pending">
            <HomeworkSubmissionList 
              submissions={selectedLectureId ? lectureSubmissions : allSubmissions}
              isLoading={selectedLectureId ? isLoadingLecture : isLoadingAll}
              filter="pending"
            />
          </TabsContent>
          
          <TabsContent value="reviewed">
            <HomeworkSubmissionList 
              submissions={selectedLectureId ? lectureSubmissions : allSubmissions}
              isLoading={selectedLectureId ? isLoadingLecture : isLoadingAll}
              filter="reviewed"
            />
          </TabsContent>
          
          <TabsContent value="rejected">
            <HomeworkSubmissionList 
              submissions={selectedLectureId ? lectureSubmissions : allSubmissions}
              isLoading={selectedLectureId ? isLoadingLecture : isLoadingAll}
              filter="rejected"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HomeworkSubmissionsView;
