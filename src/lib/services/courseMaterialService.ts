
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { CourseMaterial } from '@/lib/types/course';

interface OrderUpdate {
  id: string;
  position: number;
}

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
    // Generate a unique file path
    const filePath = `course-materials/${courseId}/${uuidv4()}-${fileName}`;
    
    // Upload the file to storage
    const { data: fileData, error: uploadError } = await supabase.storage
      .from('course-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: urlData } = await supabase.storage
      .from('course-files')
      .getPublicUrl(filePath);
      
    // Create a database entry for the material
    const material: CourseMaterial = {
      id: uuidv4(),
      name: fileName,
      url: urlData.publicUrl,
      position,
      course_id: courseId,
      is_visible: false // Default to hidden
    };
    
    const { data, error } = await supabase
      .from('course_materials')
      .insert(material)
      .select()
      .single();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error uploading course material:', error);
    return { data: null, error };
  }
};

// Delete a course material
export const deleteMaterial = async (id: string) => {
  try {
    // First, get the material to get the file URL
    const { data: material, error: fetchError } = await supabase
      .from('course_materials')
      .select('url')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Delete from database
    const { error: deleteError } = await supabase
      .from('course_materials')
      .delete()
      .eq('id', id);
      
    if (deleteError) throw deleteError;

    // Try to delete the file from storage if possible
    // This is optional and we don't want to fail if the file doesn't exist
    if (material?.url) {
      try {
        // Extract the file path from the URL
        const url = new URL(material.url);
        const pathParts = url.pathname.split('/');
        const bucketName = pathParts[1];
        const filePath = pathParts.slice(2).join('/');
        
        await supabase.storage
          .from(bucketName)
          .remove([filePath]);
      } catch (storageError) {
        console.warn('Could not delete file from storage:', storageError);
        // Don't throw error, as the database entry was successfully deleted
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
