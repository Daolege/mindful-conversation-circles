
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
    
    // 首先检查表中是否存在position字段
    let hasPositionField = true;
    try {
      const { error: testError } = await supabase
        .from('homework')
        .select('position')
        .limit(1);
      
      if (testError && testError.message && testError.message.includes('does not exist')) {
        console.warn("The position field does not exist in the homework table");
        hasPositionField = false;
      }
    } catch (fieldError) {
      console.warn("Error checking for position field:", fieldError);
      hasPositionField = false;
    }
    
    // 根据是否有position字段决定排序方式
    const { data, error, count } = await supabase
      .from('homework')
      .select('*', { count: 'exact' })
      .eq('lecture_id', lectureId)
      .order(hasPositionField ? 'position' : 'created_at', { ascending: true });
    
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
      position: homeworkData.position
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
    
    // 检查表中是否存在position字段
    let hasPositionField = true;
    try {
      const { error: testError } = await supabase
        .from('homework')
        .select('position')
        .limit(1);
      
      if (testError && testError.message && testError.message.includes('does not exist')) {
        console.warn("The position field does not exist in the homework table");
        hasPositionField = false;
      }
    } catch (fieldError) {
      console.warn("Error checking for position field:", fieldError);
      hasPositionField = false;
    }
    
    // 准备保存数据，根据是否有position字段调整
    const dataToSave: any = {
      lecture_id: homeworkData.lecture_id,
      course_id: homeworkData.course_id,
      title: homeworkData.title,
      type: homeworkData.type,
      options: homeworkData.options,
      image_url: homeworkData.image_url || null,
      is_required: homeworkData.is_required || false,
      description: homeworkData.description || null
    };
    
    // 只有当表中存在position字段时才添加
    if (hasPositionField && homeworkData.position !== undefined) {
      dataToSave.position = homeworkData.position;
    }
    
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

// Fix homework positions
export const fixHomeworkPositions = async (lectureId: string): Promise<HomeworkResult> => {
  try {
    console.log("Fixing homework positions for lecture:", lectureId);
    
    // 检查表中是否存在position字段
    let hasPositionField = true;
    try {
      const { error: testError } = await supabase
        .from('homework')
        .select('position')
        .limit(1);
      
      if (testError && testError.message && testError.message.includes('does not exist')) {
        console.warn("The position field does not exist in the homework table, cannot fix positions");
        return { 
          success: false, 
          error: new Error("Position field does not exist in homework table") 
        };
      }
    } catch (fieldError) {
      console.warn("Error checking for position field:", fieldError);
      return { 
        success: false, 
        error: fieldError instanceof Error ? fieldError : new Error("Unknown error checking position field") 
      };
    }
    
    // 获取当前所有作业
    const { data, error } = await supabase
      .from('homework')
      .select('*')
      .eq('lecture_id', lectureId)
      .order('created_at', { ascending: true });
      
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      return { success: true, data: [] };
    }
    
    // 重新排序
    const updates = data.map((item, index) => ({
      id: item.id,
      position: index + 1
    }));
    
    // 批量更新位置
    for (const update of updates) {
      await supabase
        .from('homework')
        .update({ position: update.position })
        .eq('id', update.id);
    }
    
    console.log(`Fixed positions for ${updates.length} homework items`);
    
    return {
      success: true,
      data: updates
    };
  } catch (error) {
    console.error("Error fixing homework positions:", error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Unknown error")
    };
  }
};
