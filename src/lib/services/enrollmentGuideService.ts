
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EnrollmentGuide {
  id?: string;
  course_id: number;
  guide_type: 'wechat_qrcode' | 'whatsapp_contact';
  title: string;
  content?: string;
  image_url?: string;
  link?: string;
  position: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch all enrollment guides for a course
 */
export const getEnrollmentGuides = async (courseId: number): Promise<EnrollmentGuide[]> => {
  try {
    const { data, error } = await supabase
      .from('course_enrollment_guides')
      .select('*')
      .eq('course_id', courseId)
      .order('position');

    if (error) {
      throw error;
    }

    return data as EnrollmentGuide[];
  } catch (error) {
    console.error("Error fetching enrollment guides:", error);
    return [];
  }
};

/**
 * Create a new enrollment guide
 */
export const createEnrollmentGuide = async (guide: EnrollmentGuide): Promise<{ success: boolean, data?: EnrollmentGuide, error?: Error }> => {
  try {
    const { data, error } = await supabase
      .from('course_enrollment_guides')
      .insert(guide)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, data: data as EnrollmentGuide };
  } catch (error: any) {
    console.error("Error creating enrollment guide:", error);
    return { success: false, error };
  }
};

/**
 * Update an existing enrollment guide
 */
export const updateEnrollmentGuide = async (guide: EnrollmentGuide): Promise<{ success: boolean, error?: Error }> => {
  if (!guide.id) {
    return { success: false, error: new Error("Guide ID is required for update") };
  }

  try {
    const { error } = await supabase
      .from('course_enrollment_guides')
      .update({
        title: guide.title,
        content: guide.content,
        image_url: guide.image_url,
        link: guide.link,
        position: guide.position,
      })
      .eq('id', guide.id);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating enrollment guide:", error);
    return { success: false, error };
  }
};

/**
 * Delete an enrollment guide
 */
export const deleteEnrollmentGuide = async (guideId: string): Promise<{ success: boolean, error?: Error }> => {
  try {
    const { error } = await supabase
      .from('course_enrollment_guides')
      .delete()
      .eq('id', guideId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting enrollment guide:", error);
    return { success: false, error };
  }
};

/**
 * Update the positions of multiple guides
 */
export const updateGuidesOrder = async (guides: EnrollmentGuide[]): Promise<{ success: boolean, error?: Error }> => {
  try {
    // Create an array of update operations
    const updates = guides.map((guide) => {
      if (!guide.id) return null;
      return supabase
        .from('course_enrollment_guides')
        .update({ position: guide.position })
        .eq('id', guide.id);
    }).filter(Boolean);

    // Execute all updates in parallel
    await Promise.all(updates);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating guides order:", error);
    return { success: false, error };
  }
};

/**
 * Upload a QR code image to storage
 */
export const uploadQRCodeImage = async (courseId: number, file: File): Promise<{ success: boolean, url?: string, error?: Error }> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `qr-codes/${courseId}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('course-materials')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('course-materials')
      .getPublicUrl(filePath);

    return { success: true, url: data.publicUrl };
  } catch (error: any) {
    console.error("Error uploading QR code image:", error);
    return { success: false, error };
  }
};
