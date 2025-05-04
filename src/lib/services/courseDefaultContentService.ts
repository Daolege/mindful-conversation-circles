
import { supabase } from "@/integrations/supabase/client";
import { ListItem } from '@/lib/types/course-new';
import { v4 as uuidv4 } from 'uuid';

// Default learning objectives
const defaultLearningObjectives: Omit<ListItem, 'id'>[] = [
  { text: "品牌出海全案策划", position: 0, is_visible: true, icon: "target" },
  { text: "国货出海全流程掌握", position: 1, is_visible: true, icon: "target" },
  { text: "行业圈子完整开放", position: 2, is_visible: true, icon: "target" },
  { text: "本土化运营实战训练", position: 3, is_visible: true, icon: "target" },
  { text: "各类跨境纠纷与应对", position: 4, is_visible: true, icon: "target" },
  { text: "本土市场运营套路传授", position: 5, is_visible: true, icon: "target" }
];

// Default learning modes (renamed from 课程要求 to 学习模式)
const defaultLearningModes: Omit<ListItem, 'id'>[] = [
  { text: "在线精录视频+直播", position: 0, is_visible: true, icon: "video" },
  { text: "周周诊断+1v1指导", position: 1, is_visible: true, icon: "video" },
  { text: "一线店铺运营官亲授", position: 2, is_visible: true, icon: "video" },
  { text: "私域疑问秒解,问题不过夜", position: 3, is_visible: true, icon: "video" },
  { text: "私域小组开放式交流", position: 4, is_visible: true, icon: "video" },
  { text: "困难户帮协解决模式", position: 5, is_visible: true, icon: "video" }
];

// Default target audience
const defaultTargetAudience: Omit<ListItem, 'id'>[] = [
  { text: "个人或供应链企业", position: 0, is_visible: true, icon: "users" },
  { text: "具备货源优势着更佳", position: 1, is_visible: true, icon: "users" },
  { text: "转型或搞副业的人群", position: 2, is_visible: true, icon: "users" },
  { text: "有决心搞钱搞流量的", position: 3, is_visible: true, icon: "users" },
  { text: "搞钱恨人或职业收割者", position: 4, is_visible: true, icon: "users" },
  { text: "数字游民爱好者", position: 5, is_visible: true, icon: "users" },
  { text: "对抗型规则爱好者", position: 6, is_visible: true, icon: "users" }
];

// Helper function to convert default items to ListItem array with IDs
const createDefaultListItems = (defaults: Omit<ListItem, 'id'>[]): ListItem[] => {
  return defaults.map(item => ({
    ...item,
    id: `default-${uuidv4()}`
  }));
};

// Function to get default learning objectives
export const getDefaultLearningObjectives = (): ListItem[] => {
  return createDefaultListItems(defaultLearningObjectives);
};

// Function to get default learning modes (requirements)
export const getDefaultLearningModes = (): ListItem[] => {
  return createDefaultListItems(defaultLearningModes);
};

// Function to get default target audience
export const getDefaultTargetAudience = (): ListItem[] => {
  return createDefaultListItems(defaultTargetAudience);
};

// Function to save section configuration for a course
export const saveSectionConfig = async (
  courseId: number,
  sectionType: 'objectives' | 'modes' | 'audiences',
  config: { title: string, description: string, icon?: string }
) => {
  try {
    console.log(`[courseDefaultContentService] Saving ${sectionType} section config for course ${courseId}:`, config);
    
    // Use a custom query with upsert functionality instead of direct table access
    const { error } = await supabase.rpc('upsert_course_section_config', {
      p_course_id: courseId,
      p_section_type: sectionType,
      p_title: config.title,
      p_description: config.description,
      p_icon: config.icon || null
    });
    
    if (error) {
      console.error(`[courseDefaultContentService] Error saving ${sectionType} section config:`, error);
      return { error };
    }
    
    return { success: true };
  } catch (error) {
    console.error(`[courseDefaultContentService] Exception in saveSectionConfig:`, error);
    return { error };
  }
};

// Function to get section configuration for a course
export const getSectionConfig = async (
  courseId: number,
  sectionType: 'objectives' | 'modes' | 'audiences'
) => {
  try {
    console.log(`[courseDefaultContentService] Getting ${sectionType} section config for course ${courseId}`);
    
    // Use a custom RPC function to get section configuration
    const { data, error } = await supabase.rpc('get_course_section_config', {
      p_course_id: courseId,
      p_section_type: sectionType
    });
    
    if (error) {
      console.error(`[courseDefaultContentService] Error getting ${sectionType} section config:`, error);
      return { error };
    }
    
    // Return default configuration if none exists
    if (!data) {
      const defaultConfig = {
        title: sectionType === 'objectives' 
          ? '学习目标' 
          : (sectionType === 'modes' ? '学习模式' : '适合人群'),
        description: sectionType === 'objectives'
          ? '列出学习者完成课程后将获得的技能'
          : (sectionType === 'modes' 
              ? '列出课程的学习方式和教学模式' 
              : '说明这门课程适合哪类学习者'),
        icon: sectionType === 'objectives' 
          ? 'target' 
          : (sectionType === 'modes' ? 'video' : 'users')
      };
      
      return { data: defaultConfig };
    }
    
    return { data };
  } catch (error) {
    console.error(`[courseDefaultContentService] Exception in getSectionConfig:`, error);
    return { error };
  }
};
