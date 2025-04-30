
import { supabase } from '@/integrations/supabase/client';

// Define HomeworkSubmission type since it's not in course.ts
export interface HomeworkSubmission {
  id: string;
  user_id: string;
  course_id: number;
  lecture_id: string;
  homework_id: string;
  content?: string;
  file_url?: string;
  submitted_at: string;
  status: 'pending' | 'reviewed' | 'rejected';
  feedback?: string;
  created_at: string;
  reviewed_at?: string;
  profiles?: {
    full_name?: string;
    email?: string;
  };
  homework?: {
    id: string;
    title: string;
    type: string;
  };
}

// Types
export interface SubmissionWithUserDetails extends HomeworkSubmission {
  user_name?: string;
  user_avatar?: string;
  user_email?: string;
}

// Get homework submissions for a specific course
export async function getHomeworkSubmissionsByCourseId(courseId: number) {
  const { data, error } = await supabase
    .from('homework_submissions')
    .select('*, users:user_id(name, email, avatar_url)')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching homework submissions:', error);
    throw error;
  }

  // Transform data to include user details
  const submissions = data.map(submission => {
    const user = submission.users as any;
    return {
      ...submission,
      user_name: user?.name || 'Unknown User',
      user_email: user?.email || '',
      user_avatar: user?.avatar_url || ''
    };
  });

  return submissions;
}

// Get homework submissions by lecture ID
export async function getHomeworkSubmissionsByLectureId(lectureId: string) {
  const { data, error } = await supabase
    .from('homework_submissions')
    .select('*, users:user_id(name, email, avatar_url)')
    .eq('lecture_id', lectureId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching homework submissions for lecture:', error);
    throw error;
  }

  // Transform data to include user details
  const submissions = data.map(submission => {
    const user = submission.users as any;
    return {
      ...submission,
      user_name: user?.name || 'Unknown User',
      user_email: user?.email || '',
      user_avatar: user?.avatar_url || ''
    };
  });

  return submissions;
}

// Get detailed information for a single homework submission
export async function getHomeworkSubmissionById(submissionId: string) {
  const { data, error } = await supabase
    .from('homework_submissions')
    .select('*, users:user_id(name, email, avatar_url)')
    .eq('id', submissionId)
    .single();

  if (error) {
    console.error('Error fetching homework submission:', error);
    throw error;
  }

  const user = data.users as any;
  const submission: SubmissionWithUserDetails = {
    ...data,
    user_name: user?.name || 'Unknown User',
    user_email: user?.email || '',
    user_avatar: user?.avatar_url || ''
  };

  return submission;
}

// Update homework feedback and status
export async function updateHomeworkFeedback(
  submissionId: string, 
  feedback: string, 
  status: 'pending' | 'reviewed' | 'rejected'
) {
  const { data, error } = await supabase
    .from('homework_submissions')
    .update({
      feedback,
      status,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', submissionId);

  if (error) {
    console.error('Error updating homework feedback:', error);
    throw error;
  }

  return data;
}

// Get course structure for homework navigation
export async function getCourseStructureForHomework(courseId: number) {
  const { data: sections, error: sectionsError } = await supabase
    .from('course_sections')
    .select('id, title, position, lectures!course_section_id(id, title, position, requires_homework_completion)')
    .eq('course_id', courseId)
    .order('position');

  if (sectionsError) {
    console.error('Error fetching course sections for homework:', sectionsError);
    throw sectionsError;
  }

  // Sort lectures by position
  sections.forEach((section: any) => {
    if (section.lectures) {
      section.lectures = section.lectures
        .filter((lecture: any) => lecture.requires_homework_completion)
        .sort((a: any, b: any) => a.position - b.position);
    }
  });

  return sections;
}
