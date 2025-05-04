
import { supabase } from '@/integrations/supabase/client';
import { CourseData, CourseResponse, CourseWithDetails } from '@/lib/types/course-new';

// 获取课程内容（包括学习目标、课程要求和适合人群）
export const getCourseNewById = async (courseId: number): Promise<CourseResponse> => {
  try {
    console.log(`[courseNewService] 获取课程ID: ${courseId}`);
    
    // 获取基本课程信息
    const { data: courseData, error: courseError } = await supabase
      .from('courses_new')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (courseError) {
      console.error(`[courseNewService] 获取课程信息错误: ${courseError.message}`);
      return { error: courseError };
    }

    if (!courseData) {
      console.error(`[courseNewService] 未找到ID为 ${courseId} 的课程`);
      return { error: new Error('Course not found') };
    }

    console.log(`[courseNewService] 获取到基本课程信息: ${courseData.title}`);

    // 获取课程章节
    const { data: sectionsData, error: sectionsError } = await supabase
      .from('course_sections')
      .select('*')
      .eq('course_id', courseId)
      .order('position', { ascending: true });

    if (sectionsError) {
      console.error(`[courseNewService] 获取课程章节错误: ${sectionsError.message}`);
    }

    // 处理章节及其课时
    const sections = [];
    if (sectionsData && sectionsData.length > 0) {
      for (const section of sectionsData) {
        const { data: lecturesData, error: lecturesError } = await supabase
          .from('course_lectures')
          .select('*')
          .eq('section_id', section.id)
          .order('position', { ascending: true });

        if (lecturesError) {
          console.error(`[courseNewService] 获取章节 ${section.id} 的课时错误: ${lecturesError.message}`);
        }

        sections.push({
          ...section,
          lectures: lecturesData || []
        });
      }
    }

    // 获取课程学习目标
    const { data: objectivesData, error: objectivesError } = await supabase
      .from('course_learning_objectives')
      .select('content')
      .eq('course_id', courseId)
      .order('position', { ascending: true });

    if (objectivesError) {
      console.error(`[courseNewService] 获取学习目标错误: ${objectivesError.message}`);
    }

    // 详细记录学习目标数据，特别关注空数组问题
    console.log(`[courseNewService] 学习目标数据:`, {
      raw: objectivesData,
      count: objectivesData?.length || 0,
      contents: objectivesData?.map(obj => obj.content).slice(0, 2),
      isArray: Array.isArray(objectivesData)
    });
    
    const learning_objectives = objectivesData ? objectivesData.map(obj => obj.content) : null;
    
    // 获取课程要求
    const { data: requirementsData, error: requirementsError } = await supabase
      .from('course_requirements')
      .select('content')
      .eq('course_id', courseId)
      .order('position', { ascending: true });
    
    if (requirementsError) {
      console.error(`[courseNewService] 获取课程要求错误: ${requirementsError.message}`);
    }
    
    // 详细记录课程要求数据，特别关注空数组问题
    console.log(`[courseNewService] 课程要求数据:`, {
      raw: requirementsData,
      count: requirementsData?.length || 0,
      contents: requirementsData?.map(obj => obj.content).slice(0, 2),
      isArray: Array.isArray(requirementsData)
    });
    
    const requirements = requirementsData ? requirementsData.map(obj => obj.content) : null;
    
    // 获取适合人群
    const { data: audiencesData, error: audiencesError } = await supabase
      .from('course_audiences')
      .select('content')
      .eq('course_id', courseId)
      .order('position', { ascending: true });
    
    if (audiencesError) {
      console.error(`[courseNewService] 获取适合人群错误: ${audiencesError.message}`);
    }
    
    // 详细记录适合人群数据，特别关注空数组问题
    console.log(`[courseNewService] 适合人群数据:`, {
      raw: audiencesData,
      count: audiencesData?.length || 0,
      contents: audiencesData?.map(obj => obj.content).slice(0, 2),
      isArray: Array.isArray(audiencesData)
    });
    
    const target_audience = audiencesData ? audiencesData.map(obj => obj.content) : null;
    
    // 获取课程资料
    const { data: materialsData, error: materialsError } = await supabase
      .from('course_materials')
      .select('*')
      .eq('course_id', courseId)
      .order('position', { ascending: true });
    
    if (materialsError) {
      console.error(`[courseNewService] 获取课程资料错误: ${materialsError.message}`);
    }

    // 将所有信息组合到一起
    const courseWithDetails: CourseWithDetails = {
      ...courseData,
      sections,
      learning_objectives,
      requirements,
      target_audience,
      materials: materialsData || []
    };
    
    console.log(`[courseNewService] 完成课程数据组装, 学习目标数量: ${learning_objectives?.length || 0}`);

    return { data: courseWithDetails };
  } catch (error) {
    console.error('[courseNewService] 获取课程详情异常:', error);
    return { error };
  }
};

// 创建新课程
export const createCourseNew = async (courseData: Partial<CourseData>) => {
  try {
    const { data, error } = await supabase
      .from('courses_new')
      .insert([courseData])
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('[courseNewService] 成功创建新课程:', data.id);
    return { data, error: null };
  } catch (error) {
    console.error('[courseNewService] 创建课程失败:', error);
    return { data: null, error };
  }
};

// 更新现有课程
export const updateCourseNew = async (courseId: number, courseData: Partial<CourseData>) => {
  try {
    const { data, error } = await supabase
      .from('courses_new')
      .update(courseData)
      .eq('id', courseId)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('[courseNewService] 成功更新课程:', courseId);
    return { data, error: null };
  } catch (error) {
    console.error('[courseNewService] 更新课程失败:', error);
    return { data: null, error };
  }
};

// 添加事件监听以处理React Query缓存失效
if (typeof window !== 'undefined') {
  window.addEventListener('invalidate-course-cache', (event: any) => {
    const courseId = event?.detail?.courseId;
    if (courseId) {
      console.log(`[courseNewService] 收到缓存失效事件，courseId:`, courseId);
      // 这里不能直接调用useQueryClient().invalidateQueries，因为这会在非React组件环境中使用React Hook
      // 实际实现最好利用库的API转换为实现实时更新，以确保数据一直保持最新
      
      // 为了确保课程详情页显示最新数据，我们可以设置标志位通知需要刷新
      localStorage.setItem('course_cache_invalidated', JSON.stringify({
        courseId, 
        timestamp: Date.now()
      }));
    }
  });
}

// 导出其他可能需要的函数...
