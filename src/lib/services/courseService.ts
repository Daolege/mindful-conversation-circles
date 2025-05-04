
import { supabase } from "@/integrations/supabase/client";
import { CourseData, CourseResponse, CourseWithSections } from "@/lib/types/course-new";
import { selectFromTable } from "@/lib/services/typeSafeSupabase";

// Get course by ID 
export const getCourseById = async (courseId: number): Promise<CourseResponse> => {
  try {
    // Use a more direct approach to reduce type complexity
    const result = await supabase
      .from('courses')
      .select(`
        *,
        sections(*)
      `)
      .eq('id', courseId)
      .single();
    
    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return { data: result.data as CourseData };
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
    // Avoid complex chaining that causes TypeScript issues
    let data = null;
    let count = null;
    let error = null;

    // Apply filters with simple conditional blocks
    if (category) {
      const result = await supabase
        .from('courses')
        .select('*', { count: 'exact' })
        .eq('category', category)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
      
      data = result.data;
      count = result.count;
      error = result.error;
    } 
    else if (search) {
      const result = await supabase
        .from('courses')
        .select('*', { count: 'exact' })
        .ilike('title', `%${search}%`)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
      
      data = result.data;
      count = result.count;
      error = result.error;
    }
    else {
      // No filters, execute a simple query
      const result = await supabase
        .from('courses')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
      
      data = result.data;
      count = result.count;
      error = result.error;
    }
    
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
    // Break down the query into separate steps to avoid deep type instantiation
    const query = supabase.from('courses');
    
    // Step 1: Basic select
    const selectQuery = query.select('*');
    
    // Step 2: Add filters one by one
    const filteredQuery = selectQuery
      .eq('is_featured', true)
      .eq('status', 'published');
    
    // Step 3: Add ordering
    const orderedQuery = filteredQuery.order('created_at', { ascending: false });
    
    // Step 4: Add limit and execute
    const { data, error } = await orderedQuery.limit(limit);
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Use explicit type casting
    return { data: data as CourseData[] };
  } catch (error) {
    console.error("Error fetching featured courses:", error);
    return { error };
  }
};

// Get courses by instructor ID (needed by CourseManagement.tsx)
export const getCoursesByInstructorId = async (instructorId: string) => {
  try {
    // Simplify by destructuring the result directly
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
    // Use direct approach without complex chaining
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
    // Use simple loop with awaited promises to avoid complex typing
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

// Save course (needed by CourseEditorContext.tsx)
export const saveCourse = async (courseData: any) => {
  try {
    const { id, ...courseFields } = courseData;
    let result;
    
    // Use more direct approach with explicit handling for update vs insert
    if (id) {
      // Update existing course
      result = await supabase
        .from('courses')
        .update(courseFields)
        .eq('id', id)
        .select()
        .single();
    } else {
      // Insert new course
      result = await supabase
        .from('courses')
        .insert(courseFields)
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
