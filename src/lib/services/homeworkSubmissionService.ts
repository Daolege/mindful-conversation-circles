
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
    .select('*, users:user_id(name, email, avatar_url), profiles:user_id(full_name, email), homework:homework_id(id, title, type)')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching homework submissions:', error);
    throw error;
  }

  // Transform data to include user details
  const submissions = (data as RawSubmissionData[]).map(submission => {
    const user = submission.users as any;
    const profile = submission.profiles as any;
    return {
      ...submission,
      user_name: profile?.full_name || user?.name || 'Unknown User',
      user_email: profile?.email || user?.email || '',
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
    .select('*, users:user_id(name, email, avatar_url), profiles:user_id(full_name, email), homework:homework_id(id, title, type)')
    .eq('lecture_id', lectureId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching homework submissions for lecture:', error);
    throw error;
  }

  // Transform data to include user details
  const submissions = (data as RawSubmissionData[]).map(submission => {
    const user = submission.users as any;
    const profile = submission.profiles as any;
    return {
      ...submission,
      user_name: profile?.full_name || user?.name || 'Unknown User',
      user_email: profile?.email || user?.email || '',
      user_avatar: user?.avatar_url || '',
      status: submission.status || 'pending',
      created_at: submission.created_at || submission.submitted_at || new Date().toISOString()
    } as HomeworkSubmission;
  });

  return submissions;
}

// Get submissions by student ID
export async function getHomeworkSubmissionsByStudentId(studentId: string, courseId?: number) {
  let query = supabase
    .from('homework_submissions')
    .select('*, users:user_id(name, email, avatar_url), profiles:user_id(full_name, email), homework:homework_id(id, title, type)')
    .eq('user_id', studentId)
    .order('created_at', { ascending: false });

  if (courseId) {
    query = query.eq('course_id', courseId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching homework submissions for student:', error);
    throw error;
  }

  // Transform data to include user details
  const submissions = (data as RawSubmissionData[]).map(submission => {
    const user = submission.users as any;
    const profile = submission.profiles as any;
    return {
      ...submission,
      user_name: profile?.full_name || user?.name || 'Unknown User',
      user_email: profile?.email || user?.email || '',
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
    .select('*, users:user_id(name, email, avatar_url), profiles:user_id(full_name, email), homework:homework_id(*)')
    .eq('id', submissionId)
    .single();

  if (error) {
    console.error('Error fetching homework submission:', error);
    throw error;
  }

  const user = data.users as any;
  const profile = data.profiles as any;
  const submission: SubmissionWithUserDetails = {
    ...data as RawSubmissionData,
    user_name: profile?.full_name || user?.name || 'Unknown User',
    user_email: profile?.email || user?.email || '',
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
  status: 'pending' | 'reviewed' | 'rejected',
  score?: number
) {
  const updateData: Record<string, any> = {
    feedback,
    status,
    reviewed_at: new Date().toISOString()
  };

  if (score !== undefined) {
    updateData.score = score;
  }

  const { data, error } = await supabase
    .from('homework_submissions')
    .update(updateData)
    .eq('id', submissionId)
    .select();

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
    .select('id, title, position, lectures:course_section_id(id, title, position, requires_homework_completion)')
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

// Get students who haven't submitted homework for a specific lecture
export async function getStudentsWithoutSubmission(lectureId: string, courseId: number, homeworkId?: string) {
  // First get all enrolled students
  const { data: enrolledStudents, error: enrolledError } = await supabase
    .from('user_courses')
    .select('user_id, profiles:user_id(full_name, email, avatar_url)')
    .eq('course_id', courseId);

  if (enrolledError) {
    console.error('Error fetching enrolled students:', enrolledError);
    throw enrolledError;
  }

  // Then get all students who have submitted
  let query = supabase
    .from('homework_submissions')
    .select('user_id')
    .eq('lecture_id', lectureId)
    .eq('course_id', courseId);

  if (homeworkId) {
    query = query.eq('homework_id', homeworkId);
  }

  const { data: submittedStudents, error: submittedError } = await query;

  if (submittedError) {
    console.error('Error fetching submitted students:', submittedError);
    throw submittedError;
  }

  // Create a set of submitted student IDs for quick lookup
  const submittedStudentIds = new Set(submittedStudents.map(s => s.user_id));

  // Filter to get students who haven't submitted
  const studentsWithoutSubmission = enrolledStudents.filter(
    student => !submittedStudentIds.has(student.user_id)
  ).map(student => {
    const profile = student.profiles as any;
    return {
      user_id: student.user_id,
      user_name: profile?.full_name || 'Unknown User',
      user_email: profile?.email || '',
      user_avatar: profile?.avatar_url || '',
    };
  });

  return studentsWithoutSubmission;
}

// Get completion statistics for a course
export async function getHomeworkCompletionStats(courseId: number) {
  // Get total number of enrolled students
  const { data: enrolledData, error: enrolledError } = await supabase
    .from('user_courses')
    .select('count', { count: 'exact' })
    .eq('course_id', courseId);

  if (enrolledError) {
    console.error('Error fetching enrolled students count:', enrolledError);
    throw enrolledError;
  }

  // Get homework submission stats
  const { data: stats, error: statsError } = await supabase
    .from('homework_submissions')
    .select('user_id, lecture_id, status')
    .eq('course_id', courseId);

  if (statsError) {
    console.error('Error fetching homework stats:', statsError);
    throw statsError;
  }

  // Get homework required by lecture
  const { data: homeworkData, error: homeworkError } = await supabase
    .from('homework')
    .select('lecture_id, id')
    .eq('course_id', courseId);

  if (homeworkError) {
    console.error('Error fetching homework data:', homeworkError);
    throw homeworkError;
  }

  // Calculate statistics
  const enrolledCount = enrolledData[0]?.count || 0;
  const uniqueSubmitters = new Set(stats.map(s => s.user_id)).size;
  const completionRate = enrolledCount > 0 ? (uniqueSubmitters / enrolledCount) * 100 : 0;
  
  const reviewedSubmissions = stats.filter(s => s.status === 'reviewed').length;
  const pendingSubmissions = stats.filter(s => s.status === 'pending').length;
  const rejectedSubmissions = stats.filter(s => s.status === 'rejected').length;

  // Group homework by lecture for counting
  const homeworkByLecture = homeworkData.reduce((acc: Record<string, number>, item) => {
    if (!acc[item.lecture_id]) {
      acc[item.lecture_id] = 0;
    }
    acc[item.lecture_id]++;
    return acc;
  }, {});

  // Group submissions by lecture and user to count completion
  const submissionsByLectureAndUser = stats.reduce((acc: Record<string, Set<string>>, item) => {
    if (!acc[item.lecture_id]) {
      acc[item.lecture_id] = new Set();
    }
    acc[item.lecture_id].add(item.user_id);
    return acc;
  }, {});

  // Calculate lecture completion stats
  const lectureCompletionStats = Object.keys(homeworkByLecture).map(lectureId => {
    const totalHomework = homeworkByLecture[lectureId];
    const uniqueSubmitters = submissionsByLectureAndUser[lectureId]?.size || 0;
    const completionRate = enrolledCount > 0 ? (uniqueSubmitters / enrolledCount) * 100 : 0;
    
    return {
      lecture_id: lectureId,
      total_homework: totalHomework,
      unique_submitters: uniqueSubmitters,
      completion_rate: completionRate
    };
  });

  return {
    total_enrolled: enrolledCount,
    unique_submitters: uniqueSubmitters,
    completion_rate: completionRate,
    reviewed_submissions: reviewedSubmissions,
    pending_submissions: pendingSubmissions,
    rejected_submissions: rejectedSubmissions,
    lecture_stats: lectureCompletionStats
  };
}

// Batch update homework feedback (for multiple submissions)
export async function batchUpdateHomeworkFeedback(
  submissionIds: string[],
  updates: { feedback?: string; status?: 'pending' | 'reviewed' | 'rejected'; score?: number }
) {
  if (submissionIds.length === 0) return [];

  const updateData: Record<string, any> = {
    reviewed_at: new Date().toISOString()
  };

  if (updates.feedback !== undefined) {
    updateData.feedback = updates.feedback;
  }

  if (updates.status !== undefined) {
    updateData.status = updates.status;
  }

  if (updates.score !== undefined) {
    updateData.score = updates.score;
  }

  const { data, error } = await supabase
    .from('homework_submissions')
    .update(updateData)
    .in('id', submissionIds)
    .select();

  if (error) {
    console.error('Error batch updating homework feedback:', error);
    throw error;
  }

  return data;
}
