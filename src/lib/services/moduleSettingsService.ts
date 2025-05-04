
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
    
    // Type safety: Convert data to ModuleSettings or use defaults
    if (data && typeof data === 'object') {
      return data as ModuleSettings;
    }
    
    // Return default settings if no data found or invalid format
    return getDefaultSettings(moduleType);
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
    // Rename the function parameter to match the RPC function parameter name
    const { error } = await supabase.rpc('upsert_course_section_config', {
      p_course_id: courseId,
      p_section_type: moduleType,
      p_title: settings.title,
      p_description: '',  // Not used but required by function
      p_icon: settings.icon
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

// Helper function to get default settings
const getDefaultSettings = (moduleType: string): ModuleSettings => {
  const defaultSettings: Record<string, ModuleSettings> = {
    'objectives': { title: '学习目标', icon: 'target', module_type: 'objectives' },
    'requirements': { title: '学习模式', icon: 'book-open', module_type: 'requirements' },
    'audiences': { title: '适合人群', icon: 'users', module_type: 'audiences' }
  };
  
  return defaultSettings[moduleType] || defaultSettings['objectives'];
};
