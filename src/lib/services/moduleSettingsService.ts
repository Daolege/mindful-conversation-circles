
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define ModuleItem interface
export interface ModuleItem {
  id: string;
  content: string;
  position: number;
  is_visible: boolean;
  icon?: string;
}

// Define ModuleSettings interface
export interface ModuleSettings {
  title: string;
  icon: string;
  module_type: string;
  description?: string;
}

// Get default module settings based on module type
export const getDefaultModuleSettings = (moduleType: string): ModuleSettings => {
  const defaults: Record<string, ModuleSettings> = {
    objectives: {
      title: '学习目标',
      icon: 'target',
      module_type: 'objectives'
    },
    requirements: {
      title: '学习模式',
      icon: 'book-open',
      module_type: 'requirements'
    },
    audiences: {
      title: '适合人群',
      icon: 'users',
      module_type: 'audiences'
    }
  };
  
  return defaults[moduleType] || {
    title: '课程部分',
    icon: 'check',
    module_type: moduleType
  };
};

// Get configuration for a section
export const getSectionConfig = async (courseId: number, sectionType: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_course_section_config', {
        p_course_id: courseId,
        p_section_type: sectionType
      });
    
    if (error) {
      console.error("Error getting section config:", error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error("Exception getting section config:", err);
    return { data: null, error: err };
  }
};

// Update configuration for a section
export const upsertSectionConfig = async (
  courseId: number, 
  sectionType: string, 
  title: string, 
  description: string = '', 
  icon: string = ''
) => {
  try {
    const { data, error } = await supabase
      .rpc('upsert_course_section_config', {
        p_course_id: courseId,
        p_section_type: sectionType,
        p_title: title,
        p_description: description,
        p_icon: icon
      });
    
    if (error) {
      console.error("Error upserting section config:", error);
      toast.error("保存模块设置失败");
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error("Exception upserting section config:", err);
    return { data: null, error: err };
  }
};
