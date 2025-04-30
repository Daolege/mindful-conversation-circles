
import { supabase } from '@/integrations/supabase/client';

// Basic types without circular references
export type CourseSimple = {
  id: number;
  title: string;
  description?: string;
  price: number;
  display_order?: number;
  // Other basic fields as needed
};

// Result type for getCoursesByInstructorId to avoid circular references
export interface CourseQueryResult {
  data: CourseSimple[] | null;
  error: any;
}

// Get all active courses
export const getAllCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('display_order', { ascending: true })
    .limit(100);

  return { data, error };
};

// Get a course by its ID
export const getCourseById = async (id: number) => {
  // First fetch the course details
  const { data: courseData, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();

  if (courseError) {
    return { data: null, error: courseError };
  }

  // Then fetch course materials
  const { data: materialsData, error: materialsError } = await supabase
    .from('course_materials')
    .select('*')
    .eq('course_id', id)
    .order('position');

  // Check materials visibility from localStorage or default to false
  let materialsVisible = false;
  try {
    const visibilityKey = `course_${id}_section_visibility`;
    const visibilityData = JSON.parse(localStorage.getItem(visibilityKey) || '{}');
    materialsVisible = visibilityData.materials === true;
  } catch (err) {
    console.error('Error reading materials visibility:', err);
  }

  // Combine the data with simple object creation - avoid using types that could cause recursion
  const courseWithDetails = {
    ...courseData,
    materials: materialsData || [],
    materialsVisible: materialsVisible
  };

  return { 
    data: courseWithDetails, 
    error: materialsError 
  };
};

// Update course order
export const updateCourseOrder = async (courses: { id: number; display_order: number }[]) => {
  try {
    const updatePromises = courses.map(course => 
      supabase
        .from('courses')
        .update({ display_order: course.display_order })
        .eq('id', course.id)
    );
    
    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error('Error updating course order:', error);
    return false;
  }
};

// Get courses by instructor ID - using explicit return type to avoid deep type instantiation
export const getCoursesByInstructorId = async (instructorId: number): Promise<CourseQueryResult> => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('instructorid', instructorId)
    .order('display_order', { ascending: true });
  
  return { data, error };
};

// Define a simpler interface for DB operations to avoid TS2589 error
interface CourseDbFields {
  id?: number;
  title: string;
  description: string;
  display_order: number;
  price: number;
  requirements: string[];
  whatyouwilllearn: string[];
  category?: string | null;
  language?: string;
  level?: string | null;
  featured?: boolean | null;
  enrollment_count?: number;
  duration?: string | null;
  imageurl?: string | null;
  instructor?: string | null;
  originalprice?: number | null;
  syllabus?: any;
  [key: string]: any; // Allow other fields
}

// Save course data with explicit types to avoid recursion
export const saveCourse = async (courseData: any, courseId?: number) => {
  try {
    // Extract materials to handle separately
    const materials = courseData.materials;
    
    // Prepare data for DB with specific fields to prevent type issues
    const dbCourseData: CourseDbFields = {
      title: courseData.title || '',
      description: courseData.description || '',
      price: courseData.price || 0,
      display_order: courseData.display_order || 0,
      requirements: courseData.requirements || [],
      whatyouwilllearn: courseData.whatyouwilllearn || [],
      category: courseData.category || null,
      language: courseData.language || 'zh',
      level: courseData.level || 'beginner',
      featured: courseData.featured || false,
      enrollment_count: courseData.enrollment_count || 0,
      duration: courseData.duration || null,
      imageurl: courseData.imageurl || null,
      instructor: courseData.instructor || null,
      originalprice: courseData.originalprice || null,
      syllabus: courseData.syllabus || null
    };
    
    let result;
    if (courseId) {
      // Update existing course
      const { data, error } = await supabase
        .from('courses')
        .update(dbCourseData)
        .eq('id', courseId)
        .select('*')
        .single();
        
      if (error) {
        return { success: false, error };
      }
      
      result = { success: true, data };
    } else {
      // Create new course
      const { data, error } = await supabase
        .from('courses')
        .insert(dbCourseData)
        .select('*')
        .single();
        
      if (error) {
        return { success: false, error };
      }
      
      result = { success: true, data };
    }

    // Handle materials separately if they exist
    if (courseId && materials && materials.length > 0) {
      // First, fetch existing materials
      const { data: existingMaterials } = await supabase
        .from('course_materials')
        .select('*')
        .eq('course_id', courseId);

      // Update or insert materials
      for (const material of materials) {
        if (material.id) {
          // Update existing material
          await supabase
            .from('course_materials')
            .update({
              name: material.name,
              url: material.url,
              position: material.position,
              is_visible: material.is_visible
            })
            .eq('id', material.id);
        } else {
          // Insert new material
          await supabase
            .from('course_materials')
            .insert({
              course_id: courseId,
              name: material.name,
              url: material.url,
              position: material.position,
              is_visible: material.is_visible !== false
            });
        }
      }

      // Delete materials that no longer exist
      if (existingMaterials) {
        const currentMaterialIds = materials.map(m => m.id).filter(Boolean);
        const materialsToDelete = existingMaterials.filter(
          m => m.id && !currentMaterialIds.includes(m.id)
        );
        
        for (const material of materialsToDelete) {
          await supabase
            .from('course_materials')
            .delete()
            .eq('id', material.id);
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error saving course:', error);
    return { success: false, error };
  }
};
