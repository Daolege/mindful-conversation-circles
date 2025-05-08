
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { StudentHomeworkList } from '@/components/admin/homework/StudentHomeworkList';
import { supabase } from '@/integrations/supabase/client';
import { HomeworkSubmission } from '@/lib/types/homework';

export const StudentHomeworkPage = () => {
  const { studentId, courseId: courseIdParam } = useParams<{ studentId: string, courseId: string }>();
  const navigate = useNavigate();
  
  // Convert courseId from string to number
  const courseId = courseIdParam ? parseInt(courseIdParam, 10) : 0;
  
  // Get student information
  const { data: studentData, isLoading: loadingStudent } = useQuery({
    queryKey: ['student', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', studentId)
        .single();
      
      if (error) {
        console.error('Error fetching student:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!studentId,
  });
  
  // Get all homework submissions for this student
  const { data: submissions, isLoading: loadingSubmissions } = useQuery({
    queryKey: ['student-submissions', studentId, courseId],
    queryFn: async () => {
      if (!studentId || !courseId) return [];
      
      const { data, error } = await supabase
        .from('homework_submissions')
        .select(`
          id,
          homework_id,
          lecture_id,
          user_id,
          answer, 
          score,
          status,
          feedback,
          file_url,
          created_at,
          submitted_at,
          homework:homework_id (
            id,
            title,
            description,
            position
          )
        `)
        .eq('user_id', studentId)
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching student submissions:', error);
        return [];
      }
      
      // Map the data to include content field for backward compatibility
      const transformedData = data.map((submission: any) => {
        return {
          id: submission.id,
          homework_id: submission.homework_id,
          lecture_id: submission.lecture_id,
          user_id: submission.user_id,
          answer: submission.answer,
          content: submission.answer, // Map answer to content for backward compatibility
          score: submission.score,
          status: submission.status,
          feedback: submission.feedback,
          file_url: submission.file_url,
          created_at: submission.created_at,
          submitted_at: submission.submitted_at,
          homework: submission.homework
        };
      });
      
      return transformedData as HomeworkSubmission[];
    },
    enabled: !!studentId && !!courseId,
  });
  
  // Function to view a specific submission
  const handleViewSubmission = (submissionId: string) => {
    navigate(`/admin/homework/submission/${submissionId}`);
  };
  
  // Function to export a submission as PDF
  const handleExportPdf = (id: string) => {
    // Implement PDF export functionality
    console.log('Export submission to PDF:', id);
  };
  
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline flex items-center"
        >
          ← 返回
        </button>
      </div>
      
      <StudentHomeworkList 
        studentId={studentId || ''}
        courseId={courseId}
        studentName={studentData?.full_name || ''}
        studentEmail={studentData?.email || ''}
        submissions={submissions || []}
        isLoading={loadingStudent || loadingSubmissions}
        onViewSubmission={handleViewSubmission}
        onExportPdf={handleExportPdf}
      />
    </div>
  );
};

export default StudentHomeworkPage;
