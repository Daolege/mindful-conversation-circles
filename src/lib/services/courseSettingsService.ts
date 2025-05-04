
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

// Updated interface definition, including is_visible property
export interface ListItem {
  id: string;
  course_id: number;
  content: string;
  position: number;
  is_visible: boolean;
}

interface OrderUpdate {
  id: string;
  position: number;
}

// Learning Objectives
export const getObjectives = async (courseId: number) => {
  try {
    console.log("[courseSettingsService] Getting objectives for courseId:", courseId);
    const { data, error } = await supabase
      .from('course_learning_objectives')
      .select('*')
      .eq('course_id', courseId)
      .order('position');
    
    if (error) {
      console.error("[courseSettingsService] Error in getObjectives:", error);
    } else {
      console.log(`[courseSettingsService] Found ${data?.length || 0} objectives`);
    }
    
    return { data, error };
  } catch (error) {
    console.error('[courseSettingsService] Exception in getObjectives:', error);
    return { data: null, error };
  }
};

export const addObjective = async (courseId: number, content: string, position: number, isVisible: boolean = true) => {
  try {
    // Generate a UUID for the new objective
    const objectiveId = uuidv4();
    
    console.log("[courseSettingsService] Adding objective:", {courseId, content, position, isVisible});
    
    // Use RPC call to bypass RLS for admin operations
    const { data, error } = await supabase.rpc('admin_add_course_item', {
      p_table_name: 'course_learning_objectives',
      p_course_id: courseId,
      p_content: content,
      p_position: position,
      p_id: objectiveId,
      p_is_visible: isVisible
    });
    
    if (error) {
      console.error("[courseSettingsService] Error in addObjective:", error);
      return { data: null, error };
    } else {
      console.log("[courseSettingsService] Successfully added objective:", data);
      // Return the created item in the expected format
      return { 
        data: {
          id: objectiveId,
          course_id: courseId,
          content,
          position,
          is_visible: isVisible
        }, 
        error: null 
      };
    }
  } catch (error) {
    console.error('[courseSettingsService] Exception in addObjective:', error);
    return { data: null, error };
  }
};

export const updateObjective = async (id: string, content: string) => {
  try {
    console.log("[courseSettingsService] Updating objective:", {id, content});
    const { error } = await supabase
      .from('course_learning_objectives')
      .update({ content })
      .eq('id', id);
    
    if (error) {
      console.error("[courseSettingsService] Error in updateObjective:", error);
    } else {
      console.log("[courseSettingsService] Successfully updated objective");
    }
    
    return { error };
  } catch (error) {
    console.error('[courseSettingsService] Exception in updateObjective:', error);
    return { error };
  }
};

export const deleteObjective = async (id: string) => {
  try {
    console.log("[courseSettingsService] Deleting objective:", id);
    const { error } = await supabase
      .from('course_learning_objectives')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("[courseSettingsService] Error in deleteObjective:", error);
    } else {
      console.log("[courseSettingsService] Successfully deleted objective");
    }
    
    return { error };
  } catch (error) {
    console.error('[courseSettingsService] Exception in deleteObjective:', error);
    return { error };
  }
};

export const updateObjectiveOrder = async (updates: OrderUpdate[]) => {
  try {
    console.log("[courseSettingsService] Updating objective order:", updates);
    const updatePromises = updates.map(update => 
      supabase
        .from('course_learning_objectives')
        .update({ position: update.position })
        .eq('id', update.id)
    );
    
    await Promise.all(updatePromises);
    console.log("[courseSettingsService] Successfully updated objective order");
    
    return { error: null };
  } catch (error) {
    console.error('[courseSettingsService] Error in updateObjectiveOrder:', error);
    return { error };
  }
};

