
import { supabase } from "@/integrations/supabase/client";
import { ListItem } from "@/lib/types/course-new";

// Get learning objectives for a course
export const getObjectives = async (courseId: number) => {
  try {
    const { data, error } = await supabase
      .from('course_learning_objectives')
      .select('*')
      .eq('course_id', courseId)
      .order('position');

    return { data, error };
  } catch (error) {
    console.error('Error fetching course objectives:', error);
    return { data: null, error };
  }
};

// Get course requirements
export const getRequirements = async (courseId: number) => {
  try {
    const { data, error } = await supabase
      .from('course_requirements')
      .select('*')
      .eq('course_id', courseId)
      .order('position');

    return { data, error };
  } catch (error) {
    console.error('Error fetching course requirements:', error);
    return { data: null, error };
  }
};

// Get target audience
export const getAudiences = async (courseId: number) => {
  try {
    const { data, error } = await supabase
      .from('course_audiences')
      .select('*')
      .eq('course_id', courseId)
      .order('position');

    return { data, error };
  } catch (error) {
    console.error('Error fetching course target audience:', error);
    return { data: null, error };
  }
};

// Update a course section
export const updateCourseSection = async (
  tableType: 'course_learning_objectives' | 'course_requirements' | 'course_audiences',
  courseId: number,
  items: ListItem[]
) => {
  try {
    // First delete all existing items for this course
    const { error: deleteError } = await supabase
      .from(tableType)
      .delete()
      .eq('course_id', courseId);

    if (deleteError) {
      throw deleteError;
    }

    // Then insert the new items
    if (items.length === 0) {
      return { data: [], error: null };
    }

    const itemsToInsert = items.map((item, index) => ({
      course_id: courseId,
      content: item.text,
      position: index,
      is_visible: item.is_visible !== false // Default to true if not specified
    }));

    const { data, error: insertError } = await supabase
      .from(tableType)
      .insert(itemsToInsert)
      .select();

    if (insertError) {
      throw insertError;
    }

    // Save to localStorage as well for redundancy
    try {
      localStorage.setItem(`course_${courseId}_${tableType}_saved`, 'true');
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error updating ${tableType}:`, error);
    return { data: null, error };
  }
};

// New function: Update section visibility
export const updateSectionVisibility = async (
  tableType: 'course_learning_objectives' | 'course_requirements' | 'course_audiences',
  courseId: number,
  isVisible: boolean
) => {
  try {
    // Update all items for this course in the specific table
    const { data, error } = await supabase
      .from(tableType)
      .update({ is_visible: isVisible })
      .eq('course_id', courseId)
      .select();
    
    if (error) throw error;
    
    // Update in localStorage as well for redundancy
    try {
      const visibilityKey = `course_${courseId}_section_visibility`;
      const currentVisibility = JSON.parse(localStorage.getItem(visibilityKey) || '{}');
      
      // Map table type to the corresponding visibility field
      const visibilityField = tableType === 'course_learning_objectives' ? 'objectives' :
                             tableType === 'course_requirements' ? 'requirements' : 'audiences';
      
      // Update the visibility for this section
      currentVisibility[visibilityField] = isVisible;
      
      localStorage.setItem(visibilityKey, JSON.stringify(currentVisibility));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating ${tableType} visibility:`, error);
    return { data: null, error };
  }
};

// Helper function for specific sections
export const updateObjectivesVisibility = (courseId: number, isVisible: boolean) => {
  return updateSectionVisibility('course_learning_objectives', courseId, isVisible);
};

export const updateRequirementsVisibility = (courseId: number, isVisible: boolean) => {
  return updateSectionVisibility('course_requirements', courseId, isVisible);
};

export const updateAudiencesVisibility = (courseId: number, isVisible: boolean) => {
  return updateSectionVisibility('course_audiences', courseId, isVisible);
};

// Save materials visibility setting
export const saveMaterialsVisibility = async (courseId: number, isVisible: boolean) => {
  try {
    // Update in localStorage only for now
    // In the future this could be updated to store in a database table if needed
    const visibilityKey = `course_${courseId}_section_visibility`;
    const currentVisibility = JSON.parse(localStorage.getItem(visibilityKey) || '{}');
    currentVisibility.materials = isVisible;
    localStorage.setItem(visibilityKey, JSON.stringify(currentVisibility));
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error saving materials visibility:', error);
    return { success: false, error };
  }
};
