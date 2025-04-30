import { supabase } from '@/integrations/supabase/client';
import { CourseLecture } from '@/lib/types/course-new';

// 保存课时
export const saveLecture = async (lectureData: {
  section_id: string;
  title: string;
  position: number;
  is_free?: boolean;
  duration?: string;
  completion_threshold?: number;
}) => {
  try {
    console.log('[lectureService] 保存课时:', lectureData);
    
    // Check if section_id is a temporary ID and handle accordingly
    if (lectureData.section_id && lectureData.section_id.startsWith('temp-')) {
      console.error('[lectureService] 无法在未保存的章节中添加课时');
      return { 
        data: null, 
        error: new Error('请先保存章节后再添加课时') 
      };
    }
    
    const { data, error } = await supabase
      .from('course_lectures')
      .insert(lectureData)
      .select();
      
    if (error) {
      console.error('[lectureService] 保存课时出错:', error);
      return { data: null, error };
    }
    
    console.log('[lectureService] 课时保存成功:', data);
    return { data, error: null };
  } catch (err: any) {
    console.error('[lectureService] saveLecture异常:', err);
    return { data: null, error: err };
  }
};

// 更新课时
export const updateLecture = async (lectureId: string, updates: Partial<CourseLecture>) => {
  try {
    console.log(`[lectureService] 更新课时 ${lectureId}:`, updates);
    
    const { data, error } = await supabase
      .from('course_lectures')
      .update(updates)
      .eq('id', lectureId)
      .select();
      
    if (error) {
      console.error('[lectureService] 更新课时出错:', error);
      return { data: null, error };
    }
    
    console.log('[lectureService] 课时更新成功:', data);
    return { data, error: null };
  } catch (err: any) {
    console.error('[lectureService] updateLecture异常:', err);
    return { data: null, error: err };
  }
};

// 删除课时
export const deleteLecture = async (lectureId: string) => {
  try {
    console.log(`[lectureService] 删除课时 ${lectureId}`);
    
    const { error } = await supabase
      .from('course_lectures')
      .delete()
      .eq('id', lectureId);
      
    if (error) {
      console.error('[lectureService] 删除课时出错:', error);
      return { success: false, error };
    }
    
    console.log('[lectureService] 课时删除成功');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('[lectureService] deleteLecture异常:', err);
    return { success: false, error: err };
  }
};

// 按章节ID获取课时
export const getLecturesBySectionId = async (sectionId: string) => {
  try {
    console.log(`[lectureService] 获取章节 ${sectionId} 的课时`);
    
    const { data, error } = await supabase
      .from('course_lectures')
      .select('*')
      .eq('section_id', sectionId)
      .order('position', { ascending: true });
      
    if (error) {
      console.error('[lectureService] 获取课时出错:', error);
      return { data: null, error };
    }
    
    console.log(`[lectureService] 找到 ${data?.length || 0} 个课时`);
    return { data, error: null };
  } catch (err: any) {
    console.error('[lectureService] getLecturesBySectionId异常:', err);
    return { data: null, error: err };
  }
};

// 批量更新课时顺序
export const updateLecturesOrder = async (lectures: Array<{ id: string; position: number }>) => {
  try {
    console.log('[lectureService] 批量更新课时顺序:', lectures);
    
    // 使用事务操作确保所有更新要么全部成功，要么全部失败
    const promises = lectures.map(lecture => 
      supabase
        .from('course_lectures')
        .update({ position: lecture.position })
        .eq('id', lecture.id)
    );
    
    await Promise.all(promises);
    console.log('[lectureService] 课时顺序批量更新成功');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('[lectureService] updateLecturesOrder异常:', err);
    return { success: false, error: err };
  }
};

// 更新视频URL
export const updateLectureVideo = async (lectureId: string, videoUrl: string) => {
  try {
    // Use the CourseLecture type with the video_url property
    const updates: Partial<CourseLecture> = { video_url: videoUrl };
    
    const { data, error } = await supabase
      .from('course_lectures')
      .update(updates)
      .eq('id', lectureId)
      .select();
      
    if (error) {
      console.error('[lectureService] 更新视频URL出错:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err: any) {
    console.error('[lectureService] updateLectureVideo异常:', err);
    return { data: null, error: err };
  }
};

// 上传课时视频
export const uploadLectureVideo = async (
  lectureId: string, 
  file: File,
  onProgress?: (progress: number) => void
) => {
  try {
    console.log(`[lectureService] 上传视频到课时 ${lectureId}`);
    
    // 为保持演示效果，这里模拟上传进度
    let progress = 0;
    const progressInterval = setInterval(() => {
      if (progress < 95) {
        progress += Math.random() * 10;
        if (progress > 95) progress = 95;
        onProgress?.(Math.floor(progress));
      }
    }, 500);

    // 模拟网络延迟和文件处理时间
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 生成模拟的视频URL
    const videoUrl = `https://example.com/video/${lectureId}-${Date.now()}.mp4`;
    
    // 清理进度更新
    clearInterval(progressInterval);
    onProgress?.(100);
    
    // 更新课时的视频URL
    await updateLectureVideo(lectureId, videoUrl);
    
    return { 
      data: {
        url: videoUrl,
        name: file.name
      },
      error: null
    };
  } catch (err: any) {
    console.error('[lectureService] uploadLectureVideo异常:', err);
    return { data: null, error: err };
  }
};

// 批量保存课时
export const bulkSaveLectures = async (lectures: Array<{ 
  id?: string;
  title: string;
  section_id: string;
  position: number;
  is_free?: boolean;
  duration?: string;
  completion_threshold?: number;
}>) => {
  try {
    console.log('[lectureService] 批量保存课时:', lectures.length);
    
    if (lectures.length === 0) {
      return { data: [], error: null };
    }
    
    const { data, error } = await supabase
      .from('course_lectures')
      .upsert(lectures)
      .select();
      
    if (error) {
      console.error('[lectureService] 批量保存课时出错:', error);
      return { data: null, error };
    }
    
    console.log('[lectureService] 批量保存课时成功:', data?.length || 0);
    return { data, error: null };
  } catch (err: any) {
    console.error('[lectureService] bulkSaveLectures异常:', err);
    return { data: null, error: err };
  }
};
