
// Add this import
import { supabase } from '@/integrations/supabase/client';

/**
 * Debug function to identify issues with homework records
 */
export const debugHomeworkTable = async () => {
  try {
    // Check homework table structure
    const { data, error } = await supabase
      .from('homework')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('[homeworkService] Debug error querying homework:', error);
      return { 
        success: false, 
        error,
        count: 0
      };
    }
    
    // Debug info
    console.log('[homeworkService] Homework table contains:', data?.length, 'records (sample)');
    
    // Check for orphaned records
    let orphanedCount = 0;
    try {
      const { count, error: orphanError } = await supabase
        .from('homework')
        .select('*', { count: 'exact', head: true })
        .not('course_id', 'in', `(select id from courses_new)`);
        
      if (!orphanError && count !== null) {
        orphanedCount = count;
        console.log('[homeworkService] Found', orphanedCount, 'orphaned homework records');
      }
    } catch (err) {
      console.error('[homeworkService] Error checking orphaned records:', err);
    }
    
    return { 
      success: true, 
      count: data?.length || 0,
      orphanedCount,
      firstRecord: data && data.length > 0 ? {
        id: data[0].id,
        courseId: data[0].course_id,
        lectureId: data[0].lecture_id,
        type: data[0].type
      } : null
    };
  } catch (error) {
    console.error('[homeworkService] Debug error:', error);
    return { success: false, error };
  }
};

// Add function for new homework records
export const getHomeworksByLectureId = async (lectureId: string) => {
  try {
    console.log('[homeworkService] Getting homework for lecture:', lectureId);
    
    const { data, error } = await supabase
      .from('homework')
      .select('*')
      .eq('lecture_id', lectureId);
      
    if (error) {
      console.error('[homeworkService] Error getting homework:', error);
      return { data: [], error };
    }
    
    console.log('[homeworkService] Found', data?.length, 'homework records');
    return { data: data || [], error: null };
  } catch (error) {
    console.error('[homeworkService] Error in getHomeworksByLectureId:', error);
    return { data: [], error };
  }
};

// Save new or update existing homework
export const saveHomework = async (homeworkData: any) => {
  try {
    console.log('[homeworkService] Saving homework:', {
      id: homeworkData.id || 'new',
      title: homeworkData.title,
      courseId: homeworkData.course_id,
      lectureId: homeworkData.lecture_id
    });
    
    // Validate required fields
    if (!homeworkData.course_id || isNaN(Number(homeworkData.course_id))) {
      const error = new Error(`无效的课程ID: ${homeworkData.course_id}`);
      console.error('[homeworkService]', error.message);
      return { data: null, error };
    }
    
    if (!homeworkData.lecture_id) {
      const error = new Error('缺少课时ID');
      console.error('[homeworkService]', error.message);
      return { data: null, error };
    }
    
    // First verify course exists in courses_new
    const { data: courseExists, error: courseError } = await supabase
      .from('courses_new')
      .select('id')
      .eq('id', homeworkData.course_id)
      .maybeSingle();
      
    if (courseError || !courseExists) {
      const error = new Error(`课程ID ${homeworkData.course_id} 不存在于数据库`);
      console.error('[homeworkService]', error.message);
      return { data: null, error };
    }
    
    // Ensure the lecture_id exists in your system
    // This could be a future enhancement
    
    // Now save the homework
    const { data, error } = await supabase
      .from('homework')
      .upsert(homeworkData, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select();
      
    if (error) {
      console.error('[homeworkService] Error saving homework:', error);
      return { data: null, error };
    }
    
    console.log('[homeworkService] Homework saved successfully:', data);
    return { data: data?.[0] || null, error: null };
  } catch (error) {
    console.error('[homeworkService] Error in saveHomework:', error);
    return { data: null, error };
  }
};

// Delete homework by ID
export const deleteHomework = async (homeworkId: string) => {
  try {
    console.log('[homeworkService] Deleting homework:', homeworkId);
    
    const { error } = await supabase
      .from('homework')
      .delete()
      .eq('id', homeworkId);
      
    if (error) {
      console.error('[homeworkService] Error deleting homework:', error);
      return { success: false, error };
    }
    
    console.log('[homeworkService] Homework deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('[homeworkService] Error in deleteHomework:', error);
    return { success: false, error };
  }
};
