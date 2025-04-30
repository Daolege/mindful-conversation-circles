
import { supabase } from '@/integrations/supabase/client';

// Define HomeworkSubmission type
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
  score?: number;
  user_name?: string;
  user_email?: string;
  user_avatar?: string;
  profiles?: {
    full_name?: string;
    email?: string;
  };
  homework?: {
    id: string;
    title: string;
    type: string;
  };
  answer?: string;
}

// Types for raw data from Supabase
interface RawSubmissionData {
  answer?: string;
  course_id: number;
  file_url: string;
  homework_id: string;
  id: string;
  lecture_id: string;
  submitted_at: string;
  user_id: string;
  users: any;
  feedback?: string;
  reviewed_at?: string;
  score?: number;
  status?: 'pending' | 'reviewed' | 'rejected';
  created_at?: string;
  [key: string]: any;
}

// Types
export interface SubmissionWithUserDetails extends HomeworkSubmission {
  user_name?: string;
  user_email?: string;
  user_avatar?: string;
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
  const submissions = (data as RawSubmissionData[]).map(submission => {
    const user = submission.users as any;
    return {
      ...submission,
      user_name: user?.name || 'Unknown User',
      user_email: user?.email || '',
      user_avatar: user?.avatar_url || '',
      status: submission.status || 'pending',
      created_at: submission.created_at || submission.submitted_at || new Date().toISOString()
    } as HomeworkSubmission;
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
  const submissions = (data as RawSubmissionData[]).map(submission => {
    const user = submission.users as any;
    return {
      ...submission,
      user_name: user?.name || 'Unknown User',
      user_email: user?.email || '',
      user_avatar: user?.avatar_url || '',
      status: submission.status || 'pending',
      created_at: submission.created_at || submission.submitted_at || new Date().toISOString()
    } as HomeworkSubmission;
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
    ...data as RawSubmissionData,
    user_name: user?.name || 'Unknown User',
    user_email: user?.email || '',
    user_avatar: user?.avatar_url || '',
    status: (data as any).status || 'pending',
    created_at: (data as any).created_at || data.submitted_at || new Date().toISOString()
  };

  return submission;
}

// Update homework feedback and status
export async function updateHomeworkFeedback(
  submissionId: string, 
  feedback: string, 
  status: 'pending' | 'reviewed' | 'rejected'
) {
  const updateData: Record<string, any> = {
    feedback,
    status,
    reviewed_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('homework_submissions')
    .update(updateData)
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
