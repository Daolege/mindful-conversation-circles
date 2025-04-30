
import { supabase } from '@/integrations/supabase/client';
import { CourseSection } from '@/lib/types/course-new';

// 保存章节
export const saveSection = async (sectionData: { 
  course_id: number; 
  title: string; 
  position: number;
}) => {
  try {
    console.log('[sectionService] 保存章节:', sectionData);
    
    if (!sectionData.course_id || isNaN(Number(sectionData.course_id))) {
      console.error('[sectionService] 无效的课程ID:', sectionData.course_id);
      return { data: null, error: new Error('无效的课程ID') };
    }
    
    const { data, error } = await supabase
      .from('course_sections')
      .insert(sectionData)
      .select();
      
    if (error) {
      console.error('[sectionService] 保存章节出错:', error);
      return { data: null, error };
    }
    
    console.log('[sectionService] 章节保存成功:', data);
    return { data, error: null };
  } catch (err: any) {
    console.error('[sectionService] saveSection异常:', err);
    return { data: null, error: err };
  }
};

// 更新章节
export const updateSection = async (sectionId: string, updates: Partial<CourseSection>) => {
  try {
    console.log(`[sectionService] 更新章节 ${sectionId}:`, updates);
    
    const { data, error } = await supabase
      .from('course_sections')
      .update(updates)
      .eq('id', sectionId)
      .select();
      
    if (error) {
      console.error('[sectionService] 更新章节出错:', error);
      return { data: null, error };
    }
    
    console.log('[sectionService] 章节更新成功:', data);
    return { data, error: null };
  } catch (err: any) {
    console.error('[sectionService] updateSection异常:', err);
    return { data: null, error: err };
  }
};

// 删除章节
export const deleteSection = async (sectionId: string) => {
  try {
    console.log(`[sectionService] 删除章节 ${sectionId}`);
    
    // 首先删除所有相关的课时
    const { error: lectureError } = await supabase
      .from('course_lectures')
      .delete()
      .eq('section_id', sectionId);
      
    if (lectureError) {
      console.error('[sectionService] 删除章节相关课时出错:', lectureError);
      return { success: false, error: lectureError };
    }
    
    // 然后删除章节
    const { error } = await supabase
      .from('course_sections')
      .delete()
      .eq('id', sectionId);
      
    if (error) {
      console.error('[sectionService] 删除章节出错:', error);
      return { success: false, error };
    }
    
    console.log('[sectionService] 章节删除成功');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('[sectionService] deleteSection异常:', err);
    return { success: false, error: err };
  }
};

// 按课程ID获取所有章节，包括章节下的所有课时
export const getSectionsByCourseId = async (courseId: number) => {
  try {
    if (!courseId || isNaN(courseId) || courseId <= 0) {
      console.error(`[sectionService] 无效的课程ID: ${courseId}, 类型: ${typeof courseId}`);
      return { data: null, error: new Error('无效的课程ID') };
    }
    
    console.log(`[sectionService] 获取课程 ${courseId} 的章节`);
    
    // 获取章节
    const { data: sections, error: sectionError } = await supabase
      .from('course_sections')
      .select('*')
      .eq('course_id', courseId)
      .order('position', { ascending: true });
      
    if (sectionError) {
      console.error('[sectionService] 获取章节出错:', sectionError);
      return { data: null, error: sectionError };
    }
    
    if (!sections || sections.length === 0) {
      console.log('[sectionService] 未找到章节，返回空数组');
      return { data: [], error: null };
    }
    
    console.log('[sectionService] 找到章节数量:', sections.length);
    
    // 查询所有课时
    const { data: lectures, error: lectureError } = await supabase
      .from('course_lectures')
      .select('*')
      .in('section_id', sections.map(s => s.id))
      .order('position', { ascending: true });
      
    if (lectureError) {
      console.error('[sectionService] 获取课时出错:', lectureError);
      // 即使获取课时出错，也返回章节数据
      return { 
        data: sections.map(s => ({ ...s, lectures: [] })), 
        error: null 
      };
    }
    
    // 合并章节和课时
    const sectionsWithLectures = sections.map(section => {
      const sectionLectures = lectures ? lectures.filter(l => l.section_id === section.id) : [];
      return {
        ...section,
        lectures: sectionLectures
      };
    });
    
    console.log(`[sectionService] 找到 ${sections.length} 个章节，共 ${lectures?.length || 0} 个课时`);
    return { data: sectionsWithLectures, error: null };
  } catch (err: any) {
    console.error('[sectionService] getSectionsByCourseId异常:', err);
    return { data: null, error: err };
  }
};

