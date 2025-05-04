
// This file defines the structure and types for module settings
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";

// Define ModuleItem interface
export interface ModuleItem {
  id: string;
  course_id?: number;
  content: string;
  position: number;
  is_visible?: boolean;
  icon?: string;
}

// Define ModuleSettings interface
export interface ModuleSettings {
  title: string;
  icon: string;
  module_type: string;
}

/**
 * Get module settings for a specific course and module type
 */
export const getModuleSettings = async (courseId: number, moduleType: string) => {
  try {
    const { data, error } = await supabase.rpc('get_module_settings', {
      p_course_id: courseId,
      p_module_type: moduleType
    });
    
    if (error) {
      console.error("Error getting module settings:", error);
      return null;
    }
    
    return data as ModuleSettings;
  } catch (error) {
    console.error("Exception getting module settings:", error);
    return null;
  }
};

/**
 * Update module settings
 */
export const updateModuleSettings = async (
  courseId: number, 
  moduleType: string, 
  settings: Partial<ModuleSettings>
) => {
  try {
    const { error } = await supabase.rpc('update_module_settings', {
      p_course_id: courseId,
      p_module_type: moduleType,
      p_settings: settings
    });
    
    if (error) {
      console.error("Error updating module settings:", error);
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Exception updating module settings:", error);
    return { success: false, error };
  }
};
