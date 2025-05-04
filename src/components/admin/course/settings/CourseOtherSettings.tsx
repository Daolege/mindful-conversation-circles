
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
  const [courseVisibility, setCourseVisibility] = useState<string>("published");
  
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

      try {
        const { data, error } = await supabase
          .from('courses_new')
          .select('is_featured, price, status')
          .eq('id', courseId)
          .single();

        if (error) throw error;

        if (data) {
          setIsFeatured(data.is_featured || false);
          setIsPaidContent((data.price || 0) > 0);
          setCourseVisibility(data.status || "published");
        }
      } catch (error) {
        console.error("Error loading course settings:", error);
        toast.error("无法加载课程设置");
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

      <EditableListComponent
        title="学习目标"
        description="列出学习者完成课程后将获得的技能"
        items={learningObjectivesList}
        onChange={handleLearningObjectivesChange}
        placeholder="例如: 掌握基础Python语法"
      />

      <EditableListComponent
        title="课程要求"
        description="列出参加课程所需的先决条件"
        items={requirementsList}
        onChange={handleRequirementsChange}
        placeholder="例如: 基本计算机操作技能"
      />

      <EditableListComponent
        title="适合人群"
        description="说明这门课程适合哪类学习者"
        items={targetAudienceList}
        onChange={handleTargetAudienceChange}
        placeholder="例如: 初学者, 想转行的专业人士"
      />
    </div>
  );
};
