
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// 添加方便的诊断功能
export const debugHomeworkTable = async () => {
  try {
    console.log('homeworkService: Starting homework table diagnostics');
    
    // 检查表结构
    const { data: tableInfo, error: tableError } = await supabase
      .from('homework')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('homeworkService: Diagnostic error:', tableError);
      return { data: null, error: tableError };
    }
    
    console.log('homeworkService: Homework table structure:', tableInfo ? 'has data' : 'table is empty');
    
    // 获取作业总数
    const { count, error: countError } = await supabase
      .from('homework')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('homeworkService: Error getting count:', countError);
      return { data: null, error: countError };
    }
    
    console.log('homeworkService: Current homework table has', count, 'records');
    
    // 检查特定课程是否存在
    const { data: courseCheck, error: courseError } = await supabase
      .from('courses_new')
      .select('id')
      .limit(5);

    if (!courseError) {
      console.log('homeworkService: Course check result:', courseCheck && courseCheck.length > 0 ? 'courses exist' : 'no courses found');
      if (courseCheck && courseCheck.length > 0) {
        console.log('homeworkService: First 5 course IDs found:', courseCheck.map(c => c.id));
      }
    } else {
      console.log('homeworkService: Course check error:', courseError);
    }
    
    return { success: true, count };
  } catch (err: any) {
    console.error('homeworkService: Diagnostic failed:', err);
    return { success: false, error: err };
  }
};

// 完全重构的保存作业函数，确保课程ID有效
export const saveHomework = async (homeworkData: {
  title: string;
  description?: string;
  type: 'single_choice' | 'multiple_choice' | 'fill_blank';
  options?: any;
  lecture_id: string;
  course_id: number | null | undefined;
  id?: string; // 添加ID字段以区分创建和更新
}) => {
  try {
    console.log('homeworkService: Starting homework save with raw data:', homeworkData);
    console.log('homeworkService: Raw course_id:', homeworkData.course_id, 'type:', typeof homeworkData.course_id);
    
    // 确保必填字段都存在
    if (!homeworkData.title) {
      console.error('homeworkService: Missing required title');
      return { data: null, error: new Error('标题不能为空') };
    }
    
    if (!homeworkData.type) {
      console.error('homeworkService: Missing required type');
      return { data: null, error: new Error('作业类型不能为空') };
    }
    
    if (!homeworkData.lecture_id) {
      console.error('homeworkService: Missing required lecture_id');
      return { data: null, error: new Error('课时ID不能为空') };
    }

    // 课程ID的详细验证与转换 - 关键修复
    if (homeworkData.course_id === null || homeworkData.course_id === undefined) {
      console.error('homeworkService: course_id is null/undefined');
      return { data: null, error: new Error('课程ID不能为空') };
    }
    
    // 统一将course_id转换为数字类型 
    let courseId: number;
    
    // 如果直接是数字，直接使用
    if (typeof homeworkData.course_id === 'number') {
      courseId = homeworkData.course_id;
    } 
    // 如果是字符串，尝试转换为数字
    else if (typeof homeworkData.course_id === 'string') {
      courseId = parseInt(homeworkData.course_id, 10);
      if (isNaN(courseId)) {
        console.error('homeworkService: Invalid course ID string:', homeworkData.course_id);
        return { data: null, error: new Error('课程ID必须是有效数字') };
      }
    } 
    // 如果是对象，尝试从中提取值
    else if (typeof homeworkData.course_id === 'object' && homeworkData.course_id !== null) {
      try {
        const objValue = homeworkData.course_id as Record<string, any>;
        
        if ('value' in objValue && objValue.value !== null && objValue.value !== undefined) {
          courseId = parseInt(String(objValue.value), 10);
          if (isNaN(courseId)) {
            console.error('homeworkService: Cannot extract valid course ID from object:', objValue);
            return { data: null, error: new Error('课程ID对象格式无效') };
          }
        } else {
          // 尝试找到对象中的数值
          const possibleValue = Object.values(objValue).find(v => 
            v !== null && v !== undefined && !isNaN(Number(v))
          );
          
          if (possibleValue !== undefined) {
            courseId = Number(possibleValue);
          } else {
            console.error('homeworkService: Invalid object format:', objValue);
            return { data: null, error: new Error('课程ID对象格式无效') };
          }
        }
      } catch (err) {
        console.error('homeworkService: Error extracting course ID from object:', err);
        return { data: null, error: new Error('处理课程ID对象时出错') };
      }
    } 
    // 任何其他情况，报错
    else {
      console.error('homeworkService: course_id type invalid:', typeof homeworkData.course_id, homeworkData.course_id);
      return { data: null, error: new Error('课程ID类型无效') };
    }
    
    // 最后验证数字是否有效
    if (!courseId || isNaN(courseId) || courseId <= 0) {
      console.error('homeworkService: Final course ID validation failed:', courseId);
      return { data: null, error: new Error(`无效的课程ID值: ${courseId}`) };
    }
    
    console.log('homeworkService: Validated course ID:', courseId, typeof courseId);
    
    // 增强型课程验证，包含详细日志
    console.log('homeworkService: Verifying course existence in courses_new table, ID:', courseId);
    const courseCheckResult = await supabase
      .from('courses_new')
      .select('id, title')
      .eq('id', courseId)
      .maybeSingle(); // 改用maybeSingle避免错误
      
    if (courseCheckResult.error) {
      console.error('homeworkService: Course existence check failed:', {
        courseId,
        error: courseCheckResult.error
      });
      
      return { 
        data: null, 
        error: new Error(`验证课程时出错: ${courseCheckResult.error.message}`) 
      };
    }
    
    if (!courseCheckResult.data) {
      console.error('homeworkService: Course ID does not exist in courses_new table:', courseId);
      return { 
        data: null, 
        error: new Error(`课程ID ${courseId} 不存在于courses_new表中，请确认课程已创建`) 
      };
    }
    
    console.log('homeworkService: Course exists in courses_new, proceeding with save:', courseCheckResult.data);
    
    // 确保options是有效的JSON对象
    let processedOptions = homeworkData.options || {};
    
    // 如果options是字符串，尝试解析为JSON
    if (typeof processedOptions === 'string') {
      try {
        processedOptions = JSON.parse(processedOptions);
      } catch (e) {
        console.error('homeworkService: Invalid JSON in options:', processedOptions);
        // 如果解析失败，创建一个简单对象，将字符串作为内容
        processedOptions = { content: processedOptions };
      }
    }
    
    // 准备要保存的数据，确保所有类型都正确
    const dataToSave = {
      title: homeworkData.title,
      description: homeworkData.description || '',
      type: homeworkData.type,
      lecture_id: homeworkData.lecture_id,
      course_id: courseId, // 使用验证后的课程ID
      options: processedOptions
    };
    
    console.log('homeworkService: Final data to save:', dataToSave);
    
    let result;
    try {
      if (homeworkData.id) {
        // 更新现有作业
        const { id, ...updateData } = { ...dataToSave, id: homeworkData.id };
        console.log('homeworkService: Updating existing homework:', id);
        
        result = await supabase
          .from('homework')
          .update(updateData)
          .eq('id', id)
          .select();
      } else {
        // 创建新作业
        console.log('homeworkService: Creating new homework');
        
        result = await supabase
          .from('homework')
          .insert(dataToSave)
          .select();
      }
      
      if (result.error) {
        console.error('homeworkService: Database operation failed:', result.error);
        
        // 检查外键错误
        if (result.error.code === '23503') {
          return { 
            data: null, 
            error: new Error(`外键约束错误: 课程ID ${courseId} 在courses_new表中不存在，请确认course_id是否正确`) 
          };
        }
        
        return { 
          data: null, 
          error: new Error(`${homeworkData.id ? '更新' : '创建'}作业失败: ${result.error.message}`) 
        };
      }
      
      console.log('homeworkService: Operation successful:', result.data);
      return { data: result.data, error: null };
      
    } catch (dbError: any) {
      console.error('homeworkService: Database operation exception:', dbError);
      return { 
        data: null, 
        error: new Error(`数据库操作错误: ${dbError.message || '未知数据库错误'}`) 
      };
    }
  } catch (err: any) {
    console.error('homeworkService: Unexpected error in saveHomework:', err);
    return { data: null, error: new Error(`保存作业时发生错误: ${err.message || '未知错误'}`) };
  }
};