// 批量更新章节顺序
export const updateSectionsOrder = async (sections: Array<{ id: string; position: number }>) => {
  try {
    console.log('[sectionService] 批量更新章节顺序:', sections);
    
    const promises = sections.map(section => 
      supabase
        .from('course_sections')
        .update({ position: section.position })
        .eq('id', section.id)
    );
    
    await Promise.all(promises);
    
    console.log('[sectionService] 章节顺序更新成功');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('[sectionService] updateSectionsOrder异常:', err);
    return { success: false, error: err };
  }
};

// 保存完整课程大纲（包括章节和课时）
export const saveCourseOutline = async (courseId: number, sections: CourseSection[]) => {
  try {
    console.log('[sectionService] 保存完整课程大纲:', courseId, sections);
    
    if (!courseId || isNaN(Number(courseId))) {
      console.error('[sectionService] 无效的课程ID:', courseId);
      return { success: false, error: new Error('无效的课程ID') };
    }

    // 先获取原有章节和课时
    const { data: existingSections, error: getError } = await getSectionsByCourseId(courseId);
    
    if (getError) {
      console.error('[sectionService] 获取现有章节出错:', getError);
      return { success: false, error: getError };
    }
    
    // 处理每个章节
    for (const section of sections) {
      if (!section.id) {
        // 新章节
        console.log('[sectionService] 添加新章节:', section);
        const { error: addError } = await saveSection({
          course_id: courseId,
          title: section.title,
          position: section.position
        });
        
        if (addError) {
          console.error('[sectionService] 添加章节出错:', addError);
          return { success: false, error: addError };
        }
      } else {
        // 更新现有章节
        console.log('[sectionService] 更新章节:', section);
        const { error: updateError } = await updateSection(section.id, {
          title: section.title,
          position: section.position
        });
        
        if (updateError) {
          console.error('[sectionService] 更新章节出错:', updateError);
          return { success: false, error: updateError };
        }
        
        // 处理章节下的课时
        if (section.lectures && section.lectures.length > 0) {
          for (const lecture of section.lectures) {
            if (!lecture.id) {
              // 新课时，通过lectureService添加
              continue; // 这种情况不应该出现，因为课时都会有独立ID
            } else {
              // 更新课时
              console.log('[sectionService] 更新课时:', lecture);
              const { error: updateLectureError } = await supabase
                .from('course_lectures')
                .update({
                  title: lecture.title,
                  position: lecture.position,
                  is_free: lecture.is_free,
                  requires_homework_completion: lecture.requires_homework_completion
                })
                .eq('id', lecture.id);
              
              if (updateLectureError) {
                console.error('[sectionService] 更新课时出错:', updateLectureError);
                // 继续处理其他课时，不中断流程
              }
            }
          }
        }
      }
    }
    
    // 找出需要删除的章节（在原列表中存在，但新列表中不存在的）
    if (existingSections) {
      const newSectionIds = sections.map(s => s.id).filter(Boolean);
      const sectionsToDelete = existingSections.filter(s => !newSectionIds.includes(s.id));
      
      for (const section of sectionsToDelete) {
        console.log('[sectionService] 删除章节:', section.id);
        const { error: deleteError } = await deleteSection(section.id);
        
        if (deleteError) {
          console.error('[sectionService] 删除章节出错:', deleteError);
          // 继续处理其他章节，不中断流程
        }
      }
    }
    
    console.log('[sectionService] 课程大纲保存成功');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('[sectionService] saveCourseOutline异常:', err);
    return { success: false, error: err };
  }
};
