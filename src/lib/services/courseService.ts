
import { supabase } from '@/integrations/supabase/client';

// Define specific return types to avoid infinite type instantiation
interface CourseData {
  id: number;
  title: string;
  description?: string;
  price?: number;
  status?: string;
  category?: string;
  created_at?: string;
  currency?: string;
  display_order?: number;
  enrollment_count?: number;
  is_featured?: boolean;
  lecture_count?: number;
  original_price?: number;
  instructor_id?: string;
  instructor_name?: string;
  published_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface CourseResponse<T> {
  data: T | null;
  error: Error | null;
}

// Add the getCourseById function
export const getCourseById = async (courseId: number): Promise<CourseResponse<CourseData>> => {
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
export const saveCourse = async (courseData: Partial<CourseData>): Promise<CourseResponse<CourseData>> => {
  try {
    // Ensure title exists when creating a new course
    if (!courseData.id && !courseData.title) {
      courseData.title = 'New Course'; // Default title for new courses
    }

    // Fix the type issue with upsert by ensuring courseData is properly typed
    const { data, error } = await supabase
      .from('courses_new')
      .upsert([courseData as any]) // Use array form to fix the typing issue
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

// Add the deleteCourse function
export const deleteCourse = async (courseId: number): Promise<{ success: boolean; error?: Error }> => {
  try {
    const { error } = await supabase
      .from('courses_new')
      .delete()
      .eq('id', courseId);
    
    if (error) {
      console.error('[courseService] Error deleting course:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (err) {
    console.error('[courseService] Unexpected error in deleteCourse:', err);
    return { success: false, error: err as Error };
  }
};

// Add the getCoursesByInstructorId function
export const getCoursesByInstructorId = async (instructorId: string): Promise<CourseResponse<CourseData[]>> => {
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
