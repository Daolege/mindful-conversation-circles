
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
    // Break down the query into separate steps to fix TypeScript issues
    // Step 1: Start with the base query
    let query = supabase.from('courses');
    
    // Step 2: Select fields
    query = query.select('*');
    
    // Step 3: Add filters separately
    query = query.eq('is_featured', true);
    query = query.eq('status', 'published');
    
    // Step 4: Add ordering
    query = query.order('created_at', { ascending: false });
    
    // Step 5: Add limit
    query = query.limit(limit);
    
    // Execute the query
    const { data, error } = await query;
    
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
    // Break down the query into separate steps for type safety
    let query = supabase.from('courses');
    
    // Select fields
    query = query.select('*');
    
    // Add filters
    query = query.eq('instructor', instructorId);
    
    // Add ordering
    query = query.order('display_order', { ascending: true });
    
    // Execute the query
    const { data, error } = await query;
    
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
    // Break down the query into steps
    let query = supabase.from('courses');
    
    // Delete operation
    query = query.delete();
    
    // Add filter
    query = query.eq('id', courseId);
    
    // Execute the query
    const { error } = await query;
    
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
      // Break down the query into steps
      let query = supabase.from('courses');
      
      // Update operation
      query = query.update({ display_order: i });
      
      // Add filter
      query = query.eq('id', courseIds[i]);
      
      // Execute the query
      const { error: updateError } = await query;
      
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
    
    // Break down queries into steps to avoid type issues
    if (id) {
      // Update existing course - build the query step by step
      let updateQuery = supabase.from('courses');
      
      // Update operation
      updateQuery = updateQuery.update(courseFields);
      
      // Add filter
      updateQuery = updateQuery.eq('id', id);
      
      // Select fields
      updateQuery = updateQuery.select();
      
      // Expect single result
      updateQuery = updateQuery.single();
      
      // Execute the query
      result = await updateQuery;
    } else {
      // Insert new course - build the query step by step
      let insertQuery = supabase.from('courses');
      
      // Insert operation
      insertQuery = insertQuery.insert(courseFields);
      
      // Select fields
      insertQuery = insertQuery.select();
      
      // Expect single result
      insertQuery = insertQuery.single();
      
      // Execute the query
      result = await insertQuery;
    }
    
    if (result.error) throw result.error;
    return { data: result.data, error: null };
  } catch (error) {
    console.error("Error saving course:", error);
    return { data: null, error };
  }
};
