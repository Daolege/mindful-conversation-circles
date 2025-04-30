import { supabase } from '@/integrations/supabase/client';
import { Course, CourseMaterial, CourseDbData, prepareCourseForDb } from '@/lib/types/course';

// Export any existing types you need to reference with proper typing rather than recursive references
export interface CourseTypeWithStringifiedProps {
  id: number;
  title: string;
  // Add other base properties that don't cause circular references
  // Use more specific types or break circular dependencies
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

  // Combine the data with simple object creation
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

// Get courses by instructor ID - using more specific return type to avoid deep type instantiation
export const getCoursesByInstructorId = async (instructorId: number) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('instructorid', instructorId)
    .order('display_order', { ascending: true });
  
  return { data, error };
};

// Save course data with explicit types to avoid recursion
export const saveCourse = async (courseData: any, courseId?: number) => {
  try {
    // Extract materials to handle separately
    const materials = courseData.materials;
    
    // Create database object with standardized fields
    const dbCourseData = prepareCourseForDb(courseData);
    
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
