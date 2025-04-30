
import { supabase } from '@/integrations/supabase/client';
import { CourseNew, CourseSection, CourseMaterial } from '@/lib/types/course-new';

// Get all courses
export const getAllCoursesNew = async (searchTerm?: string) => {
  try {
    console.log('[courseNewService] 获取所有课程', searchTerm ? `搜索词: ${searchTerm}` : '');
    
    let query = supabase
      .from('courses_new')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (searchTerm && searchTerm.trim() !== '') {
      query = query.ilike('title', `%${searchTerm.trim()}%`);
    }
      
    const { data, error } = await query;
      
    if (error) {
      console.error('[courseNewService] 获取课程列表出错:', error);
      return { data: null, error };
    }
    
    console.log('[courseNewService] 获取到课程列表:', data?.length || 0, '条记录');
    return { data, error: null };
  } catch (err: any) {
    console.error('[courseNewService] getAllCoursesNew异常:', err);
    return { data: null, error: err };
  }
};

// 创建新课程
export const createCourseNew = async (courseData: Partial<CourseNew> & { title: string }) => {
  try {
    console.log('[courseNewService] 创建新课程:', courseData);
    
    const { data, error } = await supabase
      .from('courses_new')
      .insert(courseData)
      .select();
      
    if (error) {
      console.error('[courseNewService] 创建课程出错:', error);
      return { data: null, error };
    }
    
    console.log('[courseNewService] 课程创建成功:', data);
    return { data: data[0], error: null };
  } catch (err: any) {
    console.error('[courseNewService] createCourseNew异常:', err);
    return { data: null, error: err };
  }
};

// 更新课程信息
export const updateCourseNew = async (courseId: number, updates: Partial<CourseNew>) => {
  try {
    console.log(`[courseNewService] 更新课程 ${courseId}:`, updates);
    
    const { data, error } = await supabase
      .from('courses_new')
      .update(updates)
      .eq('id', courseId)
      .select();
      
    if (error) {
      console.error('[courseNewService] 更新课程出错:', error);
      return { data: null, error };
    }
    
    console.log('[courseNewService] 课程更新成功:', data);
    return { data: data[0], error: null };
  } catch (err: any) {
    console.error('[courseNewService] updateCourseNew异常:', err);
    return { data: null, error: err };
  }
};

