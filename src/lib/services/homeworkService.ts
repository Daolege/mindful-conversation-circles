
import { supabase } from '@/integrations/supabase/client';
import { Homework, HomeworkSubmission } from '@/lib/types/homework';
import { toast } from 'sonner';

// Get homework items by lecture ID
export const getHomeworkByLectureId = async (lectureId: string, courseId: number | string): Promise<Homework[]> => {
  try {
    console.log(`[getHomeworkByLectureId] Fetching homework for lecture: ${lectureId}, course: ${courseId}`);
    
    // Ensure courseId is a number
    const courseIdNum = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
    
    const { data, error } = await supabase
      .from('homework')
      .select('*')
      .eq('lecture_id', lectureId)
      .eq('course_id', courseIdNum)
      .order('position', { ascending: true });
    
    if (error) {
      console.error('Error fetching homework:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error(`Error in getHomeworkByLectureId:`, error);
    toast.error('获取作业信息失败');
    return [];
  }
};

// Get homework submissions by user and lecture
export const getHomeworkSubmissionsByUserAndLecture = async (
  userId: string, 
  lectureId: string,
  courseId: number | string
): Promise<HomeworkSubmission[]> => {
  try {
    // Ensure courseId is a number
    const courseIdNum = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
    
    const { data, error } = await supabase
      .from('homework_submissions')
      .select('*')
      .eq('user_id', userId)
      .eq('lecture_id', lectureId)
      .eq('course_id', courseIdNum);
    
    if (error) {
      console.error('Error fetching homework submissions:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getHomeworkSubmissionsByUserAndLecture:', error);
    toast.error('获取作业提交记录失败');
    return [];
  }
};

// Submit homework
export const submitHomework = async (submission: Partial<HomeworkSubmission>): Promise<boolean> => {
  try {
    // Validate required fields
    if (!submission.user_id || !submission.homework_id || !submission.lecture_id || !submission.course_id) {
      toast.error('提交作业缺少必要信息');
      return false;
    }

    // Ensure courseId is a number
    if (typeof submission.course_id === 'string') {
      submission.course_id = parseInt(submission.course_id, 10);
    }
    
    const { error } = await supabase
      .from('homework_submissions')
      .insert([{
        ...submission,
        submitted_at: new Date().toISOString()
      }]);
    
    if (error) {
      console.error('Error submitting homework:', error);
      toast.error('提交作业失败');
      return false;
    }
    
    toast.success('作业提交成功');
    return true;
  } catch (error) {
    console.error('Error in submitHomework:', error);
    toast.error('提交作业失败，请稍后重试');
    return false;
  }
};

// Check if user has completed all required homework for a lecture
export const hasCompletedRequiredHomework = async (
  userId: string,
  lectureId: string,
  courseId: number | string
): Promise<boolean> => {
  try {
    // Get all homework for this lecture
    const homeworkItems = await getHomeworkByLectureId(lectureId, courseId);
    if (homeworkItems.length === 0) return true;
    
    // Get all required homework
    const requiredHomework = homeworkItems.filter(hw => hw.is_required);
    if (requiredHomework.length === 0) return true;
    
    // Get user submissions
    const submissions = await getHomeworkSubmissionsByUserAndLecture(userId, lectureId, courseId);
    
    // Check if all required homework has submissions
    return requiredHomework.every(hw => 
      submissions.some(sub => sub.homework_id === hw.id)
    );
  } catch (error) {
    console.error('Error checking homework completion:', error);
    return false;
  }
};

// Upload homework file
export const uploadHomeworkFile = async (file: File, userId: string, homeworkId: string): Promise<string | null> => {
  try {
    // Create a unique file name using UUID
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${homeworkId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('homework-submissions')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      toast.error('文件上传失败');
      return null;
    }
    
    // Get the public URL
    const { data } = supabase.storage
      .from('homework-submissions')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadHomeworkFile:', error);
    toast.error('文件上传失败，请稍后重试');
    return null;
  }
};
