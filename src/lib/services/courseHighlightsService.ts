
import { supabase } from "@/integrations/supabase/client";

export interface CourseHighlight {
  id: string;
  course_id?: number;
  content: string;
  icon: string;
  position: number;
  is_visible: boolean;
}

/**
 * 获取课程亮点
 * @param courseId 课程ID
 * @returns 课程亮点列表
 */
export const getCourseHighlights = async (courseId: number): Promise<CourseHighlight[]> => {
  try {
    const { data, error } = await supabase
      .from('course_highlights')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_visible', true)
      .order('position');
      
    if (error) throw error;
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("获取课程亮点失败:", error);
    return [];
  }
};

/**
 * 添加课程亮点
 * @param courseId 课程ID
 * @param highlight 亮点数据
 * @returns 添加的亮点
 */
export const addCourseHighlight = async (
  courseId: number,
  highlight: Omit<CourseHighlight, 'id' | 'course_id'>
): Promise<CourseHighlight | null> => {
  try {
    const { data, error } = await supabase
      .from('course_highlights')
      .insert([
        { 
          ...highlight, 
          course_id: courseId 
        }
      ])
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("添加课程亮点失败:", error);
    return null;
  }
};

/**
 * 更新课程亮点
 * @param highlight 亮点数据
 * @returns 是否成功
 */
export const updateCourseHighlight = async (highlight: CourseHighlight): Promise<boolean> => {
  try {
    const { id, ...updateData } = highlight;
    const { error } = await supabase
      .from('course_highlights')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("更新课程亮点失败:", error);
    return false;
  }
};

/**
 * 删除课程亮点
 * @param id 亮点ID
 * @returns 是否成功
 */
export const deleteCourseHighlight = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('course_highlights')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("删除课程亮点失败:", error);
    return false;
  }
};

/**
 * 重置课程亮点为默认值
 * @param courseId 课程ID
 * @returns 是否成功
 */
export const resetCourseHighlights = async (courseId: number): Promise<boolean> => {
  try {
    // 调用数据库函数重置亮点
    const { error } = await supabase
      .rpc('reset_course_highlights', { p_course_id: courseId });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("重置课程亮点失败:", error);
    return false;
  }
};

/**
 * 重新排序课程亮点
 * @param highlights 亮点数据数组
 * @returns 是否成功
 */
export const reorderCourseHighlights = async (
  highlights: Array<{ id: string; position: number }>
): Promise<boolean> => {
  try {
    // 使用事务处理批量更新
    for (const highlight of highlights) {
      const { error } = await supabase
        .from('course_highlights')
        .update({ position: highlight.position })
        .eq('id', highlight.id);
      
      if (error) throw error;
    }
    return true;
  } catch (error) {
    console.error("重新排序课程亮点失败:", error);
    return false;
  }
};
