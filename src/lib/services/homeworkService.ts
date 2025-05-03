
import { supabase } from "@/integrations/supabase/client";

// Define return types for proper type safety
interface HomeworkResult {
  success: boolean;
  data?: any[];
  error?: Error;
  count?: number; // Add count property for pagination and stats
}

// Diagnose issues with the homework table
export const debugHomeworkTable = async (): Promise<HomeworkResult> => {
  try {
    console.log("Debug homework table called");
    // This is just diagnostic function
    return { success: true, data: [] };
  } catch (error) {
    console.error("Error debugging homework table:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error("Unknown error") 
    };
  }
};

// Get homework by lecture ID
export const getHomeworksByLectureId = async (lectureId: string): Promise<HomeworkResult> => {
  try {
    const { data, error, count } = await supabase
      .from('homework')
      .select('*', { count: 'exact' })
      .eq('lecture_id', lectureId);
    
    if (error) throw error;
    
    return {
      success: true,
      data: data || [],
      count: count || 0
    };
  } catch (error) {
    console.error("Error fetching homework:", error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Unknown error"),
      data: [],
      count: 0
    };
  }
};

// Save or update homework
export const saveHomework = async (homeworkData: any): Promise<HomeworkResult> => {
  try {
    const { id } = homeworkData;
    let result;
    
    if (id) {
      // Update existing homework
      result = await supabase
        .from('homework')
        .update(homeworkData)
        .eq('id', id)
        .select();
    } else {
      // Insert new homework
      result = await supabase
        .from('homework')
        .insert(homeworkData)
        .select();
    }
    
    if (result.error) throw result.error;
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error("Error saving homework:", error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Unknown error")
    };
  }
};

// Delete homework
export const deleteHomework = async (homeworkId: string): Promise<HomeworkResult> => {
  try {
    const { error } = await supabase
      .from('homework')
      .delete()
      .eq('id', homeworkId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting homework:", error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Unknown error")
    };
  }
};
