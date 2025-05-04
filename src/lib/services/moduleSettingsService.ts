
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define the module settings type
export interface ModuleSettings {
  title: string;
  icon: string;
  module_type: string;
}

// Define the module item type that includes the icon property
export interface ModuleItem {
  id: string;
  content: string;
  position: number;
  icon?: string;
  is_visible: boolean;
}

/**
 * Get module settings for a specific course and module type
 * @param courseId The course ID
 * @param moduleType The module type (objectives, requirements, audiences)
 * @returns Promise with module settings
 */
export const getModuleSettings = async (courseId: number, moduleType: string): Promise<ModuleSettings> => {
  try {
    // Try to use the database function for getting module settings
    const { data: settingsData, error } = await supabase
      .rpc('get_module_settings', {
        p_course_id: courseId,
        p_module_type: moduleType
      });

    if (error) {
      console.error(`Error getting module settings for ${moduleType}:`, error);
      throw error;
    }

    // Handle the case where settings might be null or not in the expected format
    if (!settingsData || typeof settingsData !== 'object') {
      // Return default settings for this module type
      return getDefaultModuleSettings(moduleType);
    }

    // Convert the data to ModuleSettings type and return
    const settings: ModuleSettings = {
      title: settingsData.title || getDefaultModuleSettings(moduleType).title,
      icon: settingsData.icon || getDefaultModuleSettings(moduleType).icon,
      module_type: moduleType
    };

    return settings;
  } catch (error) {
    console.error(`Failed to get module settings for ${moduleType}:`, error);
    return getDefaultModuleSettings(moduleType);
  }
};

/**
 * Update module settings for a specific course and module type
 * @param courseId The course ID
 * @param settings The module settings to update
 * @returns Promise with success status
 */
export const updateModuleSettings = async (courseId: number, settings: ModuleSettings): Promise<boolean> => {
  try {
    // Check if we have valid data
    if (!courseId || !settings.module_type || !settings.title) {
      throw new Error("Missing required fields for module settings update");
    }
    
    // Use the custom RPC function to upsert module settings
    const { error } = await supabase.rpc('upsert_course_section_config', {
      p_course_id: courseId,
      p_section_type: settings.module_type,
      p_title: settings.title,
      p_description: '', // Description is not used in this component
      p_icon: settings.icon
    });

    if (error) {
      console.error("Error updating module settings:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Failed to update module settings:", error);
    throw error;
  }
};

/**
 * Add default items to a module for a course
 * @param courseId The course ID
 * @param moduleType The module type (objectives, requirements, audiences)
 * @returns Promise with success status
 */
export const addDefaultModuleItems = async (courseId: number, moduleType: string): Promise<boolean> => {
  try {
    // Map module types to table names
    const tableMap: Record<string, string> = {
      'objectives': 'course_learning_objectives',
      'requirements': 'course_requirements',
      'audiences': 'course_audiences'
    };

    const tableName = tableMap[moduleType];
    if (!tableName) {
      throw new Error(`Invalid module type: ${moduleType}`);
    }

    // Call the RPC function to add default items
    const { error } = await supabase.rpc('add_default_module_items', {
      p_course_id: courseId,
      p_module_type: moduleType,
      p_table_name: tableName
    });

    if (error) {
      console.error(`Error adding default ${moduleType}:`, error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Failed to add default ${moduleType}:`, error);
    toast.error(`添加默认${moduleType === 'objectives' ? '学习目标' : moduleType === 'requirements' ? '学习模式' : '适合人群'}失败`);
    return false;
  }
};

/**
 * Get default module settings based on module type
 * @param moduleType The module type
 * @returns Default module settings
 */
const getDefaultModuleSettings = (moduleType: string): ModuleSettings => {
  const defaultSettings: Record<string, ModuleSettings> = {
    'objectives': { title: '学习目标', icon: 'target', module_type: 'objectives' },
    'requirements': { title: '学习模式', icon: 'book-open', module_type: 'requirements' },
    'audiences': { title: '适合人群', icon: 'users', module_type: 'audiences' }
  };
  
  return defaultSettings[moduleType] || { title: '课程部分', icon: 'book-open', module_type: moduleType };
};
