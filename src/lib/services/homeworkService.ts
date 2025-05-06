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

// Alias for getHomeworkByLectureId for backward compatibility
export const getHomeworksByLectureId = getHomeworkByLectureId;

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

// Submit homework - Fixed type issues
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
    
    // Fix: Changed to directly insert an object, not an array
    const { error } = await supabase
      .from('homework_submissions')
      .insert({
        ...submission,
        submitted_at: new Date().toISOString()
      });
    
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

// Added missing function: Debug Homework Table
export const debugHomeworkTable = async (): Promise<void> => {
  try {
    console.log('[debugHomeworkTable] Running homework table diagnostics');
    // Call the fix_homework_constraints function if available
    const { error } = await supabase.rpc('fix_homework_constraints');
    
    if (error) {
      console.error('Error running homework table diagnostics:', error);
    } else {
      console.log('Homework table diagnostics completed successfully');
    }
  } catch (error) {
    console.error('Error in debugHomeworkTable:', error);
  }
};

// Added missing function: Save Homework
export interface HomeworkSaveResult {
  data?: Homework | null;
  error?: Error | null;
  success: boolean;
}

export const saveHomework = async (homeworkData: Partial<Homework>): Promise<HomeworkSaveResult> => {
  try {
    console.log('[saveHomework] Saving homework data:', homeworkData);
    
    if (!homeworkData.lecture_id || !homeworkData.course_id) {
      return {
        success: false,
        error: new Error('Missing required fields: lecture_id or course_id')
      };
    }
    
    // Ensure courseId is a number
    if (typeof homeworkData.course_id === 'string') {
      homeworkData.course_id = parseInt(homeworkData.course_id, 10);
    }
    
    let result;
    
    // If there's an ID, update existing homework
    if (homeworkData.id) {
      result = await supabase
        .from('homework')
        .update({
          ...homeworkData,
          updated_at: new Date().toISOString()
        })
        .eq('id', homeworkData.id)
        .select()
        .single();
    } else {
      // Otherwise insert new homework
      result = await supabase
        .from('homework')
        .insert({
          ...homeworkData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
    }
    
    if (result.error) {
      console.error('Error saving homework:', result.error);
      return {
        success: false,
        error: result.error
      };
    }
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Error in saveHomework:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error occurred')
    };
  }
};

// Added missing function: Delete Homework
export const deleteHomework = async (homeworkId: string): Promise<{success: boolean; error?: Error | null}> => {
  try {
    console.log('[deleteHomework] Deleting homework:', homeworkId);
    
    // Delete associated submissions first
    const { error: submissionsError } = await supabase
      .from('homework_submissions')
      .delete()
      .eq('homework_id', homeworkId);
    
    if (submissionsError) {
      console.warn('Error deleting homework submissions:', submissionsError);
      // Continue with deleting the homework anyway
    }
    
    // Now delete the homework
    const { error } = await supabase
      .from('homework')
      .delete()
      .eq('id', homeworkId);
    
    if (error) {
      console.error('Error deleting homework:', error);
      return {
        success: false,
        error
      };
    }
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error in deleteHomework:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error occurred')
    };
  }
};
