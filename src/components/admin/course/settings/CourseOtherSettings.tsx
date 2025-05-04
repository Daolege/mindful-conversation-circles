
import React, { useState, useEffect } from 'react';
import CourseHighlightsList from './CourseHighlightsList';
import EditableListComponent from './EditableListComponent';
import ModuleTitleEdit from './ModuleTitleEdit';
import EnrollmentGuidesEditor from './EnrollmentGuidesEditor';
import { getModuleVisibilities } from '@/lib/services/courseSettingsService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
