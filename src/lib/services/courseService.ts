
import { supabase } from "@/integrations/supabase/client";
import { CourseData, CourseResponse } from "@/lib/types/course-new";
import { selectFromTable } from "@/lib/services/typeSafeSupabase";

// Simplified interface to avoid deep type instantiations
export interface SimpleCourseData {
  id: number;
  title: string;
  description?: string;
  price?: number;
  original_price?: number;
  status?: string;
  category?: string;
  language?: string;
  thumbnail_url?: string;
  is_featured?: boolean;
  display_order?: number;
  created_at?: string;
}

// Simplified interface to avoid deep type instantiations
export interface CourseWithSections {
  id: number;
  title: string;
  description?: string;
  sections?: Array<{
    id: string;
    title: string;
    lectures?: Array<{
      id: string;
      title: string;
      is_free?: boolean;
    }>;
  }>;
}

// Get course by ID - Fix type conversion issue
export const getCourseById = async (courseId: number): Promise<CourseResponse> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        sections(*)
      `)
      .eq('id', courseId)
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Use proper type assertion with as unknown as CourseData
    return { data: data as unknown as CourseData };
  } catch (error) {
    console.error("Error fetching course:", error);
    return { error };
  }
};

// Get all courses with pagination
export const getCourses = async (
  page = 1, 
  limit = 10,
  category?: string,
  search?: string
): Promise<{ data: SimpleCourseData[]; meta?: { total: number; page: number; limit: number } }> => {
  try {
    let query = supabase
      .from('courses')
      .select('*', { count: 'exact' });
    
    // Apply filters conditionally
    if (category) {
      query = query.eq('category', category);
    }
    
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }
    
    // Apply ordering and pagination
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { 
      data: data as SimpleCourseData[],
      meta: {
        total: count || 0,
        page,
        limit
      }
    };
  } catch (error) {
    console.error("Error fetching courses:", error);
    return { data: [] };
  }
};

// Get featured courses
export const getFeaturedCourses = async (limit = 6): Promise<{ data: SimpleCourseData[] }> => {
  try {
    // Fixed version without complex type definition
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_featured', true)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { data: data as SimpleCourseData[] };
  } catch (error) {
    console.error("Error fetching featured courses:", error);
    return { data: [] };
  }
};

// Get courses by instructor ID (needed by CourseManagement.tsx)
export const getCoursesByInstructorId = async (instructorId: string) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('instructor', instructorId)
      .order('display_order', { ascending: true });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    return { data: null, error };
  }
};

// Delete course (needed by CourseManagement.tsx)
export const deleteCourse = async (courseId: number) => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting course:", error);
    return { success: false, error };
  }
};

// Update course order (needed by CourseManagement.tsx)
export const updateCourseOrder = async (courseIds: number[]) => {
  try {
    for (let i = 0; i < courseIds.length; i++) {
      const { error: updateError } = await supabase
        .from('courses')
        .update({ display_order: i })
        .eq('id', courseIds[i]);
      
      if (updateError) {
        throw updateError;
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating course order:", error);
    return { success: false, error };
  }
};

// Simplify SaveCourseData interface to prevent excessive type instantiation
interface SaveCourseData {
  id?: number; 
  title: string;
  price?: number;
  original_price?: number;
  description?: string;
  language?: string;
  display_order?: number;
  is_featured?: boolean;
  category?: string;
  status?: string;
  currency?: string;
  thumbnail_url?: string;
  instructor_id?: string;
}

// Fix the saveCourse function to handle types properly
export const saveCourse = async (courseData: SaveCourseData) => {
  try {
    const { id, ...courseFields } = courseData;
    let result;
    
    // Ensure required fields are present
    if (!courseFields.title) {
      throw new Error("Course title is required");
    }
    
    if (id) {
      result = await supabase
        .from('courses_new')
        .update(courseFields)
        .eq('id', id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('courses_new')
        .insert([courseFields]) // Pass as array with single object to satisfy Supabase's typing
        .select()
        .single();
    }
    
    if (result.error) throw result.error;
    return { data: result.data, error: null };
  } catch (error) {
    console.error("Error saving course:", error);
    return { data: null, error };
  }
};
