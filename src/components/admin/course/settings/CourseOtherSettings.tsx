<<<<<<< HEAD
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
=======
>>>>>>> 5aeccfc5979759859051b1d11914bcfedb975ae1

import React, { useState, useEffect } from 'react';
import { FormSwitch } from '../../shared/FormSwitch';
import { ModuleVisibilitySettings } from './ModuleVisibilitySettings';
import { EnrollmentGuidesEditor } from './EnrollmentGuidesEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCourseSettings, updateCourseSettings } from '@/lib/services/courseSettingsService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CourseOtherSettingsProps {
  courseId: number;
}

export const CourseOtherSettings: React.FC<CourseOtherSettingsProps> = ({ courseId }) => {
  const [loading, setLoading] = useState(true);
  const [materialsVisible, setMaterialsVisible] = useState(true);
  const [saving, setSaving] = useState(false);

<<<<<<< HEAD
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
=======
>>>>>>> 5aeccfc5979759859051b1d11914bcfedb975ae1
  useEffect(() => {
    const fetchSettings = async () => {
      if (!courseId) return;
      setLoading(true);
      try {
        const { data, error } = await getCourseSettings(courseId);
        
        if (error) throw error;
        
        setMaterialsVisible(data?.materialsvisible !== false); // Default to true if undefined
      } catch (error) {
        console.error("Error fetching course settings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [courseId]);

  const handleMaterialsVisibilityChange = async (visible: boolean) => {
    if (!courseId) return;
    
    setSaving(true);
    try {
      const { error } = await updateCourseSettings(courseId, {
        materialsvisible: visible
      });
      
      if (error) throw error;
      
      setMaterialsVisible(visible);
      toast.success("课程资料可见性已更新");
    } catch (error) {
      console.error("Error updating materials visibility:", error);
      toast.error("更新课程资料可见性失败");
    } finally {
      setSaving(false);
    }
  };

<<<<<<< HEAD
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

=======
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p className="text-lg">加载课程设置...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
>>>>>>> 5aeccfc5979759859051b1d11914bcfedb975ae1
      <Card>
        <CardHeader>
          <CardTitle>模块可见性设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormSwitch
            id="materials-visibility"
            label="显示课程资料"
            description="控制学生是否可以查看课程资料"
            checked={materialsVisible}
            onCheckedChange={handleMaterialsVisibilityChange}
            disabled={saving}
          />
          
          <ModuleVisibilitySettings courseId={courseId} />
        </CardContent>
      </Card>

      <EnrollmentGuidesEditor courseId={courseId} />
    </div>
  );
};
