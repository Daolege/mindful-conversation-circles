
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { CourseMaterial } from '@/lib/types/course';

interface OrderUpdate {
  id: string;
  position: number;
}

// 添加一个安全的文件名处理函数，改进编码处理
const sanitizeFileName = (fileName: string): string => {
  // 保留原文件扩展名
  const lastDot = fileName.lastIndexOf('.');
  const extension = lastDot !== -1 ? fileName.substring(lastDot) : '';
  const baseName = lastDot !== -1 ? fileName.substring(0, lastDot) : fileName;
  
  try {
    // 移除潜在的不安全字符，保留中文和英文字符
    const sanitizedBaseName = baseName
      .replace(/[^\w\u4e00-\u9fa5\-\. ]/g, '') // 只保留字母、数字、中文、连字符、点和空格
      .trim();
    
    // 如果处理后名称为空，提供默认名称
    const finalBaseName = sanitizedBaseName || 'file';
    
    return `${finalBaseName}${extension}`;
  } catch (error) {
    console.error('文件名处理错误:', error);
    // 提供一个后备文件名
    return `file-${Date.now()}${extension}`;
  }
};

// 增强错误处理的文件URL解析函数
const parseFilePathFromUrl = (url: string): {bucketName: string, filePath: string} | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // 解析存储桶名称和文件路径
    // 路径格式通常是 /storage/v1/object/public/bucket-name/file-path
    if (pathParts.length >= 5 && pathParts[1] === 'storage' && pathParts[2] === 'v1') {
      const bucketName = pathParts[4]; // 通常是 'course-files'
      const filePath = pathParts.slice(5).join('/');
      return { bucketName, filePath };
    }
    
    console.warn('无法从URL解析存储路径:', url);
    return null;
  } catch (error) {
    console.error('解析文件URL错误:', error);
    return null;
  }
};

// Get course materials with improved error handling
export const getCourseMaterials = async (courseId: number) => {
  try {
    console.log(`[getCourseMaterials] 获取课程ID ${courseId} 的材料`);
    const { data, error } = await supabase
      .from('course_materials')
      .select('*')
      .eq('course_id', courseId)
      .order('position');

    if (error) {
      console.error('[getCourseMaterials] 错误:', error);
    } else {
      console.log(`[getCourseMaterials] 成功获取 ${data?.length || 0} 个材料项`);
    }

    return { data: data as CourseMaterial[], error };
  } catch (error) {
    console.error('[getCourseMaterials] 异常:', error);
    return { data: null, error };
  }
};

// Get only material metadata (name and visibility) without URLs
export const getMaterialsMetadata = async (courseId: number) => {
  try {
    console.log(`[getMaterialsMetadata] 获取课程ID ${courseId} 的材料元数据`);
    const { data, error } = await supabase
      .from('course_materials')
      .select('id, name, position, is_visible')
      .eq('course_id', courseId)
      .order('position');

    if (error) {
      console.error('[getMaterialsMetadata] 错误:', error);
    } else {
      console.log(`[getMaterialsMetadata] 成功获取 ${data?.length || 0} 个材料项元数据`);
    }

    return { data, error };
  } catch (error) {
    console.error('[getMaterialsMetadata] 异常:', error);
    return { data: null, error };
  }
};