// 获取课程详情（包括章节和课时）
export const getCourseNewById = async (courseId: number) => {
  try {
    console.log(`[courseNewService] 获取课程 ${courseId} 详情`);
    
    // 获取课程基本信息
    const { data: course, error: courseError } = await supabase
      .from('courses_new')
      .select('*')
      .eq('id', courseId)
      .single();
      
    if (courseError) {
      console.error('[courseNewService] 获取课程出错:', courseError);
      return { data: null, error: courseError };
    }
    
    // 获取课程章节
    const { data: sections, error: sectionError } = await supabase
      .from('course_sections')
      .select('*')
      .eq('course_id', courseId)
      .order('position', { ascending: true });
      
    if (sectionError) {
      console.error('[courseNewService] 获取章节出错:', sectionError);
      return { data: { ...course, sections: [] }, error: null };
    }
    
    // 获取课程附件
    const { data: materials, error: materialsError } = await supabase
      .from('course_materials')
      .select('*')
      .eq('course_id', courseId)
      .order('position', { ascending: true });
      
    if (materialsError) {
      console.error('[courseNewService] 获取课程附件出错:', materialsError);
    }
    
    // 获取学习目标
    const { data: learningObjectives, error: objectivesError } = await supabase
      .from('course_learning_objectives')
      .select('content')
      .eq('course_id', courseId)
      .order('position', { ascending: true });
      
    if (objectivesError) {
      console.error('[courseNewService] 获取学习目标出错:', objectivesError);
    }
    
    // 获取课程要求
    const { data: requirements, error: requirementsError } = await supabase
      .from('course_requirements')
      .select('content')
      .eq('course_id', courseId)
      .order('position', { ascending: true });
      
    if (requirementsError) {
      console.error('[courseNewService] 获取课程要求出错:', requirementsError);
    }
    
    // 获取适合人群
    // 这里使用course_audiences表作为target_audience数据的来源
    const { data: targetAudience, error: audienceError } = await supabase
      .from('course_audiences')
      .select('content')
      .eq('course_id', courseId)
      .order('position', { ascending: true });
      
    if (audienceError) {
      console.error('[courseNewService] 获取适合人群出错:', audienceError);
    }
    
    if (sections && sections.length > 0) {
      // 获取所有章节下的课时
      const { data: lectures, error: lectureError } = await supabase
        .from('course_lectures')
        .select('*')
        .in('section_id', sections.map(s => s.id))
        .order('position', { ascending: true });
        
      if (lectureError) {
        console.error('[courseNewService] 获取课时出错:', lectureError);
      }
      
      // 将课时添加到对应章节
      const sectionsWithLectures = sections.map(section => {
        const sectionLectures = lectures ? lectures.filter(l => l.section_id === section.id) : [];
        return {
          ...section,
          lectures: sectionLectures
        };
      });
      
      console.log(`[courseNewService] 找到 ${sections.length} 个章节，共 ${lectures?.length || 0} 个课时`);
      
      // 转换学习目标、要求和适合人群为字符串数组
      const learningObjectivesArray = learningObjectives 
        ? learningObjectives.map((item: any) => item.content) 
        : [];
      
      const requirementsArray = requirements 
        ? requirements.map((item: any) => item.content) 
        : [];
      
      const targetAudienceArray = targetAudience 
        ? targetAudience.map((item: any) => item.content) 
        : [];
      
      return { 
        data: { 
          ...course, 
          sections: sectionsWithLectures,
          materials: materials,
          learning_objectives: learningObjectivesArray,
          requirements: requirementsArray,
          target_audience: targetAudienceArray
        }, 
        error: null 
      };
    } else {
      console.log('[courseNewService] 未找到章节');
      
      // 转换学习目标、要求和适合人群为字符串数组
      const learningObjectivesArray = learningObjectives 
        ? learningObjectives.map((item: any) => item.content) 
        : [];
      
      const requirementsArray = requirements 
        ? requirements.map((item: any) => item.content) 
        : [];
      
      const targetAudienceArray = targetAudience 
        ? targetAudience.map((item: any) => item.content) 
        : [];
      
      return { 
        data: { 
          ...course, 
          sections: [],
          materials: materials,
          learning_objectives: learningObjectivesArray,
          requirements: requirementsArray,
          target_audience: targetAudienceArray
        }, 
        error: null 
      };
    }
  } catch (err: any) {
    console.error('[courseNewService] getCourseNewById异常:', err);
    return { data: null, error: err };
  }
};

// 删除课程
export const deleteCourseNew = async (courseId: number) => {
  try {
    console.log(`[courseNewService] 删除课程 ${courseId}`);
    
    // 获取课程章节
    const { data: sections } = await supabase
      .from('course_sections')
      .select('id')
      .eq('course_id', courseId);
      
    if (sections && sections.length > 0) {
      // 删除所有课时
      await supabase
        .from('course_lectures')
        .delete()
        .in('section_id', sections.map(s => s.id));
        
      // 删除所有章节
      await supabase
        .from('course_sections')
        .delete()
        .eq('course_id', courseId);
    }
    
    // 删除课程
    const { error } = await supabase
      .from('courses_new')
      .delete()
      .eq('id', courseId);
      
    if (error) {
      console.error('[courseNewService] 删除课程出错:', error);
      return { success: false, error };
    }
    
    console.log('[courseNewService] 课程删除成功');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('[courseNewService] deleteCourseNew异常:', err);
    return { success: false, error: err };
  }
};

