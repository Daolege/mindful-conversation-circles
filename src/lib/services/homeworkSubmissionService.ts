import { supabase } from '@/integrations/supabase/client';
import { HomeworkSubmission } from '@/lib/types/homework';

export interface CourseSection {
  id: string;
  title: string;
  position: number;
  lectures: {
    id: string;
    title: string;
    position: number;
    requires_homework_completion: boolean;
  }[];
}

export interface HomeworkStats {
  enrolledStudents: number;
  totalSubmissions: number;
  homeworkLectures: number;
  recentSubmissions: number;
}

export const getHomeworkSubmissionById = async (id: string): Promise<HomeworkSubmission> => {
  const { data, error } = await supabase
    .from('homework_submissions')
    .select(`
      id,
      homework_id,
      user_id,
      lecture_id,
      course_id,
      answer,
      content,
      file_url,
      status,
      score,
      feedback,
      submitted_at,
      created_at,
      reviewed_at,
      homework:homework_id (
        id,
        title,
        description,
        type
      ),
      profiles:user_id (
        full_name,
        email
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  
  // Format the data to match our interface
  const submission: HomeworkSubmission = {
    id: data.id,
    homework_id: data.homework_id,
    user_id: data.user_id,
    lecture_id: data.lecture_id,
    course_id: data.course_id,
    answer: data.answer,
    content: data.content,
    file_url: data.file_url,
    status: (data.status as "pending" | "reviewed" | "rejected") || "pending",
    score: data.score,
    feedback: data.feedback,
    submitted_at: data.submitted_at,
    created_at: data.created_at,
    reviewed_at: data.reviewed_at,
    homework: data.homework,
    user_name: data.profiles?.full_name,
    user_email: data.profiles?.email
  };

  return submission;
};

export const updateHomeworkFeedback = async (
  id: string, 
  feedback: string, 
  status: 'pending' | 'reviewed' | 'rejected',
  score?: number 
): Promise<void> => {
  const updateData: any = {
    feedback,
    status,
    reviewed_at: new Date().toISOString()
  };

  if (typeof score === 'number') {
    updateData.score = score;
  }

  const { error } = await supabase
    .from('homework_submissions')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
};

export const getHomeworkSubmissionsByCourseId = async (courseId: number): Promise<HomeworkSubmission[]> => {
  const { data, error } = await supabase
    .from('homework_submissions')
    .select(`
      id,
      homework_id,
      user_id,
      lecture_id,
      course_id,
      status,
      created_at,
      profiles:user_id (
        full_name,
        email
      )
    `)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Transform the data to match our expected format
  return (data || []).map(item => ({
    id: item.id,
    homework_id: item.homework_id,
    user_id: item.user_id,
    lecture_id: item.lecture_id,
    course_id: item.course_id,
    created_at: item.created_at,
    user_name: item.profiles?.full_name || "用户名不详",
    user_email: item.profiles?.email || "",
    status: (item.status as "pending" | "reviewed" | "rejected") || "pending"
  }));
};

export const getHomeworkSubmissionsByLectureId = async (lectureId: string): Promise<HomeworkSubmission[]> => {
  const { data, error } = await supabase
    .from('homework_submissions')
    .select(`
      id,
      homework_id,
      user_id,
      lecture_id,
      course_id,
      status,
      created_at,
      profiles:user_id (
        full_name,
        email
      )
    `)
    .eq('lecture_id', lectureId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Transform the data to match our expected format
  return (data || []).map(item => ({
    id: item.id,
    homework_id: item.homework_id,
    user_id: item.user_id,
    lecture_id: item.lecture_id,
    course_id: item.course_id,
    created_at: item.created_at,
    user_name: item.profiles?.full_name || "用户名不详",
    user_email: item.profiles?.email || "",
    status: (item.status as "pending" | "reviewed" | "rejected") || "pending"
  }));
};

export const getHomeworkSubmissionsByStudentId = async (
  studentId: string, 
  courseId: number
): Promise<HomeworkSubmission[]> => {
  const { data, error } = await supabase
    .from('homework_submissions')
    .select(`
      id,
      homework_id,
      user_id,
      lecture_id,
      course_id,
      answer,
      content,
      file_url,
      status,
      score,
      feedback,
      submitted_at,
      created_at,
      homework:homework_id (
        id,
        title,
        description,
        type
      )
    `)
    .eq('user_id', studentId)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const { data: userData } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', studentId)
    .single();

  const userName = userData?.full_name || "用户名不详";
  const userEmail = userData?.email || "";

  // Transform the data to match our expected format
  return (data || []).map(item => ({
    id: item.id,
    homework_id: item.homework_id,
    user_id: item.user_id,
    lecture_id: item.lecture_id, 
    course_id: item.course_id,
    answer: item.answer,
    content: item.content,
    file_url: item.file_url,
    status: (item.status as "pending" | "reviewed" | "rejected") || "pending",
    score: item.score,
    feedback: item.feedback,
    submitted_at: item.submitted_at,
    created_at: item.created_at,
    homework: item.homework,
    user_name: userName,
    user_email: userEmail
  }));
};

export const getStudentsWithoutSubmission = async (
  lectureId: string, 
  courseId: number
): Promise<{ id: string; full_name: string; email: string }[]> => {
  // Get enrolled students
  const { data: enrolled, error: enrolledError } = await supabase
    .from('course_enrollments')
    .select('user_id')
    .eq('course_id', courseId);

  if (enrolledError) throw enrolledError;

  // Get students who submitted
  const { data: submitted, error: submittedError } = await supabase
    .from('homework_submissions')
    .select('user_id')
    .eq('lecture_id', lectureId)
    .eq('course_id', courseId);

  if (submittedError) throw submittedError;

  // Find students who did not submit
  const submittedIds = new Set((submitted || []).map(s => s.user_id));
  const notSubmittedIds = (enrolled || [])
    .filter(enrollment => !submittedIds.has(enrollment.user_id))
    .map(enrollment => enrollment.user_id);

  if (notSubmittedIds.length === 0) {
    return [];
  }

  // Get user profiles for non-submitted students
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', notSubmittedIds);

  if (profilesError) throw profilesError;

  return (profiles || []).map(profile => ({
    id: profile.id,
    full_name: profile.full_name || '用户名不详',
    email: profile.email || ''
  }));
};

export const getHomeworkCompletionStats = async (courseId: number): Promise<HomeworkStats> => {
  // Get total enrolled students
  const { count: enrolledCount } = await supabase
    .from('course_enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);

  // Get total submissions
  const { count: submissionsCount } = await supabase
    .from('homework_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);

  // Get lectures that require homework
  const { data: lecturesData } = await supabase
    .from('course_lectures')
    .select('id')
    .eq('requires_homework_completion', true)
    .order('id');

  const lecturesCount = lecturesData?.length || 0;

  // Get recent submissions (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { count: recentCount } = await supabase
    .from('homework_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId)
    .gte('created_at', sevenDaysAgo.toISOString());

  return {
    enrolledStudents: enrolledCount || 0,
    totalSubmissions: submissionsCount || 0,
    homeworkLectures: lecturesCount,
    recentSubmissions: recentCount || 0
  };
};

export const batchUpdateHomeworkFeedback = async (
  submissionIds: string[],
  update: { status: 'reviewed' | 'rejected'; feedback: string; score?: number }
): Promise<void> => {
  const updateData: any = {
    status: update.status,
    feedback: update.feedback,
    reviewed_at: new Date().toISOString()
  };

  if (typeof update.score === 'number') {
    updateData.score = update.score;
  }

  const { error } = await supabase
    .from('homework_submissions')
    .update(updateData)
    .in('id', submissionIds);

  if (error) throw error;
};

export const getCourseStructureForHomework = async (courseId: number): Promise<CourseSection[]> => {
  const { data, error } = await supabase
    .from('course_sections')
    .select(`
      id,
      title,
      position,
      course_lectures (
        id,
        title,
        position,
        requires_homework_completion
      )
    `)
    .eq('course_id', courseId)
    .order('position', { ascending: true });

  if (error) throw error;

  return data.map(section => ({
    ...section,
    lectures: (section.course_lectures || []).map(lecture => ({
      ...lecture,
      requires_homework_completion: lecture.requires_homework_completion || false
    }))
  }));
};
