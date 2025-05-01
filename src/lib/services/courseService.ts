import { supabase } from "@/integrations/supabase/client";
import { CourseData, CourseResponse, CourseWithSections } from "@/lib/types/course-new";

// Define a simpler BasicCourseData type that matches the courses_new table structure
interface BasicCourseData {
  id?: number;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  category?: string | null;
  display_order?: number;
  status?: 'draft' | 'published' | 'archived';
  is_featured?: boolean;
  thumbnail_url?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // Allow additional properties
}

// Get all courses (simplified to avoid deep type instantiation)
export async function getCourses(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("courses_new") // Changed to courses_new
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
}

// Get course by ID using courses_new table
export async function getCourseById(courseId: number): Promise<CourseResponse<CourseData>> {
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
    
    // Cast to ensure type compatibility
    return { data: data as CourseData, error: null };
  } catch (err) {
    console.error('[courseService] Unexpected error in getCourseById:', err);
    return { data: null, error: err as Error };
  }
}

// Save course with proper types
export async function saveCourse(courseData: CourseData): Promise<CourseResponse<CourseData>> {
  try {
    // Ensure title exists when creating a new course
    if (!courseData.id && !courseData.title) {
      courseData.title = 'New Course'; // Default title for new courses
    }

    const { data, error } = await supabase
      .from('courses_new')
      .upsert([courseData])
      .select();
    
    if (error) {
      console.error('[courseService] Error saving course:', error);
      return { data: null, error };
    }
    
    // Cast the first item as CourseData
    return { data: data && data[0] as CourseData, error: null };
  } catch (err) {
    console.error('[courseService] Unexpected error in saveCourse:', err);
    return { data: null, error: err as Error };
  }
}

// Delete course (simplified)
export async function deleteCourse(courseId: number): Promise<{ success: boolean; error?: Error }> {
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
}

// Get courses by instructor ID - completely simplify the return type to avoid deep type instantiation
export async function getCoursesByInstructorId(instructorId: string): Promise<{data: any | null, error: Error | null}> {
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
}

// Update course order
export async function updateCourseOrder(courseIds: number[]): Promise<{ success: boolean; error?: any }> {
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
}

// Insert course with proper types
export async function insertCourse(courseData: BasicCourseData) {
  try {
    // Ensure status is a valid enum value
    if (courseData.status && typeof courseData.status === 'string') {
      if (!['draft', 'published', 'archived'].includes(courseData.status)) {
        courseData.status = 'draft';
      }
    }

    const { data, error } = await supabase
      .from("courses_new")
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
}

// Fix updateMultipleCourses with correct types
export async function updateMultipleCourses(coursesData: BasicCourseData[]) {
  try {
    // Ensure all courses have valid status values
    coursesData.forEach(course => {
      if (course.status && typeof course.status === 'string') {
        if (!['draft', 'published', 'archived'].includes(course.status)) {
          course.status = 'draft';
        }
      }
    });
    
    const { data, error } = await supabase
      .from("courses_new")
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
}

// Add getCourseNewById for the new system
export async function getCourseNewById(courseId: number): Promise<any> {
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
}

// Simplified getCourseWithSections function to avoid type issues
export const getCourseWithSections = async (courseId: number): Promise<CourseWithSections | null> => {
  try {
    // Query for the course
    const { data: courseData, error: courseError } = await supabase
      .from('courses_new')
      .select(`
        id,
        title,
        description,
        price,
        currency,
        category
      `)
      .eq('id', courseId)
      .single();

    if (courseError) {
      console.error('Error fetching course:', courseError);
      return null;
    }

    // Make sure we have actual course data
    if (!courseData) {
      return null;
    }

    // Get sections separately
    const { data: sectionsData, error: sectionsError } = await supabase
      .from('course_sections')
      .select('id, title, position')
      .eq('course_id', courseId)
      .order('position', { ascending: true });

    if (sectionsError) {
      console.error('Error fetching course sections:', sectionsError);
      return null;
    }

    // Process sections and get lectures for each
    const sections = [];
    
    if (sectionsData && Array.isArray(sectionsData)) {
      for (const section of sectionsData) {
        // For each section, fetch lectures separately
        const { data: lecturesData, error: lecturesError } = await supabase
          .from('course_lectures')
          .select('id, title, position')
          .eq('section_id', section.id)
          .order('position', { ascending: true });
          
        if (lecturesError) {
          console.error(`Error fetching lectures for section ${section.id}:`, lecturesError);
          continue;
        }
        
        // Process lectures
        const lectures = [];
        
        if (lecturesData && Array.isArray(lecturesData)) {
          for (const lecture of lecturesData) {
            // Store lecture info with default values for missing fields
            lectures.push({
              id: lecture.id,
              title: lecture.title,
              position: lecture.position,
              description: null,
              video_url: null,
              duration: null
            });
          }
        }
        
        sections.push({
          id: section.id,
          title: section.title,
          position: section.position,
          lectures: lectures
        });
      }
    }

    // Create a properly typed result object
    const result: CourseWithSections = {
      id: courseData.id,
      title: courseData.title,
      description: courseData.description,
      price: courseData.price,
      currency: courseData.currency,
      category: courseData.category,
      sections: sections
    };

    return result;
  } catch (error) {
    console.error('Exception fetching course with sections:', error);
    return null;
  }
};
