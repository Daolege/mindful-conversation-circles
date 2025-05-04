
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/supabase";
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
