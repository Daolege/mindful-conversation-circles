
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
