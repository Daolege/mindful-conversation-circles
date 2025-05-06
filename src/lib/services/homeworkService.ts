import { supabase } from '@/integrations/supabase/client';
import { Homework, HomeworkSubmission } from '@/lib/types/homework';
import { toast } from 'sonner';

// Get homework items by lecture ID
export const getHomeworkByLectureId = async (lectureId: string, courseId?: number | string): Promise<Homework[]> => {
  try {
    console.log(`[getHomeworkByLectureId] Fetching homework for lecture: ${lectureId}, course: ${courseId || 'not specified'}`);
    
    let query = supabase
      .from('homework')
      .select('*')
      .eq('lecture_id', lectureId);
    
    // Add course_id filter if provided
    if (courseId !== undefined) {
      // Ensure courseId is a number
      const courseIdNum = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
      query = query.eq('course_id', courseIdNum);
    }
    
    // Order by position
    query = query.order('position', { ascending: true });
    
    const { data, error } = await query;
    
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
export const getHomeworksByLectureId = async (lectureId: string, courseId?: number | string): Promise<Homework[] | { success: boolean; data: Homework[]; error: any }> => {
  try {
    // For backward compatibility, support both return formats
    const homeworks = await getHomeworkByLectureId(lectureId, courseId);
    
    // If the caller expects the old format with success/data/error, provide it
    if (typeof courseId === 'undefined') {
      return {
        success: true,
        data: homeworks,
        error: null
      };
    }
    
    // Otherwise return just the array
    return homeworks;
  } catch (error) {
    // If error and old format expected
    if (typeof courseId === 'undefined') {
      return {
        success: false,
        data: [],
        error
      };
    }
    // Otherwise just return empty array
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
    
    // Prepare a valid submission object with all required fields
    const validSubmission: {
      user_id: string;
      homework_id: string;
      lecture_id: string;
      course_id: number;
      answer?: string;
      file_url?: string;
      submitted_at?: string;
    } = {
      user_id: submission.user_id,
      homework_id: submission.homework_id,
      lecture_id: submission.lecture_id,
      course_id: submission.course_id,
    };
    
    // Add optional fields
    if (submission.answer) validSubmission.answer = submission.answer;
    if (submission.file_url) validSubmission.file_url = submission.file_url;
    
    // Add submission date
    validSubmission.submitted_at = new Date().toISOString();
    
    // Fix: Changed to directly insert an object, not an array
    const { error } = await supabase
      .from('homework_submissions')
      .insert(validSubmission);
    
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

// Added missing function: Save Homework - with improved position handling
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
    
    // 确定position值 - 改进的position分配逻辑
    let position = homeworkData.position;
    
    // 如果没有指定position，或者position无效，需要计算一个新值
    if (position === undefined || position <= 0) {
      try {
        // 获取同一讲座下的所有作业
        const { data: existingHomeworks } = await supabase
          .from('homework')
          .select('position')
          .eq('lecture_id', homeworkData.lecture_id)
          .order('position', { ascending: false });
        
        // 如果已有作业，position设为最大position + 1
        if (existingHomeworks && existingHomeworks.length > 0) {
          // 找出有效的最大position
          const validPositions = existingHomeworks
            .map(hw => typeof hw.position === 'number' ? hw.position : 0)
            .filter(pos => pos > 0);
          
          position = validPositions.length > 0 
            ? Math.max(...validPositions) + 1 
            : 1;
        } else {
          // 如果没有现有作业，position设为1
          position = 1;
        }
        
        console.log(`[saveHomework] 为新作业分配position值: ${position}`);
      } catch (error) {
        console.error('[saveHomework] Error calculating position:', error);
        // 如果计算失败，默认使用1
        position = 1;
      }
    }
    
    // Prepare a valid homework object with all required fields
    const validHomework: {
      lecture_id: string;
      course_id: number;
      title: string;
      type: string;
      id?: string;
      description?: string;
      options?: any;
      is_required?: boolean;
      position: number;
      image_url?: string;
    } = {
      lecture_id: homeworkData.lecture_id,
      course_id: homeworkData.course_id,
      title: homeworkData.title || '未命名作业',
      type: homeworkData.type || 'text',
      position: position
    };
    
    // Add optional fields if they exist
    if (homeworkData.id) validHomework.id = homeworkData.id;
    if (homeworkData.description) validHomework.description = homeworkData.description;
    if (homeworkData.options) validHomework.options = homeworkData.options;
    if (homeworkData.is_required !== undefined) validHomework.is_required = homeworkData.is_required;
    if (homeworkData.image_url) validHomework.image_url = homeworkData.image_url;
    
    let result;
    
    // If there's an ID, update existing homework
    if (homeworkData.id) {
      result = await supabase
        .from('homework')
        .update({
          ...validHomework,
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
          ...validHomework,
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
    
    // 保存成功后，尝试执行一次位置修复
    try {
      await debugHomeworkTable();
    } catch (fixError) {
      console.warn('[saveHomework] Error running homework debug after save:', fixError);
      // 不影响主流程的返回结果
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
