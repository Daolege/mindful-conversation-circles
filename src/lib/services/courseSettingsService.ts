
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
      .update({
        materialsVisible: settings.materialsVisible
      })
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

// Add the missing functions needed by CourseNewEditor.tsx
export const getObjectives = async (courseId: number) => {
  try {
    const { data, error } = await supabase
      .from('course_learning_objectives')
      .select('*')
      .eq('course_id', courseId)
      .order('position');
    
    return { data, error };
  } catch (error) {
    console.error('Error getting objectives:', error);
    return { data: null, error };
  }
};

export const getRequirements = async (courseId: number) => {
  try {
    const { data, error } = await supabase
      .from('course_requirements')
      .select('*')
      .eq('course_id', courseId)
      .order('position');
    
    return { data, error };
  } catch (error) {
    console.error('Error getting requirements:', error);
    return { data: null, error };
  }
};

export const getAudiences = async (courseId: number) => {
  try {
    const { data, error } = await supabase
      .from('course_audiences')
      .select('*')
      .eq('course_id', courseId)
      .order('position');
    
    return { data, error };
  } catch (error) {
    console.error('Error getting audiences:', error);
    return { data: null, error };
  }
};