// Upload a new course material with enhanced error handling and logging
export const uploadCourseMaterial = async (
  courseId: number,
  file: File,
  fileName: string,
  position: number
) => {
  try {
    console.log(`[uploadCourseMaterial] 开始上传文件 "${fileName}" 到课程 ${courseId}`);
    console.log(`[uploadCourseMaterial] 文件信息: 大小=${file.size} bytes, 类型=${file.type}`);
    
    // 处理文件名，确保安全并记录处理前后的变化
    const originalFileName = fileName;
    const safeFileName = sanitizeFileName(fileName);
    
    if (originalFileName !== safeFileName) {
      console.log(`[uploadCourseMaterial] 文件名已清理: "${originalFileName}" -> "${safeFileName}"`);
    }
    
    // 使用课程ID作为文件夹名称，并添加UUID前缀以防止冲突
    const uniqueId = uuidv4();
    const filePath = `${courseId}/${uniqueId}-${safeFileName}`;
    
    console.log(`[uploadCourseMaterial] 上传文件到路径: "${filePath}"`);
    
    // 上传文件到存储，添加更详细的错误处理
    const { data: fileData, error: uploadError } = await supabase.storage
      .from('course-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) {
      console.error(`[uploadCourseMaterial] 上传错误: 消息="${uploadError.message}"`);
      console.error('[uploadCourseMaterial] 详细错误信息:', uploadError);
      
      // 提供更具体的错误消息
      let errorMessage = `文件上传失败: ${uploadError.message}`;
      
      // 根据错误信息提供更具体的错误提示
      if (uploadError.message?.includes('404')) {
        errorMessage = '存储桶未找到，请联系管理员检查"course-files"存储桶是否存在';
      } else if (uploadError.message?.includes('403')) {
        errorMessage = '无权访问存储桶，请检查存储权限设置';
      } else if (uploadError.message?.includes('Invalid key')) {
        errorMessage = '文件路径无效，可能是文件名包含特殊字符或编码问题';
      }
      
      throw new Error(errorMessage);
    }
    
    console.log(`[uploadCourseMaterial] 文件上传成功: ${filePath}`);
    
    // 获取公开URL
    const { data: urlData } = await supabase.storage
      .from('course-files')
      .getPublicUrl(filePath);
    
    if (!urlData || !urlData.publicUrl) {
      console.error('[uploadCourseMaterial] 无法获取文件公开URL');
      throw new Error('无法获取文件公开URL，请检查存储配置');
    }
    
    console.log(`[uploadCourseMaterial] 获取到公开URL: ${urlData.publicUrl}`);
      
    // 为文件创建数据库条目
    const material: CourseMaterial = {
      id: uuidv4(),
      name: fileName, // 保留原始文件名用于显示
      url: urlData.publicUrl,
      position,
      course_id: courseId,
      is_visible: false // 默认隐藏
    };
    
    const { data, error } = await supabase
      .from('course_materials')
      .insert(material)
      .select()
      .single();
      
    if (error) {
      console.error('[uploadCourseMaterial] 创建材料记录错误:', error);
      throw error;
    }
    
    console.log('[uploadCourseMaterial] 材料记录创建成功:', data);
    return { data, error: null };
  } catch (error) {
    console.error('[uploadCourseMaterial] 异常:', error);
    return { data: null, error };
  }
};

// Delete a course material with enhanced error handling and logging
export const deleteMaterial = async (id: string) => {
  try {
    console.log(`[deleteMaterial] 开始删除材料 ID: ${id}`);
    
    // 首先获取材料信息以获取文件URL
    const { data: material, error: fetchError } = await supabase
      .from('course_materials')
      .select('url')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      console.error(`[deleteMaterial] 获取材料信息失败: ${fetchError.message}`);
      throw fetchError;
    }
    
    console.log(`[deleteMaterial] 获取到材料URL: ${material?.url || 'undefined'}`);
    
    // 从数据库删除
    const { error: deleteError } = await supabase
      .from('course_materials')
      .delete()
      .eq('id', id);
      
    if (deleteError) {
      console.error(`[deleteMaterial] 从数据库删除材料失败: ${deleteError.message}`);
      throw deleteError;
    }
    
    console.log(`[deleteMaterial] 材料记录已从数据库中删除`);

    // 尝试从存储中删除文件（如果可能的话）
    if (material?.url) {
      try {
        const parsedPath = parseFilePathFromUrl(material.url);
        
        if (parsedPath) {
          console.log(`[deleteMaterial] 尝试从存储中删除文件: ${parsedPath.bucketName}/${parsedPath.filePath}`);
          
          const { error: storageError } = await supabase.storage
            .from(parsedPath.bucketName)
            .remove([parsedPath.filePath]);
            
          if (storageError) {
            console.warn(`[deleteMaterial] 存储删除警告: ${storageError.message}`);
          } else {
            console.log(`[deleteMaterial] 文件已从存储中删除`);
          }
        }
      } catch (storageError) {
        console.warn('[deleteMaterial] 无法从存储中删除文件:', storageError);
        // 不抛出错误，因为数据库条目已成功删除
      }
    }
    
    console.log(`[deleteMaterial] 材料删除成功完成`);
    return { error: null };
  } catch (error) {
    console.error('[deleteMaterial] 异常:', error);
    return { error };
  }
};

// Update material order
export const updateMaterialOrder = async (updates: OrderUpdate[]) => {
  try {
    const updatePromises = updates.map(update => 
      supabase
        .from('course_materials')
        .update({ position: update.position })
        .eq('id', update.id)
    );
    
    await Promise.all(updatePromises);
    
    return { error: null };
  } catch (error) {
    console.error('Error updating material order:', error);
    return { error };
  }
};

// Update visibility of all materials for a course
export const updateMaterialsVisibility = async (courseId: number, isVisible: boolean) => {
  try {
    const { error } = await supabase
      .from('course_materials')
      .update({ is_visible: isVisible })
      .eq('course_id', courseId);
    
    return { error };
  } catch (error) {
    console.error('Error updating materials visibility:', error);
    return { error };
  }
};

// Update a material's name
export const updateMaterialName = async (id: string, name: string) => {
  try {
    const { error } = await supabase
      .from('course_materials')
      .update({ name })
      .eq('id', id);
    
    return { error };
  } catch (error) {
    console.error('Error updating material name:', error);
    return { error };
  }
};
