
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EditableListComponent } from './EditableListComponent';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ListItem } from '@/lib/types/course-new';
import { updateTable } from '@/lib/services/typeSafeSupabase';

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
  const [courseVisibility, setCourseVisibility] = useState<string>("published");
  
  // Purchase method states
  const [allowsOneTimePurchase, setAllowsOneTimePurchase] = useState<boolean>(true);
  const [allowsSubscription, setAllowsSubscription] = useState<boolean>(true);
  const [purchaseMethodError, setPurchaseMethodError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // State for editable section titles
  const [sectionTitles, setSectionTitles] = useState({
    objectives: "学习目标",
    requirements: "课程要求",
    audience: "适合人群"
  });
  
  // Convert string arrays to object arrays with IDs for the editable lists
  const formatArrayToListItems = (arr: string[]): ListItem[] => {
    return arr.map((item, index) => ({
      id: `item-${index}`,
      text: item,
      position: index,
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

  // Load course information
  useEffect(() => {
    async function loadCourseSettings() {
      if (!courseId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('courses_new')
          .select('status, allows_one_time_purchase, allows_subscription')
          .eq('id', courseId)
          .single();

        if (error) throw error;

        if (data) {
          setCourseVisibility(data.status || "published");
          // Set purchase method states with defaults if fields are null
          setAllowsOneTimePurchase(data.allows_one_time_purchase !== false);
          setAllowsSubscription(data.allows_subscription !== false);
        }
      } catch (error: any) {
        console.error("Error loading course settings:", error);
        toast.error("无法加载课程设置");
      } finally {
        setIsLoading(false);
      }
    }

    loadCourseSettings();
  }, [courseId]);

  // Convert list items back to string arrays for saving
  const formatListItemsToArray = (items: ListItem[]): string[] => {
    return items.map(item => item.text);
  };

  const handleLearningObjectivesChange = (newItems: ListItem[]) => {
    setLearningObjectivesList(newItems);
    if (onUpdate) {
      onUpdate('learning_objectives', formatListItemsToArray(newItems));
    }
  };

  const handleRequirementsChange = (newItems: ListItem[]) => {
    setRequirementsList(newItems);
    if (onUpdate) {
      onUpdate('requirements', formatListItemsToArray(newItems));
    }
  };

  const handleTargetAudienceChange = (newItems: ListItem[]) => {
    setTargetAudienceList(newItems);
    if (onUpdate) {
      onUpdate('target_audience', formatListItemsToArray(newItems));
    }
  };

  const handleVisibilityChange = async (value: string) => {
    setCourseVisibility(value);
    if (courseId) {
      try {
        const { error } = await updateTable('courses_new', { status: value }, { id: courseId });
        
        if (error) {
          console.error("Error updating course visibility:", error);
          toast.error("更新课程可见性失败");
          return;
        }
        
        toast.success("课程可见性已更新");
      } catch (err) {
        console.error("Error updating course visibility:", err);
        toast.error("更新课程可见性失败");
      }
    }
  };

  const handleSectionTitleChange = (section: string, title: string) => {
    setSectionTitles(prev => ({
      ...prev,
      [section]: title
    }));
    // Note: We're only changing the UI display, not saving these titles to the backend
  };
  
  const handlePurchaseMethodChange = async (type: 'one_time' | 'subscription', checked: boolean) => {
    // Update local state based on checkbox type
    if (type === 'one_time') {
      setAllowsOneTimePurchase(checked);
      
      // If trying to uncheck when subscription is also unchecked
      if (!checked && !allowsSubscription) {
        setAllowsOneTimePurchase(true); // Force keep checked
        setPurchaseMethodError("必须至少选择一种购买方式");
        return;
      }
    } else {
      setAllowsSubscription(checked);
      
      // If trying to uncheck when one-time is also unchecked
      if (!checked && !allowsOneTimePurchase) {
        setAllowsSubscription(true); // Force keep checked
        setPurchaseMethodError("必须至少选择一种购买方式");
        return;
      }
    }
    
    // Clear error if we have at least one option selected
    if ((type === 'one_time' && checked) || (type === 'subscription' && checked) || 
       (type === 'one_time' && !checked && allowsSubscription) || 
       (type === 'subscription' && !checked && allowsOneTimePurchase)) {
      setPurchaseMethodError(null);
    }
    
    // Save to database if courseId is available
    if (courseId) {
      try {
        const field = type === 'one_time' ? 'allows_one_time_purchase' : 'allows_subscription';
        const updateData = { [field]: checked };
        
        const { error } = await updateTable('courses_new', updateData, { id: courseId });
          
        if (error) {
          console.error(`Error updating ${field}:`, error);
          toast.error(`更新购买方式失败`);
          // Revert the state change if there was an error
          if (type === 'one_time') {
            setAllowsOneTimePurchase(!checked);
          } else {
            setAllowsSubscription(!checked);
          }
        } else {
          toast.success("购买方式已更新");
        }
      } catch (error) {
        console.error(`Error updating purchase method:`, error);
        toast.error(`更新购买方式失败`);
      }
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>购买方式</CardTitle>
            <CardDescription>选择课程支持的购买方式（至少选择一项）</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="oneTimePurchase" 
                  checked={allowsOneTimePurchase} 
                  onCheckedChange={(checked) => handlePurchaseMethodChange('one_time', checked === true)}
                />
                <Label htmlFor="oneTimePurchase" className="font-medium">
                  单次购买
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="subscription" 
                  checked={allowsSubscription} 
                  onCheckedChange={(checked) => handlePurchaseMethodChange('subscription', checked === true)}
                />
                <Label htmlFor="subscription" className="font-medium">
                  订阅计划
                </Label>
              </div>
              
              {purchaseMethodError && (
                <div className="text-sm text-red-500">{purchaseMethodError}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EditableListComponent
          title={sectionTitles.objectives}
          titleEditable={true}
          onTitleChange={(title) => handleSectionTitleChange('objectives', title)}
          description="列出学习者完成课程后将获得的技能"
          items={learningObjectivesList}
          onChange={handleLearningObjectivesChange}
          placeholder="例如: 掌握基础Python语法"
        />

        <EditableListComponent
          title={sectionTitles.requirements}
          titleEditable={true}
          onTitleChange={(title) => handleSectionTitleChange('requirements', title)}
          description="列出参加课程所需的先决条件"
          items={requirementsList}
          onChange={handleRequirementsChange}
          placeholder="例如: 基本计算机操作技能"
        />

        <EditableListComponent
          title={sectionTitles.audience}
          titleEditable={true}
          onTitleChange={(title) => handleSectionTitleChange('audience', title)}
          description="说明这门课程适合哪类学习者"
          items={targetAudienceList}
          onChange={handleTargetAudienceChange}
          placeholder="例如: 初学者, 想转行的专业人士"
        />
      </div>
    </div>
  );
};
