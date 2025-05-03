import { supabase } from '@/integrations/supabase/client';
import { CourseData, CourseResponse, CourseNew, CourseSection } from '@/lib/types/course-new';

// Get all courses with optional search parameter
export const getAllCoursesNew = async (search?: string): Promise<CourseResponse<CourseNew[]>> => {
  try {
    let query = supabase
      .from('courses_new')
      .select('*')
      .order('display_order', { ascending: true });

    if (search && search.trim() !== '') {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching courses:", error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Exception fetching courses:", error);
    return { data: null, error: error as Error };
  }
};

// Get a single course by ID
export const getCourseNewById = async (id: number): Promise<CourseResponse<CourseNew>> => {
  try {
    const { data, error } = await supabase
      .from('courses_new')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching course with ID ${id}:`, error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`Exception fetching course with ID ${id}:`, error);
    return { data: null, error: error as Error };
  }
};

// Create a new course
export const createCourseNew = async (courseData: CourseData): Promise<CourseResponse<CourseNew>> => {
  try {
    // Set default status to draft if not provided
    const courseWithDefaults = {
      ...courseData,
      status: courseData.status || 'draft',
      currency: courseData.currency || 'cny'
    };
    
    const { data, error } = await supabase
      .from('courses_new')
      .insert([courseWithDefaults])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating course:", error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Exception creating course:", error);
    return { data: null, error: error as Error };
  }
};

// Update an existing course
export const updateCourseNew = async (id: number, courseData: CourseData): Promise<CourseResponse<CourseNew>> => {
  try {
    const { data, error } = await supabase
      .from('courses_new')
      .update(courseData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating course with ID ${id}:`, error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`Exception updating course with ID ${id}:`, error);
    return { data: null, error: error as Error };
  }
};

// Delete a course by ID
export const deleteCourseNew = async (id: number): Promise<CourseResponse<null> & { success: boolean }> => {
  try {
    const { error } = await supabase
      .from('courses_new')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting course with ID ${id}:`, error);
      return { data: null, error, success: false };
    }
    
    return { data: null, error: null, success: true };
  } catch (error) {
    console.error(`Exception deleting course with ID ${id}:`, error);
    return { data: null, error: error as Error, success: false };
  }
};

// Get complete course details with sections and lectures
export const getFullCourseDetailsNew = async (id: number): Promise<CourseResponse<CourseNew>> => {
  try {
    // First, get the course
    const { data: course, error: courseError } = await supabase
      .from('courses_new')
      .select('*')
      .eq('id', id)
      .single();
    
    if (courseError) {
      console.error(`Error fetching course with ID ${id}:`, courseError);
      return { data: null, error: courseError };
    }
    
    // Then, get all sections for the course
    const { data: sections, error: sectionsError } = await supabase
      .from('course_sections')
      .select('*')
      .eq('course_id', id)
      .order('position', { ascending: true });
    
    if (sectionsError) {
      console.error(`Error fetching sections for course ID ${id}:`, sectionsError);
      return { data: course, error: sectionsError };
    }
    
    // Finally, get all lectures for the course sections
    const sectionIds = sections.map(section => section.id);
    let lectures: any[] = [];
    
    if (sectionIds.length > 0) {
      const { data: lecturesData, error: lecturesError } = await supabase
        .from('course_lectures')
        .select('*')
        .in('section_id', sectionIds)
        .order('position', { ascending: true });
      
      if (lecturesError) {
        console.error(`Error fetching lectures for course ID ${id}:`, lecturesError);
        return { data: { ...course, sections }, error: lecturesError };
      }
      
      lectures = lecturesData;
    }
    
    // Organize lectures by section
    const sectionsWithLectures = sections.map(section => ({
      ...section,
      lectures: lectures.filter(lecture => lecture.section_id === section.id)
    }));
    
    // Return the full course data
    return { 
      data: { 
        ...course, 
        sections: sectionsWithLectures 
      } as CourseNew, 
      error: null 
    };
  } catch (error) {
    console.error(`Exception fetching full course details for ID ${id}:`, error);
    return { data: null, error: error as Error };
  }
};

// Batch delete multiple courses
export const batchDeleteCourses = async (ids: number[]): Promise<CourseResponse<null> & { success: boolean }> => {
  try {
    const { error } = await supabase
      .from('courses_new')
      .delete()
      .in('id', ids);
    
    if (error) {
      console.error(`Error batch deleting courses:`, error);
      return { data: null, error, success: false };
    }
    
    return { data: null, error: null, success: true };
  } catch (error) {
    console.error(`Exception batch deleting courses:`, error);
    return { data: null, error: error as Error, success: false };
  }
};

// Batch update course status
export const batchUpdateCourseStatus = async (
  ids: number[],
  status: 'published' | 'draft' | 'archived'
): Promise<CourseResponse<null> & { success: boolean }> => {
  try {
    const { error } = await supabase
      .from('courses_new')
      .update({ status })
      .in('id', ids);
    
    if (error) {
      console.error(`Error batch updating course status:`, error);
      return { data: null, error, success: false };
    }
    
    return { data: null, error: null, success: true };
  } catch (error) {
    console.error(`Exception batch updating course status:`, error);
    return { data: null, error: error as Error, success: false };
  }
};

// Update course section visibility settings
export const updateCourseSectionVisibility = async (
  courseId: number, 
  visibilitySettings: {
    showObjectives?: boolean;
    showRequirements?: boolean;
    showTargetAudience?: boolean;
    showMaterials?: boolean;
  }
): Promise<CourseResponse<null>> => {
  try {
    const { error } = await supabase
      .from('courses_new')
      .update({
        showObjectives: visibilitySettings.showObjectives,
        showRequirements: visibilitySettings.showRequirements,
        showTargetAudience: visibilitySettings.showTargetAudience,
        showMaterials: visibilitySettings.showMaterials
      })
      .eq('id', courseId);
    
    if (error) {
      console.error(`Error updating course visibility settings:`, error);
      return { data: null, error };
    }
    
    return { data: null, error: null };
  } catch (error) {
    console.error(`Exception updating course visibility settings:`, error);
    return { data: null, error: error as Error };
  }
};

// Save a course with all its data
export const saveFullCourse = async (courseId: number, courseData: CourseData, sections: CourseSection[] = []): Promise<{ data?: CourseNew, error?: Error, success: boolean }> => {
  try {
    let result;
    
    // If it's a new course, create it
    if (courseId === 0) {
      result = await createCourseNew(courseData);
      
      if (result.error) {
        return { error: result.error, success: false };
      }
      
      return { data: result.data, success: true };
    } 
    // Otherwise update existing course
    else {
      result = await updateCourseNew(courseId, courseData);
      
      if (result.error) {
        return { error: result.error, success: false };
      }
      
      // TODO: Handle updating course sections
      
      return { data: result.data, success: true };
    }
  } catch (error) {
    console.error(`Exception in saveFullCourse:`, error);
    return { error: error as Error, success: false };
  }
};

// Clear course local storage data
export const clearCourseLocalStorageData = (courseId: number): void => {
  try {
    const savedSectionsStorageKey = `course_${courseId}_saved_sections`;
    const visibilityStorageKey = `course_${courseId}_section_visibility`;
    
    localStorage.removeItem(savedSectionsStorageKey);
    localStorage.removeItem(visibilityStorageKey);
    
    console.log(`Cleared localStorage data for course ${courseId}`);
  } catch (error) {
    console.error(`Error clearing localStorage for course ${courseId}:`, error);
  }
};
