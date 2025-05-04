
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types for enrollment guides
export interface EnrollmentGuide {
  id: string;
  course_id: number;
  title: string;
  content: string;
  link?: string;
  guide_type: 'wechat' | 'whatsapp' | 'telegram' | 'qq' | 'other';
  image_url?: string;
  position: number;
  created_at?: string;
  updated_at?: string;
}

// Get all enrollment guides for a course
export const getEnrollmentGuides = async (courseId: number) => {
  try {
    const { data, error } = await supabase
      .from('course_enrollment_guides')
      .select('*')
      .eq('course_id', courseId)
      .order('position', { ascending: true });
      
    if (error) {
      console.error("Error fetching enrollment guides:", error);
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Exception fetching enrollment guides:", error);
    return { data: null, error };
  }
};

// Add a new enrollment guide
export const addEnrollmentGuide = async (guide: Omit<EnrollmentGuide, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('course_enrollment_guides')
      .insert(guide)
      .select()
      .single();
      
    if (error) {
      console.error("Error adding enrollment guide:", error);
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Exception adding enrollment guide:", error);
    return { data: null, error };
  }
};

// Update an enrollment guide
export const updateEnrollmentGuide = async (id: string, updates: Partial<EnrollmentGuide>) => {
  try {
    const { data, error } = await supabase
      .from('course_enrollment_guides')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating enrollment guide:", error);
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Exception updating enrollment guide:", error);
    return { data: null, error };
  }
};

// Delete an enrollment guide
export const deleteEnrollmentGuide = async (id: string) => {
  try {
    const { error } = await supabase
      .from('course_enrollment_guides')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting enrollment guide:", error);
      throw error;
    }
    
    return { error: null };
  } catch (error) {
    console.error("Exception deleting enrollment guide:", error);
    return { error };
  }
};

// Update the position of multiple enrollment guides
export const updateEnrollmentGuideOrder = async (items: { id: string, position: number }[]) => {
  try {
    // Supabase doesn't support bulk updates, so we need to execute multiple updates
    // Use Promise.all to run them in parallel
    const promises = items.map(item => 
      supabase
        .from('course_enrollment_guides')
        .update({ position: item.position })
        .eq('id', item.id)
    );
    
    const results = await Promise.all(promises);
    
    // Check if any of the updates had an error
    const errors = results.filter(result => result.error).map(result => result.error);
    
    if (errors.length > 0) {
      console.error("Errors updating guide positions:", errors);
      return { error: errors[0] };
    }
    
    return { error: null };
  } catch (error) {
    console.error("Exception updating guide positions:", error);
    return { error };
  }
};

// Upload an image for an enrollment guide
export const uploadGuideImage = async (courseId: number, file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `course_guides/${courseId}/${fileName}`;
    
    const { data, error } = await supabase
      .storage
      .from('public')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      console.error("Error uploading guide image:", error);
      throw error;
    }
    
    // Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase
      .storage
      .from('public')
      .getPublicUrl(filePath);
      
    return { data: publicUrl, error: null };
  } catch (error) {
    console.error("Exception uploading guide image:", error);
    return { data: null, error };
  }
};