// 批量删除课程
export const batchDeleteCourses = async (courseIds: number[]) => {
  try {
    console.log(`[courseNewService] 批量删除课程，共 ${courseIds.length} 门`);
    
    if (!courseIds.length) {
      return { success: true, error: null };
    }
    
    // 开始事务 - 由于需要删除多个关联表的数据，我们需要确保操作的原子性
    
    // 1. 获取相关的课程章节
    const { data: sections } = await supabase
      .from('course_sections')
      .select('id')
      .in('course_id', courseIds);
      
    if (sections && sections.length > 0) {
      const sectionIds = sections.map(s => s.id);
      
      // 2. 删除所有课时
      const { error: lectureError } = await supabase
        .from('course_lectures')
        .delete()
        .in('section_id', sectionIds);
        
      if (lectureError) {
        console.error('[courseNewService] 批量删除课时出错:', lectureError);
        return { success: false, error: lectureError };
      }
      
      // 3. 删除所有章节
      const { error: sectionError } = await supabase
        .from('course_sections')
        .delete()
        .in('course_id', courseIds);
        
      if (sectionError) {
        console.error('[courseNewService] 批量删除章节出错:', sectionError);
        return { success: false, error: sectionError };
      }
    }
    
    // 4. 删除课程
    const { error } = await supabase
      .from('courses_new')
      .delete()
      .in('id', courseIds);
      
    if (error) {
      console.error('[courseNewService] 批量删除课程出错:', error);
      return { success: false, error };
    }
    
    console.log('[courseNewService] 批量删除课程成功');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('[courseNewService] batchDeleteCourses异常:', err);
    return { success: false, error: err };
  }
};