export const getHomeworksByLectureId = async (lectureId: string) => {
  try {
    console.log('homeworkService: Fetching homeworks for lecture ID:', lectureId);
    if (!lectureId) {
      console.error('homeworkService: Invalid lecture ID provided');
      throw new Error('课时ID不能为空');
    }
    
    // 获取实际数据
    const { data, error } = await supabase
      .from('homework')
      .select('*')
      .eq('lecture_id', lectureId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('homeworkService: Error fetching homeworks:', error);
      throw new Error(`获取作业列表失败: ${error.message}`);
    }
    
    console.log('homeworkService: Fetched homeworks:', data?.length || 0, 'items');
    if (data && data.length > 0) {
      console.log('homeworkService: First homework sample:', {
        id: data[0].id,
        title: data[0].title,
        type: data[0].type,
        course_id: data[0].course_id
      });
    } else {
      console.log('homeworkService: 未找到作业数据');
    }
    return { data, error: null };
  } catch (err: any) {
    console.error('homeworkService: 获取作业列表失败:', err);
    return { data: null, error: err };
  }
};

export const deleteHomework = async (homeworkId: string) => {
  try {
    console.log('homeworkService: Deleting homework:', homeworkId);
    if (!homeworkId) {
      console.error('homeworkService: 无效的作业ID');
      throw new Error('无效的作业ID');
    }
    
    const { error } = await supabase
      .from('homework')
      .delete()
      .eq('id', homeworkId);
      
    if (error) {
      console.error('homeworkService: Error deleting homework:', error);
      throw new Error(`删除作业失败: ${error.message}`);
    }
    
    console.log('homeworkService: Homework deleted successfully');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('homeworkService: 删除作业失败:', err);
    return { success: false, error: err };
  }
};

export const updateHomework = async (
  homeworkId: string,
  updates: Partial<{
    title: string;
    description?: string;
    type: 'single_choice' | 'multiple_choice' | 'fill_blank';
    options?: any;
  }>
) => {
  try {
    console.log('homeworkService: Updating homework:', homeworkId, updates);
    if (!homeworkId || Object.keys(updates).length === 0) {
      console.error('homeworkService: 无效的作业ID或更新内容为空');
      throw new Error('无效的更新请求');
    }
    
    const { data, error } = await supabase
      .from('homework')
      .update(updates)
      .eq('id', homeworkId)
      .select();
      
    if (error) {
      console.error('homeworkService: Error updating homework:', error);
      throw new Error(`更新作业失败: ${error.message}`);
    }
    
    console.log('homeworkService: Homework updated successfully:', data);
    return { data, error: null };
  } catch (err: any) {
    console.error('homeworkService: 更新作业失败:', err);
    return { data: null, error: err };
  }
};
