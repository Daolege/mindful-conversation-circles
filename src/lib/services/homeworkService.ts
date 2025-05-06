
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

// 为了兼容性，保留旧的getHomeworksByLectureId名称
export async function getHomeworksByLectureId(
  lectureId: string,
  courseId: number
): Promise<{ success: boolean; data: Homework[]; error: Error | null }> {
  try {
    const data = await getHomeworkByLectureId(lectureId, courseId);
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error in getHomeworksByLectureId:', error);
    return { success: false, data: [], error: error as Error };
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

    // 确保course_id是必填的
    if (!submissionWithTimestamp.course_id) {
      throw new Error("Course ID is required for homework submission");
    }

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

// 添加缺失的submitHomework函数
export async function submitHomework(
  submission: {
    user_id: string;
    homework_id: string;
    lecture_id: string;
    course_id: number;
    answer?: string;
    file_url?: string;
  }
): Promise<boolean> {
  try {
    const result = await createHomeworkSubmission(submission);
    return result.error === null;
  } catch (error) {
    console.error('Error submitting homework:', error);
    return false;
  }
}

// 添加上传作业文件的函数
export async function uploadHomeworkFile(
  file: File,
  userId: string,
  homeworkId: string
): Promise<string | null> {
  try {
    // 创建唯一文件路径
    const filePath = `homework/${userId}/${homeworkId}/${file.name}`;
    
    // 上传文件
    const { data, error } = await supabase.storage
      .from('homework-files')
      .upload(filePath, file, {
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading homework file:', error);
      return null;
    }
    
    // 获取文件公共URL
    const { data: urlData } = await supabase.storage
      .from('homework-files')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadHomeworkFile:', error);
    return null;
  }
}

// 添加保存作业的函数
export async function saveHomework(
  homeworkData: Partial<Homework>
): Promise<{ data: Homework | null; error: Error | null }> {
  try {
    // 确保必填字段存在
    if (!homeworkData.lecture_id || !homeworkData.course_id || !homeworkData.title || !homeworkData.type) {
      throw new Error("Missing required homework fields");
    }
    
    // 如果有ID是更新，没有则创建
    if (homeworkData.id) {
      // 更新现有作业
      const { data, error } = await supabase
        .from('homework')
        .update(homeworkData)
        .eq('id', homeworkData.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating homework:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } else {
      // 创建新作业
      const { data, error } = await supabase
        .from('homework')
        .insert(homeworkData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating homework:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    }
  } catch (error) {
    console.error('Error in saveHomework:', error);
    return { data: null, error: error as Error };
  }
}

// 添加删除作业的函数
export async function deleteHomework(
  homeworkId: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // 删除作业
    const { error } = await supabase
      .from('homework')
      .delete()
      .eq('id', homeworkId);
    
    if (error) {
      console.error('Error deleting homework:', error);
      return { success: false, error };
    }
    
    // 同时删除相关的提交记录（可选）
    await supabase
      .from('homework_submissions')
      .delete()
      .eq('homework_id', homeworkId);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteHomework:', error);
    return { success: false, error: error as Error };
  }
}

// 添加调试用的函数
export async function debugHomeworkTable(): Promise<void> {
  try {
    // 检查homework表是否存在
    const { data: homeworks, error: homeworkError } = await supabase
      .from('homework')
      .select('count(*)')
      .limit(1);
    
    console.log('Homework table check:', homeworks ? 'OK' : 'Not found', homeworkError || '');
    
    // 检查homework_submissions表是否存在
    const { data: submissions, error: submissionError } = await supabase
      .from('homework_submissions')
      .select('count(*)')
      .limit(1);
    
    console.log('Homework submissions table check:', submissions ? 'OK' : 'Not found', submissionError || '');
    
  } catch (error) {
    console.error('Error debugging homework tables:', error);
  }
}