// 批量更新课程状态
export const batchUpdateCourseStatus = async (courseIds: number[], status: 'published' | 'draft' | 'archived') => {
  try {
    console.log(`[courseNewService] 批量更新课程状态为 ${status}，共 ${courseIds.length} 门`);
    
    if (!courseIds.length) {
      return { success: true, error: null };
    }
    
    const updates: any = { status };
    
    // 如果状态是"已发布"，则更新发布日期
    if (status === 'published') {
      updates.published_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('courses_new')
      .update(updates)
      .in('id', courseIds);
      
    if (error) {
      console.error(`[courseNewService] 批量更新课程状态为 ${status} 出错:`, error);
      return { success: false, error };
    }
    
    console.log(`[courseNewService] 批量更新课程状态为 ${status} 成功`);
    return { success: true, error: null };
  } catch (err: any) {
    console.error('[courseNewService] batchUpdateCourseStatus异常:', err);
    return { success: false, error: err };
  }
};

// 保存完整课程（包括基本信息、章节和课时）
export const saveFullCourse = async (
  courseId: number, 
  courseData: Partial<CourseNew>, 
  sections: CourseSection[] = []
) => {
  try {
    console.log(`[courseNewService] 保存完整课程 ${courseId}`);
    
    // Check if this is a new course (courseId === 0)
    if (courseId === 0) {
      // Create new course first
      const { data: newCourse, error: createError } = await createCourseNew(courseData as any);
      
      if (createError) {
        console.error('[courseNewService] 创建新课程出错:', createError);
        return { success: false, error: createError, data: null };
      }
      
      if (!newCourse) {
        const genericError = new Error('创建课程失败：无法获取新课程ID');
        console.error('[courseNewService] 创建课程失败：无法获取新课程ID');
        return { success: false, error: genericError, data: null };
      }
      
      // Use the new course ID for further operations
      courseId = newCourse.id;
      console.log(`[courseNewService] 新课程创建成功，ID: ${courseId}`);
      
      // Return early if no sections need to be processed
      if (!sections || sections.length === 0) {
        return { success: true, data: { id: courseId, lectureCount: 0 }, error: null };
      }
    } else {
      // 1. 更新课程基本信息（如果有）
      if (Object.keys(courseData).length > 0) {
        const { error: courseError } = await supabase
          .from('courses_new')
          .update(courseData)
          .eq('id', courseId);
          
        if (courseError) {
          console.error('[courseNewService] 更新课程信息出错:', courseError);
          return { success: false, error: courseError, data: null };
        }
      }
    }
    
    // 处理章节和课时的保存逻辑
    // 检查是否有需要更新的章节数据
    if (sections && sections.length > 0) {
      console.log(`[courseNewService] 处理 ${sections.length} 个章节数据`);
      
      // 2. 获取数据库中现有的章节和课时
      const { data: existingSections } = await supabase
        .from('course_sections')
        .select('id')
        .eq('course_id', courseId);
      
      const existingSectionIds = existingSections ? existingSections.map(s => s.id) : [];
      const newSectionIds = sections.map(s => s.id);
      
      // 需要删除的章节（在数据库中但不在提交数据中）
      const sectionIdsToDelete = existingSectionIds.filter(id => !newSectionIds.includes(id));
      
      if (sectionIdsToDelete.length > 0) {
        console.log(`[courseNewService] 删除 ${sectionIdsToDelete.length} 个章节`);
        
        // 删除相关的课时
        await supabase
          .from('course_lectures')
          .delete()
          .in('section_id', sectionIdsToDelete);
          
        // 删除章节
        await supabase
          .from('course_sections')
          .delete()
          .in('id', sectionIdsToDelete);
      }
      
      // 3. 遍历每个章节，更新或插入
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const isExistingSection = existingSectionIds.includes(section.id);
        
        // 更新章节位置和标题
        if (isExistingSection) {
          console.log(`[courseNewService] 更新章节 ${section.id}`);
          await supabase
            .from('course_sections')
            .update({
              title: section.title,
              position: i
            })
            .eq('id', section.id);
        } else {
          console.log(`[courseNewService] 插入新章节 ${section.id}`);
          // 这里不应该发生，因为新章节应该在添加时就已经保存到数据库
          // 但我们仍然提供一个后备处理
          await supabase
            .from('course_sections')
            .insert({
              id: section.id, // 使用客户端生成的UUID
              course_id: courseId,
              title: section.title,
              position: i
            });
        }
        
        // 4. 处理课时数据
        if (section.lectures && section.lectures.length > 0) {
          // 获取该章节的现有课时
          const { data: existingLectures } = await supabase
            .from('course_lectures')
            .select('id')
            .eq('section_id', section.id);
            
          const existingLectureIds = existingLectures ? existingLectures.map(l => l.id) : [];
          const newLectureIds = section.lectures.map(l => l.id);
          
          // 需要删除的课时
          const lectureIdsToDelete = existingLectureIds.filter(id => !newLectureIds.includes(id));
          
          if (lectureIdsToDelete.length > 0) {
            console.log(`[courseNewService] 删除 ${lectureIdsToDelete.length} 个课时`);
            await supabase
              .from('course_lectures')
              .delete()
              .in('id', lectureIdsToDelete);
          }
          
          // 更新或插入课时
          for (let j = 0; j < section.lectures.length; j++) {
            const lecture = section.lectures[j];
            
            if (existingLectureIds.includes(lecture.id)) {
              console.log(`[courseNewService] 更新课时 ${lecture.id}`);
              await supabase
                .from('course_lectures')
                .update({
                  title: lecture.title,
                  is_free: lecture.is_free,
                  position: j,
                  section_id: section.id, // 确保课时属于正确的章节
                  duration: lecture.duration,
                  requires_homework_completion: lecture.requires_homework_completion,
                  video_url: lecture.video_url
                })
                .eq('id', lecture.id);
            } else {
              console.log(`[courseNewService] 插入新课时 ${lecture.id}`);
              // 这里也不应该发生，由于新课时应该在添加时就已经保存
              await supabase
                .from('course_lectures')
                .insert({
                  id: lecture.id, // 使用客户端生成的UUID
                  section_id: section.id,
                  title: lecture.title,
                  is_free: lecture.is_free || false,
                  position: j,
                  duration: lecture.duration || "0:00",
                  requires_homework_completion: lecture.requires_homework_completion || false,
                  video_url: lecture.video_url
                });
            }
          }
        }
      }
    }
    
    // 5. 更新课程中的课时数量
    const { data: allLectures } = await supabase
      .from('course_lectures')
      .select('id')
      .in('section_id', sections.map(s => s.id));
      
    const lectureCount = allLectures ? allLectures.length : 0;
    
    await supabase
      .from('courses_new')
      .update({ lecture_count: lectureCount })
      .eq('id', courseId);
      
    console.log(`[courseNewService] 课程保存成功，共 ${lectureCount} 个课时`);
    return { success: true, data: { id: courseId, lectureCount }, error: null };
  } catch (err: any) {
    console.error('[courseNewService] saveFullCourse异常:', err);
    return { success: false, error: err, data: null };
  }
};

