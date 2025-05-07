
// Update this file to correctly handle the data structure for homework submissions

import { supabase } from "@/integrations/supabase/client";
import { Homework } from '@/lib/types/homework';

export interface HomeworkSubmission {
  id: string;
  homework_id: string;
  user_id: string;
  lecture_id: string;
  course_id: number;
  content?: string;
  answer?: string;
  file_url?: string;
  status: 'pending' | 'reviewed' | 'rejected';
  score?: number;
  feedback?: string;
  submitted_at: string;
  created_at?: string;
  reviewed_at?: string;
  user_name?: string;
  user_email?: string;
  homework?: {
    id: string;
    title: string;
    type: string;
    description?: string;
  };
}

export interface CourseSection {
  id: string;
  title: string;
  position: number;
  lectures: CourseLecture[];
}

export interface CourseLecture {
  id: string;
  title: string;
  position: number;
}

interface SubmissionWithUserDetails extends HomeworkSubmission {
  user_name: string;
  user_email: string;
}

export const getHomeworkSubmissionsByCourseId = async (courseId: number): Promise<HomeworkSubmission[]> => {
  try {
    const { data, error } = await supabase
      .from('homework_submissions')
      .select(`
        id,
        homework_id,
        user_id,
        lecture_id,
        course_id,
        content,
        answer,
        file_url,
        status,
        score,
        feedback,
        submitted_at,
        created_at,
        reviewed_at,
        profiles:user_id (
          email,
          full_name
        ),
        homework:homework_id (
          id,
          title,
          type,
          description
        )
      `)
      .eq('course_id', courseId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    // Transform data to include user information
    return data.map(item => ({
      ...item,
      user_name: item.profiles?.full_name || '未知用户',
      user_email: item.profiles?.email || ''
    }));
  } catch (error) {
    console.error('Error fetching homework submissions:', error);
    return [];
  }
};

export const getHomeworkSubmissionsByLectureId = async (lectureId: string): Promise<HomeworkSubmission[]> => {
  try {
    const { data, error } = await supabase
      .from('homework_submissions')
      .select(`
        id,
        homework_id,
        user_id,
        lecture_id,
        course_id,
        content,
        answer,
        file_url,
        status,
        score,
        feedback,
        submitted_at,
        created_at,
        reviewed_at,
        profiles:user_id (
          email,
          full_name
        ),
        homework:homework_id (
          id,
          title,
          type,
          description
        )
      `)
      .eq('lecture_id', lectureId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    return data.map(item => ({
      ...item,
      user_name: item.profiles?.full_name || '未知用户',
      user_email: item.profiles?.email || ''
    }));
  } catch (error) {
    console.error('Error fetching homework submissions by lecture:', error);
    return [];
  }
};

export const getHomeworkSubmissionsByStudentId = async (studentId: string, courseId?: number): Promise<HomeworkSubmission[]> => {
  try {
    let query = supabase
      .from('homework_submissions')
      .select(`
        id,
        homework_id,
        user_id,
        lecture_id,
        course_id,
        content,
        answer,
        file_url,
        status,
        score,
        feedback,
        submitted_at,
        created_at,
        reviewed_at,
        profiles:user_id (
          email,
          full_name
        ),
        homework:homework_id (
          id,
          title,
          type,
          description
        )
      `)
      .eq('user_id', studentId)
      .order('submitted_at', { ascending: false });
    
    // Add course filter if provided
    if (courseId) {
      query = query.eq('course_id', courseId);
    }
    
    const { data, error } = await query;

    if (error) throw error;

    return data.map(item => ({
      ...item,
      user_name: item.profiles?.full_name || '未知用户',
      user_email: item.profiles?.email || ''
    }));
  } catch (error) {
    console.error('Error fetching student homework submissions:', error);
    return [];
  }
};

export const getHomeworkSubmissionById = async (submissionId: string): Promise<SubmissionWithUserDetails> => {
  try {
    const { data, error } = await supabase
      .from('homework_submissions')
      .select(`
        id,
        homework_id,
        user_id,
        lecture_id,
        course_id,
        content,
        answer,
        file_url,
        status,
        score,
        feedback,
        submitted_at,
        created_at,
        reviewed_at,
        profiles:user_id (
          email,
          full_name
        ),
        homework:homework_id (
          id,
          title,
          type,
          description
        )
      `)
      .eq('id', submissionId)
      .single();

    if (error) throw error;

    return {
      ...data,
      user_name: data.profiles?.full_name || '未知用户',
      user_email: data.profiles?.email || ''
    };
  } catch (error) {
    console.error('Error fetching submission details:', error);
    throw error;
  }
};

export const getCourseStructureForHomework = async (courseId: number): Promise<CourseSection[]> => {
  try {
    const { data, error } = await supabase
      .from('course_sections')
      .select(`
        id, 
        title, 
        position,
        lectures:course_lectures(
          id,
          title,
          position
        )
      `)
      .eq('course_id', courseId)
      .order('position', { ascending: true });
    
    if (error) throw error;
    
    // Sort lectures within each section by position
    return data.map(section => ({
      ...section,
      lectures: section.lectures.sort((a, b) => a.position - b.position)
    })).sort((a, b) => a.position - b.position);
  } catch (error) {
    console.error('Error fetching course structure:', error);
    return [];
  }
};

export const getStudentsWithoutSubmission = async (lectureId: string, courseId: number): Promise<any[]> => {
  try {
    // First get all course enrollees
    const { data: enrollees, error: enrolleesError } = await supabase
      .from('user_courses')
      .select(`
        user_id,
        profiles:user_id (
          email,
          full_name
        )
      `)
      .eq('course_id', courseId);
    
    if (enrolleesError) throw enrolleesError;
    
    // Get all homework for this lecture
    const { data: homeworks, error: homeworkError } = await supabase
      .from('homework')
      .select('id')
      .eq('lecture_id', lectureId);
    
    if (homeworkError) throw homeworkError;
    
    // If there are no homeworks for this lecture, all students technically haven't submitted
    if (!homeworks || homeworks.length === 0) {
      return enrollees.map(enrollee => ({
        user_id: enrollee.user_id,
        user_name: enrollee.profiles?.full_name || '未知用户',
        user_email: enrollee.profiles?.email || ''
      }));
    }
    
    // Get all submissions for these homeworks
    const homeworkIds = homeworks.map(hw => hw.id);
    const { data: submissions, error: submissionsError } = await supabase
      .from('homework_submissions')
      .select('user_id')
      .in('homework_id', homeworkIds);
    
    if (submissionsError) throw submissionsError;
    
    // Find users who haven't submitted
    const submittedUserIds = submissions.map(sub => sub.user_id);
    const nonSubmitters = enrollees.filter(enrollee => 
      !submittedUserIds.includes(enrollee.user_id)
    );
    
    return nonSubmitters.map(enrollee => ({
      user_id: enrollee.user_id,
      user_name: enrollee.profiles?.full_name || '未知用户',
      user_email: enrollee.profiles?.email || ''
    }));
  } catch (error) {
    console.error('Error fetching students without submission:', error);
    return [];
  }
};

export const getHomeworkCompletionStats = async (courseId: number) => {
  try {
    // Get all lectures in the course
    const { data: lectures, error: lectureError } = await supabase
      .from('course_lectures')
      .select(`
        id,
        title,
        section_id,
        course_sections!inner (
          id,
          title,
          course_id
        )
      `)
      .eq('course_sections.course_id', courseId);
    
    if (lectureError) throw lectureError;
    
    // Get all homework submissions grouped by lecture
    const { data: submissions, error: submissionError } = await supabase
      .from('homework_submissions')
      .select('lecture_id, status')
      .eq('course_id', courseId);
    
    if (submissionError) throw submissionError;
    
    // Process stats by lecture
    const lectureStats = lectures.map(lecture => {
      const lectureSubmissions = submissions.filter(s => s.lecture_id === lecture.id);
      const totalSubmissions = lectureSubmissions.length;
      const reviewedSubmissions = lectureSubmissions.filter(s => s.status === 'reviewed').length;
      const pendingSubmissions = lectureSubmissions.filter(s => s.status === 'pending').length;
      const rejectedSubmissions = lectureSubmissions.filter(s => s.status === 'rejected').length;
      
      return {
        lecture_id: lecture.id,
        lecture_title: lecture.title,
        section_id: lecture.section_id,
        section_title: lecture.course_sections.title,
        total: totalSubmissions,
        reviewed: reviewedSubmissions,
        pending: pendingSubmissions,
        rejected: rejectedSubmissions,
        completion_rate: totalSubmissions > 0 
          ? (reviewedSubmissions / totalSubmissions * 100).toFixed(1) 
          : '0'
      };
    });
    
    // Get student count for the course
    const { count } = await supabase
      .from('user_courses')
      .select('user_id', { count: 'exact', head: true })
      .eq('course_id', courseId);
    
    const studentCount = count || 0;
    
    // Calculate overall stats
    const totalSubmissions = submissions.length;
    const reviewedSubmissions = submissions.filter(s => s.status === 'reviewed').length;
    const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;
    const rejectedSubmissions = submissions.filter(s => s.status === 'rejected').length;
    
    return {
      lectureStats,
      overallStats: {
        totalStudents: studentCount,
        totalSubmissions,
        reviewedSubmissions,
        pendingSubmissions,
        rejectedSubmissions,
        completionRate: totalSubmissions > 0 
          ? (reviewedSubmissions / totalSubmissions * 100).toFixed(1) 
          : '0'
      }
    };
  } catch (error) {
    console.error('Error fetching homework completion stats:', error);
    return {
      lectureStats: [],
      overallStats: {
        totalStudents: 0,
        totalSubmissions: 0,
        reviewedSubmissions: 0,
        pendingSubmissions: 0,
        rejectedSubmissions: 0,
        completionRate: '0'
      }
    };
  }
};

export const updateHomeworkFeedback = async (
  submissionId: string, 
  feedback: string, 
  status: 'pending' | 'reviewed' | 'rejected',
  score?: number
) => {
  try {
    const updateData: any = { 
      feedback, 
      status,
      reviewed_at: new Date().toISOString()
    };
    
    // Only include score if it's defined
    if (score !== undefined) {
      updateData.score = score;
    }
    
    const { error } = await supabase
      .from('homework_submissions')
      .update(updateData)
      .eq('id', submissionId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error updating homework feedback:', error);
    throw error;
  }
};

export const batchUpdateHomeworkFeedback = async (
  submissionIds: string[], 
  updateData: { status: 'pending' | 'reviewed' | 'rejected', feedback: string, score?: number }
) => {
  try {
    // Process in batches to avoid hitting limits
    const batchSize = 20;
    const batches = [];
    
    for (let i = 0; i < submissionIds.length; i += batchSize) {
      const batch = submissionIds.slice(i, i + batchSize);
      batches.push(batch);
    }
    
    const reviewedAt = new Date().toISOString();
    
    for (const batch of batches) {
      const { error } = await supabase
        .from('homework_submissions')
        .update({ 
          ...updateData,
          reviewed_at: reviewedAt
        })
        .in('id', batch);
      
      if (error) throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error batch updating homework feedback:', error);
    throw error;
  }
};
