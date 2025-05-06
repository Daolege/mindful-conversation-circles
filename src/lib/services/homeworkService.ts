
import { supabase } from '@/integrations/supabase/client';
import { Homework, HomeworkSubmission } from '@/lib/types/homework';

// Get homework for a specific lecture
export async function getHomeworkByLectureId(
  lectureId: string, 
  courseId: number
): Promise<Homework[]> {
  try {
    const { data, error } = await supabase
      .from('homework')
      .select('*')
      .eq('lecture_id', lectureId)
      .eq('course_id', courseId)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching homework:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching homework:', error);
    return [];
  }
}

// Get all homework submissions for a specific user and lecture
export async function getHomeworkSubmissionsByUserAndLecture(
  userId: string,
  lectureId: string,
  courseId: number
): Promise<HomeworkSubmission[]> {
  try {
    // 先获取该课时的所有作业ID
    const { data: homeworks, error: homeworkError } = await supabase
      .from('homework')
      .select('id')
      .eq('lecture_id', lectureId)
      .eq('course_id', courseId);

    if (homeworkError || !homeworks) {
      console.error('Error fetching homework IDs:', homeworkError);
      return [];
    }

    // 如果没有作业，直接返回空数组
    if (homeworks.length === 0) {
      return [];
    }

    // 获取该用户对这些作业的提交记录
    const homeworkIds = homeworks.map(hw => hw.id);
    
    const { data: submissions, error: submissionError } = await supabase
      .from('homework_submissions')
      .select('*')
      .eq('user_id', userId)
      .in('homework_id', homeworkIds);

    if (submissionError) {
      console.error('Error fetching homework submissions:', submissionError);
      return [];
    }

    return submissions || [];
  } catch (error) {
    console.error('Unexpected error fetching homework submissions:', error);
    return [];
  }
}

// Check if a user has completed all required homework for a lecture
export async function hasCompletedRequiredHomework(
  userId: string,
  lectureId: string
): Promise<boolean> {
  try {
    // 获取该讲座的所有必修作业
    const { data: requiredHomework, error: homeworkError } = await supabase
      .from('homework')
      .select('id')
      .eq('lecture_id', lectureId)
      .eq('is_required', true);

    if (homeworkError) {
      console.error('Error fetching required homework:', homeworkError);
      return false;
    }

    // 如果没有必修作业，则直接返回完成
    if (!requiredHomework || requiredHomework.length === 0) {
      return true;
    }

    // 获取用户对这些作业的提交记录
    const requiredHomeworkIds = requiredHomework.map(hw => hw.id);
    
    const { data: submissions, error: submissionError } = await supabase
      .from('homework_submissions')
      .select('homework_id')
      .eq('user_id', userId)
      .in('homework_id', requiredHomeworkIds);

    if (submissionError) {
      console.error('Error fetching homework submissions:', submissionError);
      return false;
    }

    // 检查是否所有必修作业都有提交记录
    const submittedHomeworkIds = new Set(submissions?.map(sub => sub.homework_id) || []);
    return requiredHomeworkIds.every(id => submittedHomeworkIds.has(id));
    
  } catch (error) {
    console.error('Error checking homework completion status:', error);
    return false;
  }
}

// Create a new homework submission
export async function createHomeworkSubmission(
  submission: Partial<HomeworkSubmission>
): Promise<{ data: HomeworkSubmission | null; error: Error | null }> {
  try {
    // 确保提交时间被记录
    const submissionWithTimestamp = {
      ...submission,
      submitted_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('homework_submissions')
      .insert(submissionWithTimestamp)
      .select()
      .single();

    if (error) {
      console.error('Error creating homework submission:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error creating homework submission:', error);
    return { data: null, error: error as Error };
  }
}
