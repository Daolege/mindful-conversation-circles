import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditableListComponent } from './EditableListComponent';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ListItem } from '@/lib/types/course-new';
import { 
  getObjectives, 
  getRequirements, 
  getAudiences, 
  addObjective, 
  updateObjective,
  deleteObjective, 
  updateObjectiveOrder,
  addRequirement, 
  updateRequirement,
  deleteRequirement, 
  updateRequirementOrder,
  addAudience, 
  updateAudience,
  deleteAudience, 
  updateAudienceOrder,
  updateObjectivesVisibility,
  updateRequirementsVisibility,
  updateAudiencesVisibility,
  addDefaultObjectives,
  addDefaultRequirements,
  addDefaultAudiences
} from '@/lib/services/courseSettingsService';
import { getModuleSettings, ModuleSettings, updateModuleSettings } from '@/lib/services/moduleSettingsService';
import { Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import CourseHighlightsList from './CourseHighlightsList';

// Define props for the CourseOtherSettings component
interface CourseOtherSettingsProps {
  courseId?: number;
  learningObjectives?: string[];
  requirements?: string[];
  targetAudience?: string[];
  onUpdate?: (field: string, value: any) => void;
  savedSections?: {
    objectives: boolean;
    requirements: boolean;
    audiences: boolean;
  };
  sectionVisibility?: {
    objectives: boolean;
    requirements: boolean;
    audiences: boolean;
    materials: boolean;
  };
}

export const CourseOtherSettings: React.FC<CourseOtherSettingsProps> = ({
  courseId,
  learningObjectives = [],
  requirements = [],
  targetAudience = [],
  onUpdate,
  savedSections = {
    objectives: false,
    requirements: false,
    audiences: false
  },
  sectionVisibility = {
    objectives: true,
    requirements: true,
    audiences: true,
    materials: false
  },
}) => {
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [isPaidContent, setIsPaidContent] = useState<boolean>(true);
  const [courseVisibility, setCourseVisibility] = useState<string>("draft");
  
  // 新增单次购买和订阅计划选项状态
  const [allowsOneTimePurchase, setAllowsOneTimePurchase] = useState<boolean>(true);
  const [allowsSubscription, setAllowsSubscription] = useState<boolean>(true);
  const [purchaseOptionsError, setPurchaseOptionsError] = useState<string | null>(null);
  
  // State for module settings
  const [objectivesSettings, setObjectivesSettings] = useState<ModuleSettings>({
    title: '学习目标',
    icon: 'target',
    module_type: 'objectives'
  });

  const [requirementsSettings, setRequirementsSettings] = useState<ModuleSettings>({
    title: '学习模式',
    icon: 'book-open',
    module_type: 'requirements'
  });

  const [audiencesSettings, setAudiencesSettings] = useState<ModuleSettings>({
    title: '适合人群',
    icon: 'users',
    module_type: 'audiences'
  });

  // Course highlights state
  const [courseHighlights, setCourseHighlights] = useState<ListItem[]>([
    { id: 'highlight-1', text: '高清视频课程', position: 0, icon: 'video', is_visible: true },
    { id: 'highlight-2', text: '随时随地学习', position: 1, icon: 'clock', is_visible: true },
    { id: 'highlight-3', text: '精选章节', position: 2, icon: 'star', is_visible: true },
    { id: 'highlight-4', text: '课程语言: 中文', position: 3, icon: 'language', is_visible: true },
    { id: 'highlight-5', text: '内容持续更新', position: 4, icon: 'file-text', is_visible: true },
    { id: 'highlight-6', text: '学员专属社群', position: 5, icon: 'users', is_visible: true },
    { id: 'highlight-7', text: '附赠学习资料', position: 6, icon: 'book', is_visible: true },
  ]);

  // Loading states
  const [loadingObjectives, setLoadingObjectives] = useState(true);
  const [loadingRequirements, setLoadingRequirements] = useState(true);
  const [loadingAudiences, setLoadingAudiences] = useState(true);
  
  // Convert string arrays to object arrays with IDs for the editable lists
  const formatArrayToListItems = (arr: string[]): ListItem[] => {
    return arr.map((item, index) => ({
      id: `item-${index}`,
      text: item,
      position: index,
      icon: 'smile',
      is_visible: true
    }));
  };

  const [learningObjectivesList, setLearningObjectivesList] = useState<ListItem[]>(
    formatArrayToListItems(learningObjectives)
  );
  const [requirementsList, setRequirementsList] = useState<ListItem[]>(
    formatArrayToListItems(requirements)
  );
  const [targetAudienceList, setTargetAudienceList] = useState<ListItem[]>(
    formatArrayToListItems(targetAudience)
  );

  // Validate purchase options whenever they change
  useEffect(() => {
    if (!allowsOneTimePurchase && !allowsSubscription) {
      setPurchaseOptionsError("请至少选择一种购买方式");
    } else {
      setPurchaseOptionsError(null);
    }
  }, [allowsOneTimePurchase, allowsSubscription]);

  // Load course information and module settings
  useEffect(() => {
    async function loadCourseSettings() {
      if (!courseId) return;

      try {
        const { data, error } = await supabase
          .from('courses_new')
          .select('is_featured, price, status, allows_one_time_purchase, allows_subscription')
          .eq('id', courseId)
          .single();

        if (error) throw error;

        if (data) {
          setIsFeatured(data.is_featured || false);
          setIsPaidContent((data.price || 0) > 0);
          setCourseVisibility(data.status || "draft");
          
          // 设置购买选项
          setAllowsOneTimePurchase(data.allows_one_time_purchase !== false); // 默认为true
          setAllowsSubscription(data.allows_subscription !== false); // 默认为true
        }
      } catch (error) {
        console.error("Error loading course settings:", error);
        toast.error("无法加载课程设置");
      }
    }

    async function loadModuleSettings() {
      if (!courseId) return;

      try {
        // Load module settings
        const [objSettings, reqSettings, audSettings] = await Promise.all([
          getModuleSettings(courseId, 'objectives'),
          getModuleSettings(courseId, 'requirements'),
          getModuleSettings(courseId, 'audiences')
        ]);

        setObjectivesSettings(objSettings);
        setRequirementsSettings(reqSettings);
        setAudiencesSettings(audSettings);
      } catch (error) {
        console.error("Error loading module settings:", error);
      }
    }

    loadCourseSettings();
    loadModuleSettings();
  }, [courseId]);

  // Load existing module items from database
  useEffect(() => {
    async function loadModuleItems() {
      if (!courseId) return;

      // Load learning objectives
      setLoadingObjectives(true);
      try {
        const { data: objectivesData } = await getObjectives(courseId);
        
        if (!objectivesData || objectivesData.length === 0) {
          // If no objectives found, try to add default ones
          const { data: defaultObjectivesData } = await addDefaultObjectives(courseId);
          if (defaultObjectivesData && defaultObjectivesData.length > 0) {
            const formattedObjectives = defaultObjectivesData.map(item => ({
              id: item.id,
              text: item.content,
              position: item.position,
              icon: item.icon || 'smile',
              is_visible: item.is_visible
            }));
            setLearningObjectivesList(formattedObjectives);
          }
        } else {
          const formattedObjectives = objectivesData.map(item => ({
            id: item.id,
            text: item.content,
            position: item.position,
            icon: item.icon || 'smile',
            is_visible: item.is_visible
          }));
          setLearningObjectivesList(formattedObjectives);
        }
      } catch (error) {
        console.error("Error loading learning objectives:", error);
      } finally {
        setLoadingObjectives(false);
      }

      // Load requirements
      setLoadingRequirements(true);
      try {
        const { data: requirementsData } = await getRequirements(courseId);
        
        if (!requirementsData || requirementsData.length === 0) {
          // If no requirements found, try to add default ones
          const { data: defaultRequirementsData } = await addDefaultRequirements(courseId);
          if (defaultRequirementsData && defaultRequirementsData.length > 0) {
            const formattedRequirements = defaultRequirementsData.map(item => ({
              id: item.id,
              text: item.content,
              position: item.position,
              icon: item.icon || 'smile',
              is_visible: item.is_visible
            }));
            setRequirementsList(formattedRequirements);
          }
        } else {
          const formattedRequirements = requirementsData.map(item => ({
            id: item.id,
            text: item.content,
            position: item.position,
            icon: item.icon || 'smile',
            is_visible: item.is_visible
          }));
          setRequirementsList(formattedRequirements);
        }
      } catch (error) {
        console.error("Error loading requirements:", error);
      } finally {
        setLoadingRequirements(false);
      }

      // Load target audiences
      setLoadingAudiences(true);
      try {
        const { data: audiencesData } = await getAudiences(courseId);
        
        if (!audiencesData || audiencesData.length === 0) {
          // If no audiences found, try to add default ones
          const { data: defaultAudiencesData } = await addDefaultAudiences(courseId);
          if (defaultAudiencesData && defaultAudiencesData.length > 0) {
            const formattedAudiences = defaultAudiencesData.map(item => ({
              id: item.id,
              text: item.content,
              position: item.position,
              icon: item.icon || 'smile',
              is_visible: item.is_visible
            }));
            setTargetAudienceList(formattedAudiences);
          }
        } else {
          const formattedAudiences = audiencesData.map(item => ({
            id: item.id,
            text: item.content,
            position: item.position,
            icon: item.icon || 'smile',
            is_visible: item.is_visible
          }));
          setTargetAudienceList(formattedAudiences);
        }
      } catch (error) {
        console.error("Error loading target audiences:", error);
      } finally {
        setLoadingAudiences(false);
      }
    }

    loadModuleItems();
  }, [courseId]);

  // Handle module settings update
  const handleUpdateObjectivesSettings = async (settings: Partial<ModuleSettings>) => {
    if (!courseId) return;
    
    // Create a complete ModuleSettings object by merging with existing settings
    const updatedSettings: ModuleSettings = {
      ...objectivesSettings,
      ...settings,
      module_type: 'objectives' // Ensure module_type is set correctly
    };
    
    await updateModuleSettings(courseId, 'objectives', updatedSettings);
    setObjectivesSettings(updatedSettings);
  };

  const handleUpdateRequirementsSettings = async (settings: Partial<ModuleSettings>) => {
    if (!courseId) return;
    
    // Create a complete ModuleSettings object by merging with existing settings
    const updatedSettings: ModuleSettings = {
      ...requirementsSettings,
      ...settings,
      module_type: 'requirements' // Ensure module_type is set correctly
    };
    
    await updateModuleSettings(courseId, 'requirements', updatedSettings);
    setRequirementsSettings(updatedSettings);
  };

  const handleUpdateAudiencesSettings = async (settings: Partial<ModuleSettings>) => {
    if (!courseId) return;
    
    // Create a complete ModuleSettings object by merging with existing settings
    const updatedSettings: ModuleSettings = {
      ...audiencesSettings,
      ...settings,
      module_type: 'audiences' // Ensure module_type is set correctly
    };
    
    await updateModuleSettings(courseId, 'audiences', updatedSettings);
    setAudiencesSettings(updatedSettings);
  };

  // Handle learning objectives changes
  const handleLearningObjectivesChange = async (newItems: ListItem[]) => {
    if (!courseId) return;
    setLearningObjectivesList(newItems);
    
    try {
      // Get existing items to compare what's changed
      const { data: existingItems } = await getObjectives(courseId);
      const existingIds = new Set(existingItems?.map(item => item.id) || []);
      
      // Determine which items are new, updated, or deleted
      const itemsToAdd: ListItem[] = [];
      const itemsToUpdate: { id: string, text: string, icon: string }[] = [];
      const itemsToUpdatePosition: { id: string, position: number }[] = [];
      const itemsToDelete: string[] = [];
      
      // Find items to add or update
      for (const item of newItems) {
        if (!existingIds.has(item.id)) {
          // New item
          itemsToAdd.push(item);
        } else {
          // Check if text content changed for existing items
          const existingItem = existingItems?.find(existing => existing.id === item.id);
          if (existingItem && (existingItem.content !== item.text || existingItem.icon !== item.icon)) {
            itemsToUpdate.push({ id: item.id, text: item.text, icon: item.icon || 'smile' });
          }
          
          // Check if position changed
          if (existingItem && existingItem.position !== item.position) {
            itemsToUpdatePosition.push({ id: item.id, position: item.position });
          }
        }
      }
      
      // Find items to delete
      if (existingItems) {
        for (const existingItem of existingItems) {
          if (!newItems.find(item => item.id === existingItem.id)) {
            itemsToDelete.push(existingItem.id);
          }
        }
      }
      
      // Execute the changes
      // Add new items
      for (const item of itemsToAdd) {
        await addObjective(courseId, item.text, item.position, true);
      }
      
      // Update modified items
      for (const item of itemsToUpdate) {
        await updateObjective(item.id, item.text);
        // Note: we would need to update the icon here if updateObjective supported icons
      }
      
      // Delete removed items
      for (const id of itemsToDelete) {
        await deleteObjective(id);
      }
      
      // Update positions if needed
      if (itemsToUpdatePosition.length > 0) {
        await updateObjectiveOrder(itemsToUpdatePosition);
      }
      
      if (onUpdate) {
        onUpdate('learning_objectives', newItems.map(item => item.text));
      }
    } catch (error) {
      console.error("Error updating learning objectives:", error);
      toast.error("更新学习目标失败");
    }
  };

  // Handle requirements changes
  const handleRequirementsChange = async (newItems: ListItem[]) => {
    if (!courseId) return;
    setRequirementsList(newItems);
    
    try {
      // Get existing items to compare what's changed
      const { data: existingItems } = await getRequirements(courseId);
      const existingIds = new Set(existingItems?.map(item => item.id) || []);
      
      // Determine which items are new, updated, or deleted
      const itemsToAdd: ListItem[] = [];
      const itemsToUpdate: { id: string, text: string, icon: string }[] = [];
      const itemsToUpdatePosition: { id: string, position: number }[] = [];
      const itemsToDelete: string[] = [];
      
      // Find items to add or update
      for (const item of newItems) {
        if (!existingIds.has(item.id)) {
          // New item
          itemsToAdd.push(item);
        } else {
          // Check if text content changed for existing items
          const existingItem = existingItems?.find(existing => existing.id === item.id);
          if (existingItem && (existingItem.content !== item.text || existingItem.icon !== item.icon)) {
            itemsToUpdate.push({ id: item.id, text: item.text, icon: item.icon || 'smile' });
          }
          
          // Check if position changed
          if (existingItem && existingItem.position !== item.position) {
            itemsToUpdatePosition.push({ id: item.id, position: item.position });
          }
        }
      }
      
      // Find items to delete
      if (existingItems) {
        for (const existingItem of existingItems) {
          if (!newItems.find(item => item.id === existingItem.id)) {
            itemsToDelete.push(existingItem.id);
          }
        }
      }
      
      // Execute the changes
      // Add new items
      for (const item of itemsToAdd) {
        await addRequirement(courseId, item.text, item.position, true);
      }
      
      // Update modified items
      for (const item of itemsToUpdate) {
        await updateRequirement(item.id, item.text);
        // Note: we would need to update the icon here if updateRequirement supported icons
      }
      
      // Delete removed items
      for (const id of itemsToDelete) {
        await deleteRequirement(id);
      }
      
      // Update positions if needed
      if (itemsToUpdatePosition.length > 0) {
        await updateRequirementOrder(itemsToUpdatePosition);
      }
      
      if (onUpdate) {
        onUpdate('requirements', newItems.map(item => item.text));
      }
    } catch (error) {
      console.error("Error updating requirements:", error);
      toast.error("更新学习模式失败");
    }
  };

  // Handle target audience changes
  const handleTargetAudienceChange = async (newItems: ListItem[]) => {
    if (!courseId) return;
    setTargetAudienceList(newItems);
    
    try {
      // Get existing items to compare what's changed
      const { data: existingItems } = await getAudiences(courseId);
      const existingIds = new Set(existingItems?.map(item => item.id) || []);
      
      // Determine which items are new, updated, or deleted
      const itemsToAdd: ListItem[] = [];
      const itemsToUpdate: { id: string, text: string, icon: string }[] = [];
      const itemsToUpdatePosition: { id: string, position: number }[] = [];
      const itemsToDelete: string[] = [];
      
      // Find items to add or update
      for (const item of newItems) {
        if (!existingIds.has(item.id)) {
          // New item
          itemsToAdd.push(item);
        } else {
          // Check if text content changed for existing items
          const existingItem = existingItems?.find(existing => existing.id === item.id);
          if (existingItem && (existingItem.content !== item.text || existingItem.icon !== item.icon)) {
            itemsToUpdate.push({ id: item.id, text: item.text, icon: item.icon || 'smile' });
          }
          
          // Check if position changed
          if (existingItem && existingItem.position !== item.position) {
            itemsToUpdatePosition.push({ id: item.id, position: item.position });
          }
        }
      }
      
      // Find items to delete
      if (existingItems) {
        for (const existingItem of existingItems) {
          if (!newItems.find(item => item.id === existingItem.id)) {
            itemsToDelete.push(existingItem.id);
          }
        }
      }
      
      // Execute the changes
      // Add new items
      for (const item of itemsToAdd) {
        await addAudience(courseId, item.text, item.position, true);
      }
      
      // Update modified items
      for (const item of itemsToUpdate) {
        await updateAudience(item.id, item.text);
        // Note: we would need to update the icon here if updateAudience supported icons
      }
      
      // Delete removed items
      for (const id of itemsToDelete) {
        await deleteAudience(id);
      }
      
      // Update positions if needed
      if (itemsToUpdatePosition.length > 0) {
        await updateAudienceOrder(itemsToUpdatePosition);
      }
      
      if (onUpdate) {
        onUpdate('target_audience', newItems.map(item => item.text));
      }
    } catch (error) {
      console.error("Error updating target audiences:", error);
      toast.error("更新适合人群失败");
    }
  };

  // Handle course highlights changes
  const handleCourseHighlightsChange = (newItems: ListItem[]) => {
    setCourseHighlights(newItems);
  };

  // 处理购买选项变更
  const handleOneTimePurchaseChange = (checked: boolean) => {
    // 不允许两个选项同时为false
    if (!checked && !allowsSubscription) {
      return;
    }
    
    setAllowsOneTimePurchase(checked);
    if (courseId && onUpdate) {
      onUpdate('allows_one_time_purchase', checked);
    }
    
    // 保存到数据库
    saveCoursePurchaseOptions(checked, allowsSubscription);
  };

  const handleSubscriptionChange = (checked: boolean) => {
    // 不允许两个选项同时为false
    if (!checked && !allowsOneTimePurchase) {
      return;
    }
    
    setAllowsSubscription(checked);
    if (courseId && onUpdate) {
      onUpdate('allows_subscription', checked);
    }
    
    // 保存到数据库
    saveCoursePurchaseOptions(allowsOneTimePurchase, checked);
  };

  // 保存购买选项到数据库
  const saveCoursePurchaseOptions = async (oneTime: boolean, subscription: boolean) => {
    if (!courseId) return;
    
    try {
      const { error } = await supabase
        .from('courses_new')
        .update({
          allows_one_time_purchase: oneTime,
          allows_subscription: subscription,
        })
        .eq('id', courseId);
      
      if (error) {
        console.error("Error updating course purchase options:", error);
        toast.error("保存课程购买选项失败");
      }
    } catch (error) {
      console.error("Exception saving course purchase options:", error);
      toast.error("保存课程购买选项失败");
    }
  };

  // Handle featured change
  const handleFeaturedChange = async (checked: boolean) => {
    setIsFeatured(checked);
    if (courseId && onUpdate) {
      onUpdate('is_featured', checked);
    }
  };

  const handlePaidContentChange = async (checked: boolean) => {
    setIsPaidContent(checked);
    // This is just a UI toggle, actual price changes would be managed elsewhere
  };

  const handleVisibilityChange = async (value: string) => {
    setCourseVisibility(value);
    if (courseId && onUpdate) {
      onUpdate('status', value);
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 课程可见性 - 左半屏 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>课程可见性</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={courseVisibility}
              onValueChange={handleVisibilityChange}
              className="flex flex-col space-y-2 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="published" id="published" />
                <Label htmlFor="published">已发布 - 所有用户可见</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="draft" id="draft" />
                <Label htmlFor="draft">草稿 - 仅管理员可见</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="archived" id="archived" />
                <Label htmlFor="archived">已归档 - 不显示在课程列表</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* 购买选项 - 右半屏 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>购买选项</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">请至少选择一种购买方式</p>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="one-time-purchase" 
                checked={allowsOneTimePurchase}
                onCheckedChange={handleOneTimePurchaseChange}
              />
              <Label htmlFor="one-time-purchase">支持单次购买</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="subscription" 
                checked={allowsSubscription}
                onCheckedChange={handleSubscriptionChange}
              />
              <Label htmlFor="subscription">支持订阅计划</Label>
            </div>
            {purchaseOptionsError && (
              <div className="text-sm text-red-500">{purchaseOptionsError}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 课程亮点 (NEW) - 左半屏 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CourseHighlightsList
          highlights={courseHighlights}
          onChange={handleCourseHighlightsChange}
          title="课程亮点"
        />
        
        {/* 右半屏 预留空间 */}
        <div className="hidden md:block"></div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>课程特性</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="featured-course">精选课程</Label>
            <Switch
              id="featured-course"
              checked={isFeatured}
              onCheckedChange={handleFeaturedChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="paid-content">付费内容</Label>
            <Switch
              id="paid-content"
              checked={isPaidContent}
              onCheckedChange={handlePaidContentChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Horizontal layout for the three modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loadingObjectives ? (
          <Card className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </Card>
        ) : (
          <EditableListComponent
            title={objectivesSettings.title}
            description="列出学习者完成课程后将获得的技能"
            items={learningObjectivesList}
            onChange={handleLearningObjectivesChange}
            placeholder="例如: 掌握基础Python语法"
            moduleType="objectives"
            moduleSettings={objectivesSettings}
            onUpdateModuleSettings={handleUpdateObjectivesSettings}
            courseId={courseId}
          />
        )}

        {loadingRequirements ? (
          <Card className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </Card>
        ) : (
          <EditableListComponent
            title={requirementsSettings.title}
            description="列出参加课程所需的先决条件"
            items={requirementsList}
            onChange={handleRequirementsChange}
            placeholder="例如: 基本计算机操作技能"
            moduleType="requirements"
            moduleSettings={requirementsSettings}
            onUpdateModuleSettings={handleUpdateRequirementsSettings}
            courseId={courseId}
          />
        )}

        {loadingAudiences ? (
          <Card className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </Card>
        ) : (
          <EditableListComponent
            title={audiencesSettings.title}
            description="说明这门课程适合哪类学习者"
            items={targetAudienceList}
            onChange={handleTargetAudienceChange}
            placeholder="例如: 初学者, 想转行的专业人士"
            moduleType="audiences"
            moduleSettings={audiencesSettings}
            onUpdateModuleSettings={handleUpdateAudiencesSettings}
            courseId={courseId}
          />
        )}
      </div>
    </div>
  );
};