// 清除课程本地缓存数据
export const clearCourseLocalStorageData = (courseId: number) => {
  try {
    localStorage.removeItem(`course_outline_${courseId}_draft`);
    console.log(`[courseNewService] 已清除课程 ${courseId} 的本地缓存数据`);
    return true;
  } catch (err) {
    console.error('[courseNewService] 清除本地缓存异常:', err);
    return false;
  }
};

// 保存课时
export const saveCourseLecture = async (lectureData: {
  section_id: string;
  title: string;
  position: number;
  is_free?: boolean;
  duration?: string;
}) => {
  try {
    console.log('[courseNewService] 保存课时:', lectureData);
    
    const { data, error } = await supabase
      .from('course_lectures')
      .insert(lectureData)
      .select();
      
    if (error) {
      console.error('[courseNewService] 保存课时出错:', error);
      return { data: null, error };
    }
    
    console.log('[courseNewService] 课时保存成功:', data);
    return { data, error: null };
  } catch (err: any) {
    console.error('[courseNewService] saveCourseLecture异常:', err);
    return { data: null, error: err };
  }
};

// 删除课时
export const deleteLecture = async (lectureId: string) => {
  try {
    console.log(`[courseNewService] 删除课时 ${lectureId}`);
    
    const { error } = await supabase
      .from('course_lectures')
      .delete()
      .eq('id', lectureId);
      
    if (error) {
      console.error('[courseNewService] 删除课时出错:', error);
      return { success: false, error };
    }
    
    console.log('[courseNewService] 课时删除成功');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('[courseNewService] deleteLecture异常:', err);
    return { success: false, error: err };
  }
};

// 更新课程注册人数
export const updateCourseEnrollmentCount = async (courseId: number, count?: number) => {
  try {
    console.log(`[courseNewService] 更新课程 ${courseId} 注册人数`);
    
    let enrollmentCount = count;
    
    // 如果未提供计数，从数据库获取
    if (enrollmentCount === undefined) {
      const { count: dbCount, error: countError } = await supabase
        .from('course_enrollments')
        .select('*', { count: 'exact' })
        .eq('course_id', courseId)
        .eq('status', 'active');
        
      if (countError) {
        console.error('[courseNewService] 获取注册人数出错:', countError);
        return { success: false, error: countError };
      }
      
      enrollmentCount = dbCount || 0;
    }
    
    // 更新课程的注册人数
    const { error } = await supabase
      .from('courses_new')
      .update({ enrollment_count: enrollmentCount })
      .eq('id', courseId);
      
    if (error) {
      console.error('[courseNewService] 更新注册人数出错:', error);
      return { success: false, error };
    }
    
    console.log(`[courseNewService] 课程注册人数更新成功: ${enrollmentCount}`);
    return { success: true, error: null };
  } catch (err: any) {
    console.error('[courseNewService] updateCourseEnrollmentCount异常:', err);
    return { success: false, error: err };
  }
};
