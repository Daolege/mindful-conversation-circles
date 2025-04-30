import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableListComponent, ListItem } from './EditableListComponent';
import { toast } from "sonner";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useCourseEditor } from "@/hooks/useCourseEditor";
import { 
  getObjectives, 
  getRequirements, 
  getAudiences,
  addObjective,
  addRequirement,
  addAudience, 
  updateObjective,
  updateRequirement,
  updateAudience,
  deleteObjective,
  deleteRequirement,
  deleteAudience,
  updateObjectiveOrder,
  updateRequirementOrder,
  updateAudienceOrder,
  updateObjectivesVisibility,
  updateRequirementsVisibility,
  updateAudiencesVisibility,
  addDefaultObjectives,
  addDefaultRequirements,
  addDefaultAudiences
} from '@/lib/services/courseSettingsService';

interface CourseOtherSettingsProps {
  courseId: number;
  savedSections?: {
    objectives: boolean;
    requirements: boolean;
    audiences: boolean;
  };
  sectionVisibility?: {
    objectives: boolean;
    requirements: boolean;
    audiences: boolean;
  };
}

export const CourseOtherSettings = ({ 
  courseId, 
  savedSections: initialSavedSections,
  sectionVisibility: initialSectionVisibility
}: CourseOtherSettingsProps) => {
  const [objectives, setObjectives] = useState<ListItem[]>([]);
  const [requirements, setRequirements] = useState<ListItem[]>([]);
  const [audiences, setAudiences] = useState<ListItem[]>([]);
  const [isLoadingObjectives, setIsLoadingObjectives] = useState(false);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
  const [isLoadingAudiences, setIsLoadingAudiences] = useState(false);
  const [objectivesVisible, setObjectivesVisible] = useState(initialSectionVisibility?.objectives ?? true);
  const [requirementsVisible, setRequirementsVisible] = useState(initialSectionVisibility?.requirements ?? true);
  const [audiencesVisible, setAudiencesVisible] = useState(initialSectionVisibility?.audiences ?? true);
  const [error, setError] = useState<string | null>(null);
  const [addingDefault, setAddingDefault] = useState(false);
  const [initialLoadCompleted, setInitialLoadCompleted] = useState({
    objectives: initialSavedSections?.objectives ?? false,
    requirements: initialSavedSections?.requirements ?? false,
    audiences: initialSavedSections?.audiences ?? false
  });
  
  console.log("[CourseOtherSettings] Initial render with savedSections:", initialSavedSections);
  console.log("[CourseOtherSettings] Initial render with sectionVisibility:", initialSectionVisibility);
  console.log("[CourseOtherSettings] Initial load completed:", initialLoadCompleted);
  
  // Access the CourseEditorContext to track changes and save status
  const { 
    setHasChanges, 
    trackSaveAttempt, 
    handleSaveComplete, 
    saving, 
    savedSections, 
    setSavedSection,
    sectionVisibility,
    setSectionVisibility: contextSetSectionVisibility
  } = useCourseEditor();
  
  // Sync visibility state with context on initial mount
  useEffect(() => {
    if (initialSectionVisibility && courseId) {
      console.log("[CourseOtherSettings] Syncing initial visibility state with context:", initialSectionVisibility);
      
      if (initialSectionVisibility.objectives !== undefined) {
        setObjectivesVisible(initialSectionVisibility.objectives);
        contextSetSectionVisibility('objectives', initialSectionVisibility.objectives);
      }
      
      if (initialSectionVisibility.requirements !== undefined) {
        setRequirementsVisible(initialSectionVisibility.requirements);
        contextSetSectionVisibility('requirements', initialSectionVisibility.requirements);
      }
      
      if (initialSectionVisibility.audiences !== undefined) {
        setAudiencesVisible(initialSectionVisibility.audiences);
        contextSetSectionVisibility('audiences', initialSectionVisibility.audiences);
      }
    }
  }, [courseId, initialSectionVisibility, contextSetSectionVisibility]);
  
  // Sync saved sections state with context on initial mount
  useEffect(() => {
    if (initialSavedSections && courseId) {
      console.log("[CourseOtherSettings] Syncing initial saved sections state with context:", initialSavedSections);
      
      if (initialSavedSections.objectives) {
        setSavedSection('objectives', initialSavedSections.objectives);
      }
      
      if (initialSavedSections.requirements) {
        setSavedSection('requirements', initialSavedSections.requirements);
      }
      
      if (initialSavedSections.audiences) {
        setSavedSection('audiences', initialSavedSections.audiences);
      }
      
      setInitialLoadCompleted({
        objectives: initialSavedSections.objectives || false,
        requirements: initialSavedSections.requirements || false,
        audiences: initialSavedSections.audiences || false
      });
    }
  }, [courseId, initialSavedSections, setSavedSection]);
  
  useEffect(() => {
    if (courseId) {
      console.log("[CourseOtherSettings] CourseId changed, loading data for courseId:", courseId);
      loadObjectives();
      loadRequirements();
      loadAudiences();
    }
  }, [courseId]);
  
  // Force refresh specific section data
  const handleRefreshSection = useCallback((section: 'objectives' | 'requirements' | 'audiences') => {
    console.log(`[CourseOtherSettings] Manually refreshing ${section} data`);
    switch (section) {
      case 'objectives':
        loadObjectives(true);
        break;
      case 'requirements':
        loadRequirements(true);
        break;
      case 'audiences':
        loadAudiences(true);
        break;
    }
    toast.info(`正在刷新${section === 'objectives' ? '学习目标' : section === 'requirements' ? '学习要求' : '适合人群'}数据...`);
  }, []);
  
  // Load objectives with fallback to defaults only if it's the first time
  const loadObjectives = useCallback(async (forceRefresh = false) => {
    setIsLoadingObjectives(true);
    setError(null);
    
    try {
      console.log("[CourseOtherSettings] Loading objectives for courseId:", courseId);
      const { data, error } = await getObjectives(courseId);
      
      if (error) {
        console.error("[CourseOtherSettings] Error loading objectives:", error);
        throw error;
      }
      
      if (data && data.length > 0) {
        // We have existing data
        const sortedItems = data.sort((a, b) => a.position - b.position);
        setObjectives(sortedItems);
        setObjectivesVisible(data[0].is_visible !== false);
        console.log("[CourseOtherSettings] Loaded objectives:", sortedItems.length);
        setSavedSection('objectives', true);
        setInitialLoadCompleted(prev => ({ ...prev, objectives: true }));
        forceRefresh && toast.success("学习目标数据已刷新");
      } else if (!savedSections.objectives && !initialLoadCompleted.objectives && !forceRefresh) {
        // No data found and section not previously saved, add defaults
        console.log("[CourseOtherSettings] No objectives found, adding defaults for TikTok Shop cross-border e-commerce");
        setAddingDefault(true);
        await addDefaultsAndUpdateState('objectives');
        setAddingDefault(false);
        setInitialLoadCompleted(prev => ({ ...prev, objectives: true }));
      } else {
        // Either force refresh with no data or section was previously saved but is now empty
        if (forceRefresh) {
          toast.info("没有找到学习目标数据");
        }
        setObjectives([]);
        setInitialLoadCompleted(prev => ({ ...prev, objectives: true }));
      }
    } catch (error: any) {
      console.error("[CourseOtherSettings] Error in loadObjectives:", error);
      setError(error.message || "Failed to load learning objectives");
      toast.error("加载学习目标失败");
      
      // Only try to add defaults if section was never saved before
      if (!savedSections.objectives && !initialLoadCompleted.objectives && !forceRefresh) {
        setAddingDefault(true);
        await addDefaultsAndUpdateState('objectives');
        setAddingDefault(false);
        setInitialLoadCompleted(prev => ({ ...prev, objectives: true }));
      }
    } finally {
      setIsLoadingObjectives(false);
    }
  }, [courseId, savedSections.objectives, setSavedSection, initialLoadCompleted]);
  
  // Load requirements with fallback to defaults only if it's the first time
  const loadRequirements = useCallback(async (forceRefresh = false) => {
    setIsLoadingRequirements(true);
    
    try {
      console.log("[CourseOtherSettings] Loading requirements for courseId:", courseId);
      const { data, error } = await getRequirements(courseId);
      
      if (error) {
        console.error("[CourseOtherSettings] Error loading requirements:", error);
        throw error;
      }
      
      if (data && data.length > 0) {
        // We have existing data
        const sortedItems = data.sort((a, b) => a.position - b.position);
        setRequirements(sortedItems);
        setRequirementsVisible(data[0].is_visible !== false);
        console.log("[CourseOtherSettings] Loaded requirements:", sortedItems.length);
        setSavedSection('requirements', true);
        setInitialLoadCompleted(prev => ({ ...prev, requirements: true }));
        forceRefresh && toast.success("学习要求数据已刷新");
      } else if (!savedSections.requirements && !initialLoadCompleted.requirements && !forceRefresh) {
        // No data found and section not previously saved, add defaults
        console.log("[CourseOtherSettings] No requirements found, adding defaults for TikTok Shop cross-border e-commerce");
        setAddingDefault(true);
        await addDefaultsAndUpdateState('requirements');
        setAddingDefault(false);
        setInitialLoadCompleted(prev => ({ ...prev, requirements: true }));
      } else {
        // Either force refresh with no data or section was previously saved but is now empty
        if (forceRefresh) {
          toast.info("没有找到学习要求数据");
        }
        setRequirements([]);
        setInitialLoadCompleted(prev => ({ ...prev, requirements: true }));
      }
    } catch (error: any) {
      console.error("[CourseOtherSettings] Error in loadRequirements:", error);
      setError(prev => prev || error.message || "Failed to load learning requirements");
      toast.error("加载学习要求失败");
      
      // Only try to add defaults if section was never saved before
      if (!savedSections.requirements && !initialLoadCompleted.requirements && !forceRefresh) {
        setAddingDefault(true);
        await addDefaultsAndUpdateState('requirements');
        setAddingDefault(false);
        setInitialLoadCompleted(prev => ({ ...prev, requirements: true }));
      }
    } finally {
      setIsLoadingRequirements(false);
    }
  }, [courseId, savedSections.requirements, setSavedSection, initialLoadCompleted]);
  
  // Load audiences with fallback to defaults only if it's the first time
  const loadAudiences = useCallback(async (forceRefresh = false) => {
    setIsLoadingAudiences(true);
    
    try {
      console.log("[CourseOtherSettings] Loading audiences for courseId:", courseId);
      const { data, error } = await getAudiences(courseId);
      
      if (error) {
        console.error("[CourseOtherSettings] Error loading audiences:", error);
        throw error;
      }
      
      if (data && data.length > 0) {
        // We have existing data
        const sortedItems = data.sort((a, b) => a.position - b.position);
        setAudiences(sortedItems);
        setAudiencesVisible(data[0].is_visible !== false);
        console.log("[CourseOtherSettings] Loaded audiences:", sortedItems.length);
        setSavedSection('audiences', true);
        setInitialLoadCompleted(prev => ({ ...prev, audiences: true }));
        forceRefresh && toast.success("适合人群数据已刷新");
      } else if (!savedSections.audiences && !initialLoadCompleted.audiences && !forceRefresh) {
        // No data found and section not previously saved, add defaults
        console.log("[CourseOtherSettings] No audiences found, adding defaults for TikTok Shop cross-border e-commerce");
        setAddingDefault(true);
        await addDefaultsAndUpdateState('audiences');
        setAddingDefault(false);
        setInitialLoadCompleted(prev => ({ ...prev, audiences: true }));
      } else {
        // Either force refresh with no data or section was previously saved but is now empty
        if (forceRefresh) {
          toast.info("没有找到适合人群数据");
        }
        setAudiences([]);
        setInitialLoadCompleted(prev => ({ ...prev, audiences: true }));
      }
    } catch (error: any) {
      console.error("[CourseOtherSettings] Error in loadAudiences:", error);
      setError(prev => prev || error.message || "Failed to load suitable audiences");
      toast.error("加载适合人群��败");
      
      // Only try to add defaults if section was never saved before
      if (!savedSections.audiences && !initialLoadCompleted.audiences && !forceRefresh) {
        setAddingDefault(true);
        await addDefaultsAndUpdateState('audiences');
        setAddingDefault(false);
        setInitialLoadCompleted(prev => ({ ...prev, audiences: true }));
      }
    } finally {
      setIsLoadingAudiences(false);
    }
  }, [courseId, savedSections.audiences, setSavedSection, initialLoadCompleted]);

  // Helper function to add defaults and update state
  const addDefaultsAndUpdateState = async (type: 'objectives' | 'requirements' | 'audiences') => {
    try {
      let result;
      let successMessage = "";
      
      switch (type) {
        case 'objectives':
          result = await addDefaultObjectives(courseId);
          successMessage = "已添加默认学习目标";
          if (result.data && result.data.length > 0) {
            setObjectives(result.data);
            setObjectivesVisible(true);
            setSavedSection('objectives', true);
          }
          break;
        case 'requirements':
          result = await addDefaultRequirements(courseId);
          successMessage = "已添加默认学习要求";
          if (result.data && result.data.length > 0) {
            setRequirements(result.data);
            setRequirementsVisible(true);
            setSavedSection('requirements', true);
          }
          break;
        case 'audiences':
          result = await addDefaultAudiences(courseId);
          successMessage = "已添加默认适合人群";
          if (result.data && result.data.length > 0) {
            setAudiences(result.data);
            setAudiencesVisible(true);
            setSavedSection('audiences', true);
          }
          break;
      }
      
      if (result && result.error) {
        console.error(`[CourseOtherSettings] Error adding default ${type}:`, result.error);
        setError(prev => prev || `Failed to add default ${type}`);
        toast.error(`添加默认${type === 'objectives' ? '学习目标' : type === 'requirements' ? '学习要求' : '适合人群'}失败`);
      } else if (result && result.data && result.data.length > 0) {
        console.log(`[CourseOtherSettings] Successfully added default ${type}:`, result.data.length);
        toast.success(successMessage);
      } else {
        console.error(`[CourseOtherSettings] Default ${type} were empty or failed to add`);
        setError(prev => prev || `Failed to add default ${type}`);
        toast.error(`添加默认${type === 'objectives' ? '学习目标' : type === 'requirements' ? '学习要求' : '适合人群'}失败，返回数据为空`);
      }
    } catch (err: any) {
      console.error(`[CourseOtherSettings] Exception adding default ${type}:`, err);
      setError(prev => prev || err.message || `Error adding default ${type}`);
      toast.error(`添加默认${type === 'objectives' ? '学习目标' : type === 'requirements' ? '学习要求' : '适合人群'}时发生错误`);
    }
  };

  // Handler functions for objectives
  const handleAddObjective = async (content: string) => {
    try {
      trackSaveAttempt('add-objective');
      const position = objectives.length > 0 ? Math.max(...objectives.map(o => o.position)) + 1 : 0;
      const { data, error } = await addObjective(courseId, content, position);
      
      if (error) throw error;
      
      if (data) {
        // Update local state immediately
        const newObjectives = [...objectives, data];
        setObjectives(newObjectives);
        toast.success("已添加学习目标");
        setHasChanges(true);
        setSavedSection('objectives', true);
        handleSaveComplete(true);
      } else {
        throw new Error("添加学习目标返回的数据为空");
      }
    } catch (error: any) {
      console.error("Error adding objective:", error);
      toast.error("添加学习目标失败", { description: error.message });
      handleSaveComplete(false, error.message);
    }
  };
  
  const handleEditObjective = async (id: string, content: string) => {
    try {
      trackSaveAttempt('edit-objective');
      const { error } = await updateObjective(id, content);
      
      if (error) throw error;
      
      // Update local state immediately
      setObjectives(objectives.map(obj => 
        obj.id === id ? { ...obj, content } : obj
      ));
      toast.success("已更新学习目标");
      setHasChanges(true);
      setSavedSection('objectives', true);
      handleSaveComplete(true);
    } catch (error: any) {
      console.error("Error updating objective:", error);
      toast.error("更新学习目标失败", { description: error.message });
      handleSaveComplete(false, error.message);
    }
  };
  
  const handleDeleteObjective = async (id: string) => {
    try {
      trackSaveAttempt('delete-objective');
      const { error } = await deleteObjective(id);
      
      if (error) throw error;
      
      // Update local state immediately
      setObjectives(objectives.filter(obj => obj.id !== id));
      toast.success("已删除学习目标");
      setHasChanges(true);
      handleSaveComplete(true);
    } catch (error: any) {
      console.error("Error deleting objective:", error);
      toast.error("删除学习目标失败", { description: error.message });
      handleSaveComplete(false, error.message);
    }
  };
  
  const handleObjectiveReorder = async (newItems: ListItem[]) => {
    try {
      trackSaveAttempt('reorder-objectives');
      const updates = newItems.map(item => ({
        id: item.id,
        position: item.position
      }));
      
      const { error } = await updateObjectiveOrder(updates);
      
      if (error) throw error;
      
      // Update local state with new order
      setObjectives(newItems);
      toast.success("已更新学习目标顺序");
      setHasChanges(true);
      setSavedSection('objectives', true);
      handleSaveComplete(true);
    } catch (error: any) {
      console.error("Error reordering objectives:", error);
      toast.error("更新学习目标顺序失败", { description: error.message });
      handleSaveComplete(false, error.message);
      // Reload original data on error
      loadObjectives(true);
    }
  };
  
  const handleObjectivesVisibilityChange = async (isVisible: boolean) => {
    setObjectivesVisible(isVisible);
    try {
      trackSaveAttempt('objectives-visibility');
      const { error } = await updateObjectivesVisibility(courseId, isVisible);
      
      if (error) throw error;
      
      // Update local state
      setObjectives(objectives.map(obj => ({ ...obj, is_visible: isVisible })));
      contextSetSectionVisibility('objectives', isVisible); // Make sure to update context too
      toast.success(`已${isVisible ? '显示' : '隐藏'}学习目标`);
      setHasChanges(true);
      setSavedSection('objectives', true);
      handleSaveComplete(true);
    } catch (error: any) {
      console.error("Error updating objectives visibility:", error);
      toast.error("更新学习目标可见性失败", { description: error.message });
      setObjectivesVisible(!isVisible); // Revert on error
      handleSaveComplete(false, error.message);
    }
  };
  
  // Handler functions for requirements
  const handleAddRequirement = async (content: string) => {
    try {
      trackSaveAttempt('add-requirement');
      const position = requirements.length > 0 ? Math.max(...requirements.map(r => r.position)) + 1 : 0;
      const { data, error } = await addRequirement(courseId, content, position);
      
      if (error) throw error;
      
      if (data) {
        // Update local state immediately
        const newRequirements = [...requirements, data];
        setRequirements(newRequirements);
        toast.success("已添加学习要求");
        setHasChanges(true);
        setSavedSection('requirements', true);
        handleSaveComplete(true);
      } else {
        throw new Error("添加学习要求返回的数据为空");
      }
    } catch (error: any) {
      console.error("Error adding requirement:", error);
      toast.error("添加学习要求失败", { description: error.message });
      handleSaveComplete(false, error.message);
    }
  };
  
  const handleEditRequirement = async (id: string, content: string) => {
    try {
      trackSaveAttempt('edit-requirement');
      const { error } = await updateRequirement(id, content);
      
      if (error) throw error;
      
      // Update local state immediately
      setRequirements(requirements.map(req => 
        req.id === id ? { ...req, content } : req
      ));
      toast.success("已更新学习要求");
      setHasChanges(true);
      setSavedSection('requirements', true);
      handleSaveComplete(true);
    } catch (error: any) {
      console.error("Error updating requirement:", error);
      toast.error("更新学习要求失败", { description: error.message });
      handleSaveComplete(false, error.message);
    }
  };
  
  const handleDeleteRequirement = async (id: string) => {
    try {
      trackSaveAttempt('delete-requirement');
      const { error } = await deleteRequirement(id);
      
      if (error) throw error;
      
      // Update local state immediately
      setRequirements(requirements.filter(req => req.id !== id));
      toast.success("已删除学习要求");
      setHasChanges(true);
      handleSaveComplete(true);
    } catch (error: any) {
      console.error("Error deleting requirement:", error);
      toast.error("删除学习要求失败", { description: error.message });
      handleSaveComplete(false, error.message);
    }
  };
  
  const handleRequirementReorder = async (newItems: ListItem[]) => {
    try {
      trackSaveAttempt('reorder-requirements');
      const updates = newItems.map(item => ({
        id: item.id,
        position: item.position
      }));
      
      const { error } = await updateRequirementOrder(updates);
      
      if (error) throw error;
      
      // Update local state with new order
      setRequirements(newItems);
      toast.success("已更新学习要求顺序");
      setHasChanges(true);
      setSavedSection('requirements', true);
      handleSaveComplete(true);
    } catch (error: any) {
      console.error("Error reordering requirements:", error);
      toast.error("更新学习要求顺序失败", { description: error.message });
      handleSaveComplete(false, error.message);
      loadRequirements(true);
    }
  };
  
  const handleRequirementsVisibilityChange = async (isVisible: boolean) => {
    setRequirementsVisible(isVisible);
    try {
      trackSaveAttempt('requirements-visibility');
      const { error } = await updateRequirementsVisibility(courseId, isVisible);
      
      if (error) throw error;
      
      setRequirements(requirements.map(req => ({ ...req, is_visible: isVisible })));
      contextSetSectionVisibility('requirements', isVisible); // Make sure to update context too
      toast.success(`已${isVisible ? '显示' : '隐藏'}学习要求`);
      setHasChanges(true);
      setSavedSection('requirements', true);
      handleSaveComplete(true);
    } catch (error: any) {
      console.error("Error updating requirements visibility:", error);
      toast.error("更新学习要求可见性失败", { description: error.message });
      setRequirementsVisible(!isVisible);
      handleSaveComplete(false, error.message);
    }
  };
  
  // Handler functions for audiences
  const handleAddAudience = async (content: string) => {
    try {
      trackSaveAttempt('add-audience');
      const position = audiences.length > 0 ? Math.max(...audiences.map(a => a.position)) + 1 : 0;
      const { data, error } = await addAudience(courseId, content, position);
      
      if (error) throw error;
      
      if (data) {
        // Update local state immediately
        const newAudiences = [...audiences, data];
        setAudiences(newAudiences);
        toast.success("已添加适合人群");
        setHasChanges(true);
        setSavedSection('audiences', true);
        handleSaveComplete(true);
      } else {
        throw new Error("添加适合人群返回的数据为空");
      }
    } catch (error: any) {
      console.error("Error adding audience:", error);
      toast.error("添加适合人群失败", { description: error.message });
      handleSaveComplete(false, error.message);
    }
  };
  
  const handleEditAudience = async (id: string, content: string) => {
    try {
      trackSaveAttempt('edit-audience');
      const { error } = await updateAudience(id, content);
      
      if (error) throw error;
      
      // Update local state immediately
      setAudiences(audiences.map(aud => 
        aud.id === id ? { ...aud, content } : aud
      ));
      toast.success("已更新适合人群");
      setHasChanges(true);
      setSavedSection('audiences', true);
      handleSaveComplete(true);
    } catch (error: any) {
      console.error("Error updating audience:", error);
      toast.error("更新适合人群失败", { description: error.message });
      handleSaveComplete(false, error.message);
    }
  };
  
  const handleDeleteAudience = async (id: string) => {
    try {
      trackSaveAttempt('delete-audience');
      const { error } = await deleteAudience(id);
      
      if (error) throw error;
      
      // Update local state immediately
      setAudiences(audiences.filter(aud => aud.id !== id));
      toast.success("已删除适合人群");
      setHasChanges(true);
      handleSaveComplete(true);
    } catch (error: any) {
      console.error("Error deleting audience:", error);
      toast.error("删除适合人群失败", { description: error.message });
      handleSaveComplete(false, error.message);
    }
  };
  
  const handleAudienceReorder = async (newItems: ListItem[]) => {
    try {
      trackSaveAttempt('reorder-audiences');
      const updates = newItems.map(item => ({
        id: item.id,
        position: item.position
      }));
      
      const { error } = await updateAudienceOrder(updates);
      
      if (error) throw error;
      
      // Update local state with new order
      setAudiences(newItems);
      toast.success("已更新适合人群顺序");
      setHasChanges(true);
      setSavedSection('audiences', true);
      handleSaveComplete(true);
    } catch (error: any) {
      console.error("Error reordering audiences:", error);
      toast.error("更新适合人群顺序失败", { description: error.message });
      handleSaveComplete(false, error.message);
      loadAudiences(true);
    }
  };
  
  const handleAudiencesVisibilityChange = async (isVisible: boolean) => {
    setAudiencesVisible(isVisible);
    try {
      trackSaveAttempt('audiences-visibility');
      const { error } = await updateAudiencesVisibility(courseId, isVisible);
      
      if (error) throw error;
      
      setAudiences(audiences.map(aud => ({ ...aud, is_visible: isVisible })));
      contextSetSectionVisibility('audiences', isVisible); // Make sure to update context too
      toast.success(`已${isVisible ? '显示' : '隐藏'}适合人群`);
      setHasChanges(true);
      setSavedSection('audiences', true);
      handleSaveComplete(true);
    } catch (error: any) {
      console.error("Error updating audiences visibility:", error);
      toast.error("更新适合人群可见性失败", { description: error.message });
      setAudiencesVisible(!isVisible);
      handleSaveComplete(false, error.message);
    }
  };

  const isLoading = isLoadingObjectives || isLoadingRequirements || isLoadingAudiences || addingDefault;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">课程其他设置</h2>
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-gray-600">正在加载课程设置...</p>
            <p className="text-sm text-gray-500 mt-2">
              {addingDefault ? "正在添加默认内容..." : "加载课程其他设置中，请稍候..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">课程其他设置</h2>
        {/* 添加刷新按钮 */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              loadObjectives(true);
              loadRequirements(true);
              loadAudiences(true);
            }}
            disabled={saving}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            刷新所有数据
          </Button>
        </div>
      </div>
      <p className="text-gray-500">这些设置将显示在课程详情页面，帮助学员了解课程内容和适用人群</p>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error} - 请刷新页面或联系技术支持
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Learning Objectives Card */}
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium">学习目标</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleRefreshSection('objectives')}
                disabled={isLoadingObjectives}
              >
                {isLoadingObjectives ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoadingObjectives ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <EditableListComponent
                title="学习目标"
                items={objectives}
                isVisible={objectivesVisible}
                placeholder="添加新的学习目标..."
                onChange={setObjectives}
                onVisibilityChange={handleObjectivesVisibilityChange}
                onAdd={handleAddObjective}
                onEdit={handleEditObjective}
                onDelete={handleDeleteObjective}
                onReorder={handleObjectiveReorder}
                helperText="描述学员完成课程后将获得的技能"
                emptyStateText="暂无学习目标，请添加"
              />
            )}
          </CardContent>
        </Card>

        {/* Learning Requirements Card */}
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium">学习要求</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleRefreshSection('requirements')}
                disabled={isLoadingRequirements}
              >
                {isLoadingRequirements ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoadingRequirements ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <EditableListComponent
                title="学习要求"
                items={requirements}
                isVisible={requirementsVisible}
                placeholder="添加新的学习要求..."
                onChange={setRequirements}
                onVisibilityChange={handleRequirementsVisibilityChange}
                onAdd={handleAddRequirement}
                onEdit={handleEditRequirement}
                onDelete={handleDeleteRequirement}
                onReorder={handleRequirementReorder}
                helperText="列出开始学习本课程前需具备的知识或技能"
                emptyStateText="暂无学习要求，请添加"
              />
            )}
          </CardContent>
        </Card>
        
        {/* Target Audience Card */}
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium">适合人群</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleRefreshSection('audiences')}
                disabled={isLoadingAudiences}
              >
                {isLoadingAudiences ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoadingAudiences ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <EditableListComponent
                title="适合人群"
                items={audiences}
                isVisible={audiencesVisible}
                placeholder="添加新的适合人群..."
                onChange={setAudiences}
                onVisibilityChange={handleAudiencesVisibilityChange}
                onAdd={handleAddAudience}
                onEdit={handleEditAudience}
                onDelete={handleDeleteAudience}
                onReorder={handleAudienceReorder}
                helperText="描述哪些人群适合学习本课程"
                emptyStateText="暂无适合人群，请添加"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
