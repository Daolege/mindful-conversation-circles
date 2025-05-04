
import { supabase } from '@/integrations/supabase/client';

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

interface GuideOrderUpdate {
  id: string;
  position: number;
}

export const PLATFORM_TYPES = [
  { value: 'wechat', label: '微信群', icon: 'message-circle' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'message-circle' },
  { value: 'qq', label: 'QQ群', icon: 'message-circle' },
  { value: 'telegram', label: 'Telegram', icon: 'message-circle' },
  { value: 'discord', label: 'Discord', icon: 'message-circle' },
  { value: 'custom', label: '自定义', icon: 'link' },
];

export const getEnrollmentGuides = async (courseId: number) => {
  try {
    const { data, error } = await supabase
      .from('course_enrollment_guides')
      .select('*')
      .eq('course_id', courseId)
      .order('position');
    
    return { data, error };
  } catch (err) {
    console.error('Error getting enrollment guides:', err);
    return { data: null, error: err };
  }
};

export const addEnrollmentGuide = async (guide: EnrollmentGuide) => {
  try {
    const { data, error } = await supabase
      .from('course_enrollment_guides')
      .insert([guide])
      .select();
    
    return { data: data?.[0] as EnrollmentGuide, error };
  } catch (err) {
    console.error('Error adding enrollment guide:', err);
    return { data: null, error: err };
  }
};

export const updateEnrollmentGuide = async (id: string, guide: Partial<EnrollmentGuide>) => {
  try {
    const { data, error } = await supabase
      .from('course_enrollment_guides')
      .update(guide)
      .eq('id', id)
      .select();
    
    return { data: data?.[0] as EnrollmentGuide, error };
  } catch (err) {
    console.error('Error updating enrollment guide:', err);
    return { data: null, error: err };
  }
};

export const deleteEnrollmentGuide = async (id: string) => {
  try {
    const { error } = await supabase
      .from('course_enrollment_guides')
      .delete()
      .eq('id', id);
    
    return { success: !error, error };
  } catch (err) {
    console.error('Error deleting enrollment guide:', err);
    return { success: false, error: err };
  }
};

export const updateGuidesOrder = async (guides: GuideOrderUpdate[]) => {
  try {
    // Use Promise.all to handle all updates concurrently
    const promises = guides.map(guide => 
      supabase
        .from('course_enrollment_guides')
        .update({ position: guide.position })
        .eq('id', guide.id)
    );
    
    await Promise.all(promises);
    return { success: true, error: null };
  } catch (err) {
    console.error('Error updating guides order:', err);
    return { success: false, error: err };
  }
};

export const uploadGuideImage = async (courseId: number, file: File) => {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `course_guides/${courseId}/${fileName}`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file);
    
    if (uploadError) {
      throw uploadError;
    }
    
    // Get URL
    const { data } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);
    
    return { url: data.publicUrl, error: null };
  } catch (err) {
    console.error('Error uploading guide image:', err);
    return { url: null, error: err };
  }
};

export const validateGuideByType = (guide: EnrollmentGuide): string | null => {
  if (!guide.title.trim()) {
    return '请输入标题';
  }
  
  switch (guide.guide_type) {
    case 'wechat':
      if (!guide.image_url) {
        return '请上传微信群二维码';
      }
      break;
      
    case 'whatsapp':
      if (!guide.link && !guide.image_url) {
        return '请提供WhatsApp群链接或二维码';
      }
      break;
      
    case 'telegram':
      if (!guide.link) {
        return '请提供Telegram群链接';
      }
      break;
      
    case 'discord':
      if (!guide.link) {
        return '请提供Discord邀请链接';
      }
      break;
  }
  
  return null;
};
