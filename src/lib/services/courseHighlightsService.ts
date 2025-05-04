
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

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
      .order('position');
      
    if (error) throw error;
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("获取课程亮点失败:", error);
    return [];
  }
};

/**
 * 更新课程亮点
 * @param highlight 要更新的亮点
 */
export const updateCourseHighlight = async (highlight: CourseHighlight): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('course_highlights')
      .update({
        content: highlight.content,
        icon: highlight.icon,
        position: highlight.position,
        is_visible: highlight.is_visible
      })
      .eq('id', highlight.id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("更新课程亮点失败:", error);
    return false;
  }
};

/**
 * 添加课程亮点
 * @param courseId 课程ID
 * @param highlight 要添加的亮点
 */
export const addCourseHighlight = async (courseId: number, highlight: Omit<CourseHighlight, 'id'>): Promise<CourseHighlight | null> => {
  try {
    const newHighlight = {
      id: uuidv4(),
      course_id: courseId,
      content: highlight.content,
      icon: highlight.icon,
      position: highlight.position,
      is_visible: highlight.is_visible !== false
    };
    
    const { data, error } = await supabase
      .from('course_highlights')
      .insert(newHighlight)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("添加课程亮点失败:", error);
    return null;
  }
};

/**
 * 删除课程亮点
 * @param highlightId 亮点ID
 */
export const deleteCourseHighlight = async (highlightId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('course_highlights')
      .delete()
      .eq('id', highlightId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("删除课程亮点失败:", error);
    return false;
  }
};

/**
 * 重排课程亮点
 * @param highlights 重排后的亮点列表
 */
export const reorderCourseHighlights = async (highlights: Pick<CourseHighlight, 'id' | 'position'>[]): Promise<boolean> => {
  if (!highlights || highlights.length === 0) return false;
  
  try {
    // 使用事务批量更新
    const updates = highlights.map(h => ({
      id: h.id,
      position: h.position
    }));
    
    const { error } = await supabase.rpc('batch_update_positions', {
      table_name: 'course_highlights',
      updates: updates
    });
    
    if (error) {
      // 如果RPC函数不存在，则一个个更新
      for (const highlight of highlights) {
        await supabase
          .from('course_highlights')
          .update({ position: highlight.position })
          .eq('id', highlight.id);
      }
    }
    
    return true;
  } catch (error) {
    console.error("重排课程亮点失败:", error);
    return false;
  }
};

/**
 * 重置课程亮点为默认值
 * @param courseId 课程ID
 */
export const resetCourseHighlights = async (courseId: number): Promise<boolean> => {
  try {
    // 调用数据库函数重置亮点
    await supabase.rpc('reset_course_highlights', { p_course_id: courseId });
    
    // 更新章节数量亮点
    await supabase.rpc('update_chapter_count_highlight', { p_course_id: courseId });
    
    return true;
  } catch (error) {
    console.error("重置课程亮点失败:", error);
    return false;
  }
};

/**
 * 更新课程章节数量亮点
 * @param courseId 课程ID
 */
export const updateChapterCountHighlight = async (courseId: number): Promise<boolean> => {
  try {
    await supabase.rpc('update_chapter_count_highlight', { p_course_id: courseId });
    return true;
  } catch (error) {
    console.error("更新章节数量亮点失败:", error);
    return false;
  }
};

/**
 * 更新课程语言亮点
 * @param courseId 课程ID
 * @param language 课程语言
 */
export const updateLanguageHighlight = async (courseId: number, language: string): Promise<boolean> => {
  try {
    // 获取语言名称
    const languageMap: Record<string, string> = {
      'zh': '中文',
      'en': '英语',
      'fr': '法语',
      'de': '德语',
      'ja': '日语',
      'ko': '韩语',
      'es': '西班牙语',
      'ru': '俄语'
    };
    
    const languageName = languageMap[language] || language;
    
    // 查找包含"课程语言"的亮点
    const { data, error } = await supabase
      .from('course_highlights')
      .select('id')
      .eq('course_id', courseId)
      .ilike('content', '%课程语言%')
      .single();
      
    if (error) {
      console.error("查找课程语言亮点失败:", error);
      return false;
    }
    
    if (data) {
      // 更新亮点
      const { error: updateError } = await supabase
        .from('course_highlights')
        .update({ content: `课程语言:${languageName}` })
        .eq('id', data.id);
        
      if (updateError) {
        console.error("更新课程语言亮点失败:", updateError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("更新课程语言亮点失败:", error);
    return false;
  }
};
