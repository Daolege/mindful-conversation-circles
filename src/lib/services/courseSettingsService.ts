
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Function to get module visibilities
export const getModuleVisibilities = async (courseId: number) => {
  try {
    const { data, error } = await supabase
      .rpc('get_module_visibilities', { p_course_id: courseId });
    
    if (error) {
      console.error("Error getting module visibilities:", error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error("Exception getting module visibilities:", err);
    return { data: null, error: err };
  }
};

// Function to get course learning objectives
export const getObjectives = async (courseId: number) => {
  try {
    const { data, error } = await supabase
      .from('course_learning_objectives')
      .select('*')
      .eq('course_id', courseId)
      .order('position', { ascending: true });
    
    if (error) {
      console.error("Error fetching objectives:", error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error("Exception fetching objectives:", err);
    return { data: null, error: err };
  }
};

// Function to get course requirements
export const getRequirements = async (courseId: number) => {
  try {
    const { data, error } = await supabase
      .from('course_requirements')
      .select('*')
      .eq('course_id', courseId)
      .order('position', { ascending: true });
    
    if (error) {
      console.error("Error fetching requirements:", error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error("Exception fetching requirements:", err);
    return { data: null, error: err };
  }
};

// Function to get course audiences
export const getAudiences = async (courseId: number) => {
  try {
    const { data, error } = await supabase
      .from('course_audiences')
      .select('*')
      .eq('course_id', courseId)
      .order('position', { ascending: true });
    
    if (error) {
      console.error("Error fetching audiences:", error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error("Exception fetching audiences:", err);
    return { data: null, error: err };
  }
};
