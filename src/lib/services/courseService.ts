
import { supabase } from '@/integrations/supabase/client';

// Add the getCourseById function
export const getCourseById = async (courseId: number) => {
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
    return { data: null, error: err };
  }
};

// Add the saveCourse function
export const saveCourse = async (courseData: any) => {
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
    return { data: null, error: err };
  }
};

// Add the getCoursesByInstructorId function (needed by instructorService)
export const getCoursesByInstructorId = async (instructorId: string) => {
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
    return { data: null, error: err };
  }
};

// Add this export for the updateCourseOrder function
export const updateCourseOrder = async (courseIds: number[]) => {
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