export const updateObjectivesVisibility = async (courseId: number, isVisible: boolean) => {
  try {
    console.log("[courseSettingsService] Updating objectives visibility:", {courseId, isVisible});
    
    // Check if objectives exist for this course
    const { data: existingData } = await supabase
      .from('course_learning_objectives')
      .select('id')
      .eq('course_id', courseId)
      .limit(1);
      
    // If objectives exist, update them
    if (existingData && existingData.length > 0) {
      const { error } = await supabase
        .from('course_learning_objectives')
        .update({ is_visible: isVisible })
        .eq('course_id', courseId);
      
      if (error) {
        console.error("[courseSettingsService] Error in updateObjectivesVisibility:", error);
        return { error };
      }
    } 
    // If no objectives yet, but we have a toggle state, store it in localStorage
    else {
      console.log("[courseSettingsService] No objectives found to update visibility, will be handled when adding default objectives");
      
      // We'll handle this visibility state when adding default objectives
      try {
        const storageKey = `course_${courseId}_section_visibility`;
        const visibilityData = JSON.parse(localStorage.getItem(storageKey) || '{}');
        localStorage.setItem(storageKey, JSON.stringify({
          ...visibilityData,
          objectives: isVisible
        }));
      } catch (err) {
        console.error('[courseSettingsService] Error saving objectives visibility to localStorage:', err);
      }
    }
    
    console.log("[courseSettingsService] Successfully updated objectives visibility");
    return { error: null };
  } catch (error) {
    console.error('[courseSettingsService] Exception in updateObjectivesVisibility:', error);
    return { error };
  }
};

// Default TikTok Shop cross-border e-commerce learning objectives
export const addDefaultObjectives = async (courseId: number, isVisible: boolean = true) => {
  try {
    console.log("[courseSettingsService] Adding default objectives for courseId:", courseId, "with visibility:", isVisible);
    
    // Check if this course already has objectives
    const { data: existingData } = await getObjectives(courseId);
    if (existingData && existingData.length > 0) {
      console.log("[courseSettingsService] Course already has objectives, skipping default creation");
      return { data: existingData, error: null };
    }
    
    // Check if we have a visibility preference stored in localStorage
    try {
      const storageKey = `course_${courseId}_section_visibility`;
      const visibilityData = JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (visibilityData.objectives !== undefined) {
        isVisible = visibilityData.objectives;
        console.log("[courseSettingsService] Using visibility from localStorage:", isVisible);
      }
    } catch (err) {
      console.error('[courseSettingsService] Error reading visibility from localStorage:', err);
    }
    
    const defaultObjectives = [
      "掌握TikTok Shop跨境电商店铺的搭建和优化技巧",
      "学习跨境电商产品选品、定价与上架策略",
      "熟悉TikTok直播带货和短视频营销的核心方法",
      "掌握店铺运营与全球客户服务的最佳实践",
      "了解跨境物流、支付与跨境电商合规管理知识"
    ];
    
    // Using admin RPC instead of direct insert to bypass RLS
    const results = [];
    for (let i = 0; i < defaultObjectives.length; i++) {
      const objectiveId = uuidv4();
      const { data, error } = await supabase.rpc('admin_add_course_item', {
        p_table_name: 'course_learning_objectives',
        p_course_id: courseId,
        p_content: defaultObjectives[i],
        p_position: i,
        p_id: objectiveId,
        p_is_visible: isVisible
      });
      
      if (error) {
        console.error(`[courseSettingsService] Error adding default objective ${i}:`, error);
      } else {
        results.push({
          id: objectiveId,
          course_id: courseId,
          content: defaultObjectives[i],
          position: i,
          is_visible: isVisible
        });
      }
    }
    
    console.log(`[courseSettingsService] Successfully added ${results.length} default objectives with visibility:`, isVisible);
    return { data: results, error: results.length === 0 ? new Error("Failed to add default objectives") : null };
  } catch (error) {
    console.error('[courseSettingsService] Exception in addDefaultObjectives:', error);
    return { data: null, error };
  }
};

// Requirements (renamed from "前置要求" to "学习要求")
export const getRequirements = async (courseId: number) => {
  try {
    console.log("[courseSettingsService] Getting requirements for courseId:", courseId);
    const { data, error } = await supabase
      .from('course_requirements')
      .select('*')
      .eq('course_id', courseId)
      .order('position');
    
    if (error) {
      console.error("[courseSettingsService] Error in getRequirements:", error);
    } else {
      console.log(`[courseSettingsService] Found ${data?.length || 0} requirements`);
    }
    
    return { data, error };
  } catch (error) {
    console.error('[courseSettingsService] Exception in getRequirements:', error);
    return { data: null, error };
  }
};

