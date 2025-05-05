
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { CourseMaterial } from '@/lib/types/course';

interface OrderUpdate {
  id: string;
  position: number;
}

// 添加一个安全的文件名处理函数
const sanitizeFileName = (fileName: string): string => {
  // 保留原文件扩展名
  const lastDot = fileName.lastIndexOf('.');
  const extension = lastDot !== -1 ? fileName.substring(lastDot) : '';
  const baseName = lastDot !== -1 ? fileName.substring(0, lastDot) : fileName;
  
  // 移除潜在的不安全字符，保留中文和英文字符
  const sanitizedBaseName = baseName
    .replace(/[^\w\u4e00-\u9fa5\-\. ]/g, '') // 只保留字母、数字、中文、连字符、点和空格
    .trim();
  
  // 如果处理后名称为空，提供默认名称
  const finalBaseName = sanitizedBaseName || 'file';
  
  return `${finalBaseName}${extension}`;
};

// Get course materials
export const getCourseMaterials = async (courseId: number) => {
  try {
    const { data, error } = await supabase
      .from('course_materials')
      .select('*')
      .eq('course_id', courseId)
      .order('position');

    return { data: data as CourseMaterial[], error };
  } catch (error) {
    console.error('Error fetching course materials:', error);
    return { data: null, error };
  }
};

// Get only material metadata (name and visibility) without URLs
export const getMaterialsMetadata = async (courseId: number) => {
  try {
    const { data, error } = await supabase
      .from('course_materials')
      .select('id, name, position, is_visible')
      .eq('course_id', courseId)
      .order('position');

    return { data, error };
  } catch (error) {
    console.error('Error fetching materials metadata:', error);
    return { data: null, error };
  }
};

// Upload a new course material
export const uploadCourseMaterial = async (
  courseId: number,
  file: File,
  fileName: string,
  position: number
) => {
  try {
    // 处理文件名，确保安全
    const safeFileName = sanitizeFileName(fileName);
    
    // 修改：使用正确的文件路径格式，去掉错误的前缀 'course-materials'
    // 使用课程ID作为文件夹名称，增强组织性
    const filePath = `${courseId}/${uuidv4()}-${safeFileName}`;
    
    console.log(`[courseMaterialService] 上传文件到路径: ${filePath}`);
    
    // 上传文件到存储
    const { data: fileData, error: uploadError } = await supabase.storage
      .from('course-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) {
      console.error('[courseMaterialService] 上传错误:', uploadError);
      throw new Error(`文件上传失败: ${uploadError.message}`);
    }
    
    // 获取公开URL
    const { data: urlData } = await supabase.storage
      .from('course-files')
      .getPublicUrl(filePath);
    
    if (!urlData || !urlData.publicUrl) {
      throw new Error('无法获取文件公开URL');
    }
    
    console.log(`[courseMaterialService] 获取到公开URL: ${urlData.publicUrl}`);
      
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
      console.error('[courseMaterialService] 创建材料记录错误:', error);
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error uploading course material:', error);
    return { data: null, error };
  }
};

// Delete a course material
export const deleteMaterial = async (id: string) => {
  try {
    // 首先获取材料信息以获取文件URL
    const { data: material, error: fetchError } = await supabase
      .from('course_materials')
      .select('url')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;
    
    // 从数据库删除
    const { error: deleteError } = await supabase
      .from('course_materials')
      .delete()
      .eq('id', id);
      
    if (deleteError) throw deleteError;

    // 尝试从存储中删除文件（如果可能的话）
    // 这是可选的，如果文件不存在我们不希望失败
    if (material?.url) {
      try {
        // 从URL中提取文件路径
        const url = new URL(material.url);
        const pathParts = url.pathname.split('/');
        
        // 解析存储桶名称和文件路径
        // 路径格式通常是 /storage/v1/object/public/bucket-name/file-path
        let bucketName, filePath;
        
        if (pathParts.length >= 5 && pathParts[1] === 'storage' && pathParts[2] === 'v1') {
          bucketName = pathParts[4]; // 通常是 'course-files'
          filePath = pathParts.slice(5).join('/');
        } else {
          // 兼容性处理，如果URL格式不符合预期
          console.warn('无法从URL解析存储路径:', material.url);
          return { error: null }; // 仍然认为删除成功，因为数据库记录已删除
        }
        
        console.log(`[courseMaterialService] 尝试从存储中删除文件: ${bucketName}/${filePath}`);
        
        await supabase.storage
          .from(bucketName)
          .remove([filePath]);
      } catch (storageError) {
        console.warn('无法从存储中删除文件:', storageError);
        // 不抛出错误，因为数据库条目已成功删除
      }
    }
    
    return { error: null };
  } catch (error) {
    console.error('Error deleting material:', error);
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
