
import React, { useState, useEffect } from 'react';
import CourseHighlightsList from './CourseHighlightsList';
import EditableListComponent from './EditableListComponent';
import ModuleTitleEdit from './ModuleTitleEdit';
import EnrollmentGuidesEditor from './EnrollmentGuidesEditor';
import { getModuleVisibilities } from '@/lib/services/courseSettingsService';

type SectionType = 'objectives' | 'requirements' | 'audience';

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
        case 'audience':
          updatedVisibilities.audiences_visible = isVisible;
          break;
      }
      
      return updatedVisibilities;
    });
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
            onVisibilityChange={(isVisible) => handleVisibilityChange('audience', isVisible)}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseOtherSettings;