export const addRequirement = async (courseId: number, content: string, position: number, isVisible: boolean = true) => {
  try {
    // Generate a UUID for the new requirement
    const requirementId = uuidv4();
    
    console.log("[courseSettingsService] Adding requirement:", {courseId, content, position, isVisible});
    
    // Use RPC call to bypass RLS for admin operations
    const { data, error } = await supabase.rpc('admin_add_course_item', {
      p_table_name: 'course_requirements',
      p_course_id: courseId,
      p_content: content,
      p_position: position,
      p_id: requirementId,
      p_is_visible: isVisible
    });
    
    if (error) {
      console.error("[courseSettingsService] Error in addRequirement:", error);
      return { data: null, error };
    } else {
      console.log("[courseSettingsService] Successfully added requirement:", data);
      // Return the created item in the expected format
      return { 
        data: {
          id: requirementId,
          course_id: courseId,
          content,
          position,
          is_visible: isVisible
        },
        error: null 
      };
    }
  } catch (error) {
    console.error('[courseSettingsService] Exception in addRequirement:', error);
    return { data: null, error };
  }
};

export const updateRequirement = async (id: string, content: string) => {
  try {
    console.log("[courseSettingsService] Updating requirement:", {id, content});
    const { error } = await supabase
      .from('course_requirements')
      .update({ content })
      .eq('id', id);
    
    if (error) {
      console.error("[courseSettingsService] Error in updateRequirement:", error);
    } else {
      console.log("[courseSettingsService] Successfully updated requirement");
    }
    
    return { error };
  } catch (error) {
    console.error('[courseSettingsService] Exception in updateRequirement:', error);
    return { error };
  }
};

export const deleteRequirement = async (id: string) => {
  try {
    console.log("[courseSettingsService] Deleting requirement:", id);
    const { error } = await supabase
      .from('course_requirements')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("[courseSettingsService] Error in deleteRequirement:", error);
    } else {
      console.log("[courseSettingsService] Successfully deleted requirement");
    }
    
    return { error };
  } catch (error) {
    console.error('[courseSettingsService] Exception in deleteRequirement:', error);
    return { error };
  }
};

export const updateRequirementOrder = async (updates: OrderUpdate[]) => {
  try {
    console.log("[courseSettingsService] Updating requirement order:", updates);
    const updatePromises = updates.map(update => 
      supabase
        .from('course_requirements')
        .update({ position: update.position })
        .eq('id', update.id)
    );
    
    await Promise.all(updatePromises);
    console.log("[courseSettingsService] Successfully updated requirement order");
    
    return { error: null };
  } catch (error) {
    console.error('[courseSettingsService] Error in updateRequirementOrder:', error);
    return { error };
  }
};

export const updateRequirementsVisibility = async (courseId: number, isVisible: boolean) => {
  try {
    console.log("[courseSettingsService] Updating requirements visibility:", {courseId, isVisible});
    
    // Check if requirements exist for this course
    const { data: existingData } = await supabase
      .from('course_requirements')
      .select('id')
      .eq('course_id', courseId)
      .limit(1);
      
    // If requirements exist, update them
    if (existingData && existingData.length > 0) {
      const { error } = await supabase
        .from('course_requirements')
        .update({ is_visible: isVisible })
        .eq('course_id', courseId);
      
      if (error) {
        console.error("[courseSettingsService] Error in updateRequirementsVisibility:", error);
        return { error };
      }
    }
    // If no requirements yet, but we have a toggle state, store it in localStorage
    else {
      console.log("[courseSettingsService] No requirements found to update visibility, will be handled when adding default requirements");
      
      try {
        const storageKey = `course_${courseId}_section_visibility`;
        const visibilityData = JSON.parse(localStorage.getItem(storageKey) || '{}');
        localStorage.setItem(storageKey, JSON.stringify({
          ...visibilityData,
          requirements: isVisible
        }));
      } catch (err) {
        console.error('[courseSettingsService] Error saving requirements visibility to localStorage:', err);
      }
    }
    
    console.log("[courseSettingsService] Successfully updated requirements visibility");
    return { error: null };
  } catch (error) {
    console.error('[courseSettingsService] Exception in updateRequirementsVisibility:', error);
    return { error };
  }
};

