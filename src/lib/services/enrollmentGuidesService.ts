
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EnrollmentGuide {
  id?: string;
  course_id: number;
  title: string;
  content?: string;
  guide_type: string;
  image_url?: string;
  link?: string;
  position: number;
}

/**
 * Fetch all enrollment guides for a course
 */
export const getEnrollmentGuides = async (courseId: number) => {
  try {
    const { data, error } = await supabase
      .from('course_enrollment_guides')
      .select('*')
      .eq('course_id', courseId)
      .order('position');

    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching enrollment guides:', error);
    return { data: null, error };
  }
};

/**
 * Add a new enrollment guide
 */
export const addEnrollmentGuide = async (guide: EnrollmentGuide) => {
  try {
    const { data, error } = await supabase
      .from('course_enrollment_guides')
      .insert([guide])
      .select();

    if (error) throw error;
    
    return { data: data[0], error: null };
  } catch (error: any) {
    console.error('Error adding enrollment guide:', error);
    return { data: null, error };
  }
};

/**
 * Update an existing enrollment guide
 */
export const updateEnrollmentGuide = async (id: string, updates: Partial<EnrollmentGuide>) => {
  try {
    const { data, error } = await supabase
      .from('course_enrollment_guides')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    
    return { data: data[0], error: null };
  } catch (error: any) {
    console.error('Error updating enrollment guide:', error);
    return { data: null, error };
  }
};

/**
 * Delete an enrollment guide
 */
export const deleteEnrollmentGuide = async (id: string) => {
  try {
    const { error } = await supabase
      .from('course_enrollment_guides')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting enrollment guide:', error);
    return { success: false, error };
  }
};

/**
 * Update positions of enrollment guides for reordering
 */
export const updateGuidesOrder = async (guides: { id: string; position: number }[]) => {
  try {
    const updates = guides.map(guide => ({
      id: guide.id,
      position: guide.position
    }));

    // Use Promise.all to wait for all updates to complete
    const promises = updates.map(item => 
      supabase
        .from('course_enrollment_guides')
        .update({ position: item.position })
        .eq('id', item.id)
    );

    await Promise.all(promises);
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating guide order:', error);
    return { success: false, error };
  }
};

/**
 * Upload an image for a guide
 */
export const uploadGuideImage = async (courseId: number, file: File): Promise<{ url: string | null; error: any }> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `course_guides/${courseId}/${fileName}`;

    const { error } = await supabase.storage
      .from('public')
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage.from('public').getPublicUrl(filePath);
    
    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { url: null, error };
  }
};

// Platform-specific validation functions
export const validateWeChatGuide = (guide: EnrollmentGuide): string | null => {
  if (!guide.title) return "微信群标题不能为空";
  if (!guide.image_url) return "请上传二维码图片";
  return null;
};

export const validateWhatsAppGuide = (guide: EnrollmentGuide): string | null => {
  if (!guide.title) return "WhatsApp群标题不能为空";
  if (!guide.link && !guide.image_url) return "请提供链接或上传二维码图片";
  return null;
};

export const validateTelegramGuide = (guide: EnrollmentGuide): string | null => {
  if (!guide.title) return "Telegram群标题不能为空";
  if (!guide.link) return "请提供Telegram群链接";
  return null;
};

export const validateQQGuide = (guide: EnrollmentGuide): string | null => {
  if (!guide.title) return "QQ群标题不能为空";
  if (!guide.content && !guide.image_url) return "请提供QQ群号或上传二维码图片";
  return null;
};

export const validateDiscordGuide = (guide: EnrollmentGuide): string | null => {
  if (!guide.title) return "Discord服务器标题不能为空";
  if (!guide.link) return "请提供Discord邀请链接";
  return null;
};

export const validateCustomGuide = (guide: EnrollmentGuide): string | null => {
  if (!guide.title) return "标题不能为空";
  return null;
};

export const validateGuideByType = (guide: EnrollmentGuide): string | null => {
  switch (guide.guide_type) {
    case 'wechat':
      return validateWeChatGuide(guide);
    case 'whatsapp':
      return validateWhatsAppGuide(guide);
    case 'telegram':
      return validateTelegramGuide(guide);
    case 'qq':
      return validateQQGuide(guide);
    case 'discord':
      return validateDiscordGuide(guide);
    case 'custom':
      return validateCustomGuide(guide);
    default:
      return validateCustomGuide(guide);
  }
};

// Get supported platform types
export const PLATFORM_TYPES = [
  { value: 'wechat', label: '微信', icon: 'wechat' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
  { value: 'qq', label: 'QQ', icon: 'qq' },
  { value: 'telegram', label: 'Telegram', icon: 'telegram' },
  { value: 'discord', label: 'Discord', icon: 'discord' },
  { value: 'custom', label: '其他', icon: 'message-circle' }
];
