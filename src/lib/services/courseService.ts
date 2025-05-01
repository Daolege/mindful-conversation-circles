
import { supabase } from '@/integrations/supabase/client';

// 定义返回类型接口，避免无限类型实例化
interface CourseResponse<T> {
  data: T | null;
  error: Error | null;
}

// Add the getCourseById function
export const getCourseById = async (courseId: number): Promise<CourseResponse<any>> => {
  try {
    const { data, error } = await supabase
      .from('courses_new')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (error) {
      console.error('[courseService] Error getting course by ID:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('[courseService] Unexpected error in getCourseById:', err);
    return { data: null, error: err as Error };
  }
};

// Add the saveCourse function
export const saveCourse = async (courseData: any): Promise<CourseResponse<any>> => {
  try {
    const { data, error } = await supabase
      .from('courses_new')
      .upsert(courseData, { onConflict: 'id' })
      .select()
      .single();
    
    if (error) {
      console.error('[courseService] Error saving course:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('[courseService] Unexpected error in saveCourse:', err);
    return { data: null, error: err as Error };
  }
};

// Add the getCoursesByInstructorId function (needed by instructorService)
export const getCoursesByInstructorId = async (instructorId: string): Promise<CourseResponse<any[]>> => {
  try {
    const { data, error } = await supabase
      .from('courses_new')
      .select('*')
      .eq('instructor_id', instructorId);
    
    if (error) {
      console.error('[courseService] Error getting courses by instructor ID:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('[courseService] Unexpected error in getCoursesByInstructorId:', err);
    return { data: null, error: err as Error };
  }
};

// Add this export for the updateCourseOrder function
export const updateCourseOrder = async (courseIds: number[]): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log('[courseService] Updating course display order:', courseIds);
    
    // Update each course with its new position
    const updatePromises = courseIds.map((courseId, index) => {
      return supabase
        .from('courses_new')
        .update({ display_order: index })
        .eq('id', courseId);
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    return { success: true };
  } catch (error) {
    console.error('[courseService] Error updating course order:', error);
    return { success: false, error };
  }
};