// Default TikTok Shop cross-border e-commerce learning requirements
export const addDefaultRequirements = async (courseId: number, isVisible: boolean = true) => {
  try {
    console.log("[courseSettingsService] Adding default requirements for courseId:", courseId, "with visibility:", isVisible);
    
    // Check if this course already has requirements
    const { data: existingData } = await getRequirements(courseId);
    if (existingData && existingData.length > 0) {
      console.log("[courseSettingsService] Course already has requirements, skipping default creation");
      return { data: existingData, error: null };
    }
    
    // Check if we have a visibility preference stored in localStorage
    try {
      const storageKey = `course_${courseId}_section_visibility`;
      const visibilityData = JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (visibilityData.requirements !== undefined) {
        isVisible = visibilityData.requirements;
        console.log("[courseSettingsService] Using visibility from localStorage:", isVisible);
      }
    } catch (err) {
      console.error('[courseSettingsService] Error reading visibility from localStorage:', err);
    }
    
    const defaultRequirements = [
      "基本的电脑操作技能和网络连接",
      "初步了解电商或网络营销概念",
      "具备简单的英文阅读能力",
      "对跨境电商和国际贸易有兴趣"
    ];
    
    // Using admin RPC instead of direct insert to bypass RLS
    const results = [];
    for (let i = 0; i < defaultRequirements.length; i++) {
      const requirementId = uuidv4();
      const { data, error } = await supabase.rpc('admin_add_course_item', {
        p_table_name: 'course_requirements',
        p_course_id: courseId,
        p_content: defaultRequirements[i],
        p_position: i,
        p_id: requirementId,
        p_is_visible: isVisible
      });
      
      if (error) {
        console.error(`[courseSettingsService] Error adding default requirement ${i}:`, error);
      } else {
        results.push({
          id: requirementId,
          course_id: courseId,
          content: defaultRequirements[i],
          position: i,
          is_visible: isVisible
        });
      }
    }
    
    console.log(`[courseSettingsService] Successfully added ${results.length} default requirements with visibility:`, isVisible);
    return { data: results, error: results.length === 0 ? new Error("Failed to add default requirements") : null };
  } catch (error) {
    console.error('[courseSettingsService] Exception in addDefaultRequirements:', error);
    return { data: null, error };
  }
};

// Target Audiences (renamed from "目标受众" to "适合人群" in the UI)
export const getAudiences = async (courseId: number) => {
  try {
    console.log("[courseSettingsService] Getting audiences for courseId:", courseId);
    const { data, error } = await supabase
      .from('course_audiences')
      .select('*')
      .eq('course_id', courseId)
      .order('position');
    
    if (error) {
      console.error("[courseSettingsService] Error in getAudiences:", error);
    } else {
      console.log(`[courseSettingsService] Found ${data?.length || 0} audiences`);
    }
    
    return { data, error };
  } catch (error) {
    console.error('[courseSettingsService] Exception in getAudiences:', error);
    return { data: null, error };
  }
};

export const addAudience = async (courseId: number, content: string, position: number, isVisible: boolean = true) => {
  try {
    // Generate a UUID for the new audience
    const audienceId = uuidv4();
    
    console.log("[courseSettingsService] Adding audience:", {courseId, content, position, isVisible});
    
    // Use RPC call to bypass RLS for admin operations
    const { data, error } = await supabase.rpc('admin_add_course_item', {
      p_table_name: 'course_audiences',
      p_course_id: courseId,
      p_content: content,
      p_position: position,
      p_id: audienceId,
      p_is_visible: isVisible
    });
    
    if (error) {
      console.error("[courseSettingsService] Error in addAudience:", error);
      return { data: null, error };
    } else {
      console.log("[courseSettingsService] Successfully added audience:", data);
      // Return the created item in the expected format
      return { 
        data: {
          id: audienceId,
          course_id: courseId,
          content,
          position,
          is_visible: isVisible
        }, 
        error: null 
      };
    }
  } catch (error) {
    console.error('[courseSettingsService] Exception in addAudience:', error);
    return { data: null, error };
  }
};

export const updateAudience = async (id: string, content: string) => {
  try {
    console.log("[courseSettingsService] Updating audience:", {id, content});
    const { error } = await supabase
      .from('course_audiences')
      .update({ content })
      .eq('id', id);
    
    if (error) {
      console.error("[courseSettingsService] Error in updateAudience:", error);
    } else {
      console.log("[courseSettingsService] Successfully updated audience");
    }
    
    return { error };
  } catch (error) {
    console.error('[courseSettingsService] Exception in updateAudience:', error);
    return { error };
  }
};

export const deleteAudience = async (id: string) => {
  try {
    console.log("[courseSettingsService] Deleting audience:", id);
    const { error } = await supabase
      .from('course_audiences')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("[courseSettingsService] Error in deleteAudience:", error);
    } else {
      console.log("[courseSettingsService] Successfully deleted audience");
    }
    
    return { error };
  } catch (error) {
    console.error('[courseSettingsService] Exception in deleteAudience:', error);
    return { error };
  }
};

