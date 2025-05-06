
import { supabase } from "@/integrations/supabase/client";
import { Homework } from "@/lib/types/homework";

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
    console.log("Fetching homework for lecture ID:", lectureId);
    
    if (!lectureId) {
      throw new Error("Invalid lecture ID");
    }
    
    const { data, error, count } = await supabase
      .from('homework')
      .select('*', { count: 'exact' })
      .eq('lecture_id', lectureId)
      .order('position', { ascending: true });
    
    if (error) {
      console.error("Supabase error fetching homework:", error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} homework items for lecture ${lectureId}`);
    
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
export const saveHomework = async (homeworkData: Homework): Promise<HomeworkResult> => {
  try {
    console.log("Saving homework with data:", {
      id: homeworkData.id,
      lecture_id: homeworkData.lecture_id,
      course_id: homeworkData.course_id,
      course_id_type: typeof homeworkData.course_id,
      title: homeworkData.title,
      position: homeworkData.position || 0
    });
    
    // Validate course_id is a number
    if (typeof homeworkData.course_id !== 'number' || isNaN(homeworkData.course_id)) {
      const error = new Error(`Invalid course_id: ${homeworkData.course_id} (${typeof homeworkData.course_id})`);
      console.error("Validation error:", error.message);
      throw error;
    }
    
    // Validate lecture_id is a string
    if (!homeworkData.lecture_id || typeof homeworkData.lecture_id !== 'string') {
      const error = new Error(`Invalid lecture_id: ${homeworkData.lecture_id}`);
      console.error("Validation error:", error.message);
      throw error;
    }
    
    // Prepare data for saving
    const dataToSave = {
      lecture_id: homeworkData.lecture_id,
      course_id: homeworkData.course_id,
      title: homeworkData.title,
      type: homeworkData.type,
      options: homeworkData.options,
      position: homeworkData.position || 0,
      image_url: homeworkData.image_url || null,
      is_required: homeworkData.is_required || false,
      description: homeworkData.description || null
    };
    
    const { id } = homeworkData;
    let result;
    
    if (id) {
      // Update existing homework
      console.log("Updating existing homework ID:", id);
      result = await supabase
        .from('homework')
        .update(dataToSave)
        .eq('id', id)
        .select();
    } else {
      // Insert new homework
      console.log("Inserting new homework");
      result = await supabase
        .from('homework')
        .insert(dataToSave)
        .select();
    }
    
    if (result.error) {
      console.error("Supabase error saving homework:", result.error);
      throw result.error;
    }
    
    console.log("Homework saved successfully:", result.data);
    
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
    console.log("Deleting homework ID:", homeworkId);
    
    if (!homeworkId) {
      throw new Error("Invalid homework ID");
    }
    
    const { error } = await supabase
      .from('homework')
      .delete()
      .eq('id', homeworkId);
    
    if (error) {
      console.error("Supabase error deleting homework:", error);
      throw error;
    }
    
    console.log("Homework deleted successfully");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting homework:", error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Unknown error")
    };
  }
};
