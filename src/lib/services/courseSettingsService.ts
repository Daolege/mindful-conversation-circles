
import { supabase } from '@/integrations/supabase/client';

interface CourseSettings {
  materialsVisible?: boolean;
  // Add other settings as needed
}

/**
 * Update course settings
 * @param courseId Course ID
 * @param settings Settings object
 */
export const updateCourseSettings = async (
  courseId: number,
  settings: CourseSettings
): Promise<{ error?: Error }> => {
  try {
    const { error } = await supabase
      .from('courses_new')
      .update(settings)
      .eq('id', courseId);
    
    if (error) throw error;
    
    return { error: undefined };
  } catch (error: any) {
    console.error('Error updating course settings:', error);
    return { error };
  }
};

/**
 * Get course settings
 * @param courseId Course ID
 */
export const getCourseSettings = async (
  courseId: number
): Promise<{ data?: CourseSettings; error?: Error }> => {
  try {
    const { data, error } = await supabase
      .from('courses_new')
      .select('materialsVisible')
      .eq('id', courseId)
      .single();
    
    if (error) throw error;
    
    return { 
      data: {
        materialsVisible: data.materialsVisible
      },
      error: undefined 
    };
  } catch (error: any) {
    console.error('Error getting course settings:', error);
    return { error };
  }
};