export const updateAudienceOrder = async (updates: OrderUpdate[]) => {
  try {
    console.log("[courseSettingsService] Updating audience order:", updates);
    const updatePromises = updates.map(update => 
      supabase
        .from('course_audiences')
        .update({ position: update.position })
        .eq('id', update.id)
    );
    
    await Promise.all(updatePromises);
    console.log("[courseSettingsService] Successfully updated audience order");
    
    return { error: null };
  } catch (error) {
    console.error('[courseSettingsService] Error in updateAudienceOrder:', error);
    return { error };
  }
};

export const updateAudiencesVisibility = async (courseId: number, isVisible: boolean) => {
  try {
    console.log("[courseSettingsService] Updating audiences visibility:", {courseId, isVisible});
    
    // Check if audiences exist for this course
    const { data: existingData } = await supabase
      .from('course_audiences')
      .select('id')
      .eq('course_id', courseId)
      .limit(1);
      
    // If audiences exist, update them
    if (existingData && existingData.length > 0) {
      const { error } = await supabase
        .from('course_audiences')
        .update({ is_visible: isVisible })
        .eq('course_id', courseId);
      
      if (error) {
        console.error("[courseSettingsService] Error in updateAudiencesVisibility:", error);
        return { error };
      }
    }
    // If no audiences yet, but we have a toggle state, store it in localStorage
    else {
      console.log("[courseSettingsService] No audiences found to update visibility, will be handled when adding default audiences");
      
      try {
        const storageKey = `course_${courseId}_section_visibility`;
        const visibilityData = JSON.parse(localStorage.getItem(storageKey) || '{}');
        localStorage.setItem(storageKey, JSON.stringify({
          ...visibilityData,
          audiences: isVisible
        }));
      } catch (err) {
        console.error('[courseSettingsService] Error saving audiences visibility to localStorage:', err);
      }
    }
    
    console.log("[courseSettingsService] Successfully updated audiences visibility");
    return { error: null };
  } catch (error) {
    console.error('[courseSettingsService] Exception in updateAudiencesVisibility:', error);
    return { error };
  }
};

// Default TikTok Shop cross-border e-commerce target audiences
export const addDefaultAudiences = async (courseId: number, isVisible: boolean = true) => {
  try {
    console.log("[courseSettingsService] Adding default audiences for courseId:", courseId, "with visibility:", isVisible);
    
    // Check if this course already has audiences
    const { data: existingData } = await getAudiences(courseId);
    if (existingData && existingData.length > 0) {
      console.log("[courseSettingsService] Course already has audiences, skipping default creation");
      return { data: existingData, error: null };
    }
    
    // Check if we have a visibility preference stored in localStorage
    try {
      const storageKey = `course_${courseId}_section_visibility`;
      const visibilityData = JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (visibilityData.audiences !== undefined) {
        isVisible = visibilityData.audiences;
        console.log("[courseSettingsService] Using visibility from localStorage:", isVisible);
      }
    } catch (err) {
      console.error('[courseSettingsService] Error reading visibility from localStorage:', err);
    }
    
    const defaultAudiences = [
      "想要开始跨境电商创业的新手卖家",
      "寻求通过TikTok Shop拓展国际市场的店铺经营者",
      "希望从传统贸易转型到跨境电商的企业",
      "对短视频电商和直播带货感兴趣的创作者",
      "想要学习数字化营销与国际贸易的学生",
      "希望提升跨境店铺业绩的现有卖家",
      "想要了解跨境电商最新趋势的营销人员"
    ];
    
    // Using admin RPC instead of direct insert to bypass RLS
    const results = [];
    for (let i = 0; i < defaultAudiences.length; i++) {
      const audienceId = uuidv4();
      const { data, error } = await supabase.rpc('admin_add_course_item', {
        p_table_name: 'course_audiences',
        p_course_id: courseId,
        p_content: defaultAudiences[i],
        p_position: i,
        p_id: audienceId,
        p_is_visible: isVisible
      });
      
      if (error) {
        console.error(`[courseSettingsService] Error adding default audience ${i}:`, error);
      } else {
        results.push({
          id: audienceId,
          course_id: courseId,
          content: defaultAudiences[i],
          position: i,
          is_visible: isVisible
        });
      }
    }
    
    console.log(`[courseSettingsService] Successfully added ${results.length} default audiences with visibility:`, isVisible);
    return { data: results, error: results.length === 0 ? new Error("Failed to add default audiences") : null };
  } catch (error) {
    console.error('[courseSettingsService] Exception in addDefaultAudiences:', error);
    return { data: null, error };
  }
};
