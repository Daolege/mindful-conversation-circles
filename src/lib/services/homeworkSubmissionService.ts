
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// 获取课程的所有作业提交
export const getHomeworkSubmissionsByCourse = async (courseId: number) => {
  try {
    console.log('Fetching homework submissions for course:', courseId);
    
    const { data, error, count } = await supabase
      .from('homework_submissions')
      .select(`
        *,
        profiles:user_id (full_name, email),
        homework:homework_id (
          id,
          title,
          type,
          description,
          lecture_id
        )
      `, { count: 'exact' })
      .eq('course_id', courseId)
      .order('submitted_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching homework submissions:', error);
      return { data: null, error, count: 0 };
    }
    
    return { data, error: null, count: count || 0 };
  } catch (err: any) {
    console.error('Unexpected error fetching homework submissions:', err);
    return { data: null, error: err, count: 0 };
  }
};

// 获取特定课时的作业提交
export const getHomeworkSubmissionsByLecture = async (courseId: number, lectureId: string) => {
  try {
    console.log('Fetching homework submissions for lecture:', lectureId);
    
    const { data, error, count } = await supabase
      .from('homework_submissions')
      .select(`
        *,
        profiles:user_id (full_name, email),
        homework:homework_id (
          id,
          title,
          type,
          description
        )
      `, { count: 'exact' })
      .eq('course_id', courseId)
      .eq('lecture_id', lectureId)
      .order('submitted_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching lecture homework submissions:', error);
      return { data: null, error, count: 0 };
    }
    
    return { data, error: null, count: count || 0 };
  } catch (err: any) {
    console.error('Unexpected error fetching lecture homework submissions:', err);
    return { data: null, error: err, count: 0 };
  }
};

// 获取课程章节和课时结构
export const getCourseStructureForHomework = async (courseId: number) => {
  try {
    console.log('Fetching course structure for homework:', courseId);
    
    // 获取课程章节
    const { data: sections, error: sectionsError } = await supabase
      .from('course_sections')
      .select('*')
      .eq('course_id', courseId)
      .order('position', { ascending: true });
    
    if (sectionsError) {
      console.error('Error fetching course sections:', sectionsError);
      return { data: null, error: sectionsError };
    }
    
    // 如果没有章节，返回空数组
    if (!sections || sections.length === 0) {
      return { data: [], error: null };
    }
    
    // 获取每个章节的课时
    const sectionsWithLectures = await Promise.all(
      sections.map(async (section) => {
        const { data: lectures, error: lecturesError } = await supabase
          .from('course_lectures')
          .select('*')
          .eq('section_id', section.id)
          .order('position', { ascending: true });
        
        if (lecturesError) {
          console.error(`Error fetching lectures for section ${section.id}:`, lecturesError);
          return { ...section, lectures: [] };
        }
        
        // 获取每个课时的作业数量
        const lecturesWithHomeworkCount = await Promise.all(
          (lectures || []).map(async (lecture) => {
            // 获取课时作业定义数量
            const { count: homeworkCount, error: homeworkError } = await supabase
              .from('homework')
              .select('*', { count: 'exact', head: true })
              .eq('lecture_id', lecture.id);
            
            // 获取作业提交数量
            const { count: submissionCount, error: submissionError } = await supabase
              .from('homework_submissions')
              .select('*', { count: 'exact', head: true })
              .eq('lecture_id', lecture.id);
            
            if (homeworkError) {
              console.error(`Error counting homework for lecture ${lecture.id}:`, homeworkError);
            }
            
            if (submissionError) {
              console.error(`Error counting submissions for lecture ${lecture.id}:`, submissionError);
            }
            
            return {
              ...lecture,
              homework_count: homeworkCount || 0,
              submission_count: submissionCount || 0
            };
          })
        );
        
        return {
          ...section,
          lectures: lecturesWithHomeworkCount
        };
      })
    );
    
    return { data: sectionsWithLectures, error: null };
  } catch (err: any) {
    console.error('Unexpected error fetching course structure:', err);
    return { data: null, error: err };
  }
};

// 获取作业提交详情
export const getHomeworkSubmissionDetail = async (submissionId: string) => {
  try {
    const { data, error } = await supabase
      .from('homework_submissions')
      .select(`
        *,
        profiles:user_id (full_name, email),
        homework:homework_id (
          id,
          title,
          type,
          description,
          options
        )
      `)
      .eq('id', submissionId)
      .single();
    
    if (error) {
      console.error('Error fetching homework submission detail:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err: any) {
    console.error('Unexpected error fetching homework submission detail:', err);
    return { data: null, error: err };
  }
};

// 更新作业评分和反馈
export const updateHomeworkFeedback = async (
  submissionId: string,
  feedback: { 
    score?: number;
    comment?: string;
    status?: 'pending' | 'reviewed' | 'excellent' | 'needs_improvement';
  }
) => {
  try {
    const { data, error } = await supabase
      .from('homework_submissions')
      .update({
        score: feedback.score,
        teacher_comment: feedback.comment,
        status: feedback.status,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .select();
    
    if (error) {
      console.error('Error updating homework feedback:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err: any) {
    console.error('Unexpected error updating homework feedback:', err);
    return { data: null, error: err };
  }
};
