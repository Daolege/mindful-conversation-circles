
import { supabase } from "@/integrations/supabase/client";
import { CourseData, CourseResponse, CourseWithSections } from "@/lib/types/course-new";

// Get course by ID 
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
    
    return { data: data as CourseData };
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
): Promise<CourseResponse> => {
  try {
    let query = supabase
      .from('courses')
      .select('*', { count: 'exact' });
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { 
      data: data as CourseData[],
      meta: {
        total: count || 0,
        page,
        limit
      }
    };
  } catch (error) {
    console.error("Error fetching courses:", error);
    return { error };
  }
};

// Get featured courses
export const getFeaturedCourses = async (limit = 6): Promise<CourseResponse> => {
  try {
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
    
    return { data: data as CourseData[] };
  } catch (error) {
    console.error("Error fetching featured courses:", error);
    return { error };
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
    // Process updates one by one to avoid type issues
    for (let i = 0; i < courseIds.length; i++) {
      const { error } = await supabase
        .from('courses')
        .update({ display_order: i })
        .eq('id', courseIds[i]);
        
      if (error) throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating course order:", error);
    return { success: false, error };
  }
};

// Save course (needed by CourseEditorContext.tsx)
export const saveCourse = async (courseData: any) => {
  try {
    const { id, ...courseFields } = courseData;
    
    let result;
    if (id) {
      // Update existing course
      const { data, error } = await supabase
        .from('courses')
        .update(courseFields)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Insert new course
      const { data, error } = await supabase
        .from('courses')
        .insert(courseFields)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    return { data: result, error: null };
  } catch (error) {
    console.error("Error saving course:", error);
    return { data: null, error };
  }
};
