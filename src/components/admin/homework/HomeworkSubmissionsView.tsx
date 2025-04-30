
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { HomeworkSubmissionList } from './HomeworkSubmissionList';
import { CourseStructureNav } from './CourseStructureNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getCourseStructureForHomework,
  getHomeworkSubmissionsByCourseId,
  getHomeworkSubmissionsByLectureId,
  HomeworkSubmission
} from '@/lib/services/homeworkSubmissionService';

export const HomeworkSubmissionsView = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Convert courseId to number
  const courseIdNumber = courseId ? parseInt(courseId, 10) : 0;

  // Fetch course structure for navigation
  const { 
    data: sections, 
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
    setCurrentPage(1); // Reset to first page when switching lectures
  };

  // Handle view submission
  const handleViewSubmission = (id: string) => {
    navigate(`/admin/homework/submission/${id}`);
  };

  // Handle view all submissions
  const handleViewAll = () => {
    setSelectedLectureId(null);
    setCurrentPage(1);
  };

  // Calculate total submissions for pagination
  const currentSubmissions = selectedLectureId ? lectureSubmissions : allSubmissions;
  const totalSubmissions = currentSubmissions?.length || 0;

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Course Structure Navigation */}
      <div className="col-span-3">
        <CourseStructureNav 
          sections={sections || []}
          isLoading={isLoadingStructure}
          selectedLectureId={selectedLectureId}
          onLectureSelect={handleLectureSelect}
          onViewAll={handleViewAll}
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
              submissions={currentSubmissions || []}
              isLoading={selectedLectureId ? isLoadingLecture : isLoadingAll}
              filter="all"
              currentPage={currentPage}
              totalSubmissions={totalSubmissions}
              onPageChange={setCurrentPage}
              onViewSubmission={handleViewSubmission}
            />
          </TabsContent>
          
          <TabsContent value="pending">
            <HomeworkSubmissionList 
              submissions={currentSubmissions || []}
              isLoading={selectedLectureId ? isLoadingLecture : isLoadingAll}
              filter="pending"
              currentPage={currentPage}
              totalSubmissions={totalSubmissions}
              onPageChange={setCurrentPage}
              onViewSubmission={handleViewSubmission}
            />
          </TabsContent>
          
          <TabsContent value="reviewed">
            <HomeworkSubmissionList 
              submissions={currentSubmissions || []}
              isLoading={selectedLectureId ? isLoadingLecture : isLoadingAll}
              filter="reviewed"
              currentPage={currentPage}
              totalSubmissions={totalSubmissions}
              onPageChange={setCurrentPage}
              onViewSubmission={handleViewSubmission}
            />
          </TabsContent>
          
          <TabsContent value="rejected">
            <HomeworkSubmissionList 
              submissions={currentSubmissions || []}
              isLoading={selectedLectureId ? isLoadingLecture : isLoadingAll}
              filter="rejected"
              currentPage={currentPage}
              totalSubmissions={totalSubmissions}
              onPageChange={setCurrentPage}
              onViewSubmission={handleViewSubmission}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HomeworkSubmissionsView;
