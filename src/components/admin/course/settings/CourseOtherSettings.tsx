
import React, { useState, useEffect } from 'react';
import CourseHighlightsList from './CourseHighlightsList';
import EditableListComponent from './EditableListComponent';
import ModuleTitleEdit from './ModuleTitleEdit';
import EnrollmentGuidesEditor from './EnrollmentGuidesEditor';
import { getModuleVisibilities } from '@/lib/services/courseSettingsService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
<<<<<<< HEAD
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
import EnrollmentGuidesEditor from './EnrollmentGuidesEditor';
=======
>>>>>>> 313105d5aa6c97290f03cadb3a15d4262397e308

type SectionType = 'objectives' | 'requirements' | 'audiences';

type ModuleVisibilities = {
  objectives_visible: boolean;
  requirements_visible: boolean;
  audiences_visible: boolean;
};

interface CourseOtherSettingsProps {
  courseId: number;
}

export const CourseOtherSettings = ({ courseId }: CourseOtherSettingsProps) => {
  const [moduleVisibilities, setModuleVisibilities] = useState<ModuleVisibilities | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 加载模块可见性设置
  useEffect(() => {
    const fetchModuleVisibilities = async () => {
      if (!courseId) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await getModuleVisibilities(courseId);
        
        if (error) {
          console.error('Error fetching module visibilities:', error);
        } else if (data) {
          setModuleVisibilities(data);
        }
      } catch (err) {
        console.error('Exception fetching module visibilities:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchModuleVisibilities();
  }, [courseId]);

  // 模块可见性切换处理
  const handleVisibilityChange = async (sectionType: SectionType, isVisible: boolean) => {
    if (!moduleVisibilities) return;
    
    try {
      // 更新数据库中的可见性
      let tableName: string;
      
      switch(sectionType) {
        case 'objectives':
          tableName = 'course_learning_objectives';
          break;
        case 'requirements':
          tableName = 'course_requirements';
          break;
        case 'audiences':
          tableName = 'course_audiences';
          break;
        default:
          throw new Error(`Unknown section type: ${sectionType}`);
      }
      
      const { error } = await supabase
<<<<<<< HEAD
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

      {/* 课程亮点和购买后引导页面 - 使用网格布局 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CourseHighlightsList
          highlights={courseHighlights}
          onChange={handleCourseHighlightsChange}
          title="课程亮点"
        />
        
        {courseId && (
          <EnrollmentGuidesEditor
            courseId={courseId}
            title="购买后引导页面"
          />
        )}
=======
        .from(tableName)
        .update({ is_visible: isVisible })
        .eq('course_id', courseId);
        
      if (error) {
        console.error(`Error updating ${sectionType} visibility:`, error);
        toast.error(`更新${sectionType}可见性失败`);
        return;
      }
      
      // 更新本地状态
      setModuleVisibilities(prev => {
        if (!prev) return prev;
        
        const updatedVisibilities = { ...prev };
        switch(sectionType) {
          case 'objectives':
            updatedVisibilities.objectives_visible = isVisible;
            break;
          case 'requirements':
            updatedVisibilities.requirements_visible = isVisible;
            break;
          case 'audiences':
            updatedVisibilities.audiences_visible = isVisible;
            break;
        }
        
        return updatedVisibilities;
      });
      
      // 更新本地存储
      const storageKey = `course_${courseId}_section_visibility`;
      const currentStorage = JSON.parse(localStorage.getItem(storageKey) || '{}');
      const updatedStorage = { 
        ...currentStorage,
        [sectionType]: isVisible 
      };
      localStorage.setItem(storageKey, JSON.stringify(updatedStorage));
      
      toast.success(`${sectionType}可见性已更新`);
    } catch (err) {
      console.error(`Error updating ${sectionType} visibility:`, err);
      toast.error(`更新${sectionType}可见性失败`);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* 课程亮点 */}
      <div>
        <h3 className="text-lg font-medium mb-4">课程亮点</h3>
        <CourseHighlightsList courseId={courseId} />
>>>>>>> 313105d5aa6c97290f03cadb3a15d4262397e308
      </div>
      
      {/* 购买后引导页面 */}
      <div>
        <h3 className="text-lg font-medium mb-4">购买后引导页面</h3>
        <EnrollmentGuidesEditor courseId={courseId} />
      </div>
      
      {/* 学习目标设置 */}
      <div>
        <ModuleTitleEdit 
          courseId={courseId} 
          moduleType="objectives"
          defaultTitle="学习目标"
          defaultIcon="target"
        />

        <div className="mt-4">
          <EditableListComponent
            courseId={courseId}
            itemType="objectives"
            title="学习目标"
            tableName="course_learning_objectives"
            isVisible={moduleVisibilities?.objectives_visible ?? true}
            onVisibilityChange={(isVisible) => handleVisibilityChange('objectives', isVisible)}
          />
        </div>
      </div>
      
      {/* 学习要求设置 */}
      <div>
        <ModuleTitleEdit 
          courseId={courseId} 
          moduleType="requirements"
          defaultTitle="学习要求"
          defaultIcon="list-checks"
        />

        <div className="mt-4">
          <EditableListComponent
            courseId={courseId}
            itemType="requirements"
            title="课程要求"
            tableName="course_requirements"
            isVisible={moduleVisibilities?.requirements_visible ?? true}
            onVisibilityChange={(isVisible) => handleVisibilityChange('requirements', isVisible)}
          />
        </div>
      </div>
      
      {/* 适合人群设置 */}
      <div>
        <ModuleTitleEdit 
          courseId={courseId} 
          moduleType="audiences"
          defaultTitle="适合人群"
          defaultIcon="users"
        />

        <div className="mt-4">
          <EditableListComponent
            courseId={courseId}
            itemType="audiences"
            title="适合人群"
            tableName="course_audiences"
            isVisible={moduleVisibilities?.audiences_visible ?? true}
            onVisibilityChange={(isVisible) => handleVisibilityChange('audiences', isVisible)}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseOtherSettings;
