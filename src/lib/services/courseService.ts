
import { supabase } from "@/integrations/supabase/client";
import { CourseData, CourseResponse } from "@/lib/types/course-new";

// Define a simpler type to avoid excessive type instantiation
type BasicCourseData = {
  id?: number;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  category?: string | null;
  display_order?: number;
  status?: string;
  featured?: boolean;
  thumbnail_url?: string;
  created_at?: string;
  updated_at?: string;
};

// Use more specific types to avoid deep instantiation issues
export const getCourses = async () => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
};

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

// Add the saveCourse function with simplified types
export const saveCourse = async (courseData: BasicCourseData): Promise<CourseResponse<CourseData>> => {
  try {
    // Ensure title exists when creating a new course
    if (!courseData.id && !courseData.title) {
      courseData.title = 'New Course'; // Default title for new courses
    }

    const { data, error } = await supabase
      .from('courses_new')
      .upsert([courseData])
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

// Fix insertCourse function to use a proper type
export const insertCourse = async (courseData: BasicCourseData) => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .insert(courseData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error inserting course:", error);
    throw error;
  }
};

// Fix updateMultipleCourses with correct types
export const updateMultipleCourses = async (coursesData: BasicCourseData[]) => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .upsert(coursesData)
      .select();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating multiple courses:", error);
    throw error;
  }
};

// Add getCourseNewById for the new system
export const getCourseNewById = async (courseId: number) => {
  try {
    const { data, error } = await supabase
      .from('courses_new')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (error) {
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};
