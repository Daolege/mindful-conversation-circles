
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
