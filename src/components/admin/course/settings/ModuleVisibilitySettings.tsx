
import React, { useState, useEffect } from 'react';
import { FormSwitch } from '../../shared/FormSwitch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ModuleVisibilitySettingsProps {
  courseId: number;
}

interface ModuleSettings {
  objectives: boolean;
  requirements: boolean;
  audiences: boolean;
}

export const ModuleVisibilitySettings: React.FC<ModuleVisibilitySettingsProps> = ({ courseId }) => {
  const [visibility, setVisibility] = useState<ModuleSettings>({
    objectives: true,
    requirements: true,
    audiences: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    
    const fetchSettings = async () => {
      setLoading(true);
      try {
        // Fetch settings from course_section_configs
        const { data, error } = await supabase.rpc('get_module_visibilities', {
          p_course_id: courseId
        });
        
        if (error) throw error;
        
        if (data) {
          setVisibility({
            objectives: data.objectives_visible !== false,
            requirements: data.requirements_visible !== false,
            audiences: data.audiences_visible !== false,
          });
        }
      } catch (error) {
        console.error('Error fetching module visibility settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [courseId]);

  const updateModuleVisibility = async (module: keyof ModuleSettings, isVisible: boolean) => {
    if (!courseId) return;
    
    setSaving(true);
    try {
      let tableName = '';
      switch (module) {
        case 'objectives':
          tableName = 'course_learning_objectives';
          break;
        case 'requirements':
          tableName = 'course_requirements';
          break;
        case 'audiences':
          tableName = 'course_audiences';
          break;
      }
      
      // Update all items in the module
      const { error } = await supabase
        .from(tableName)
        .update({ is_visible: isVisible })
        .eq('course_id', courseId);
      
      if (error) throw error;
      
      // Update local state
      setVisibility(prev => ({
        ...prev,
        [module]: isVisible
      }));
      
      toast.success(`${module}模块可见性已更新`);
    } catch (error) {
      console.error(`Error updating ${module} visibility:`, error);
      toast.error(`更新${module}模块可见性失败`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>加载模块可见性设置...</div>;
  }

  return (
    <div className="space-y-4">
      <FormSwitch
        id="objectives-visibility"
        label="显示学习目标模块"
        description="控制是否向学生显示学习目标模块"
        checked={visibility.objectives}
        onCheckedChange={(checked) => updateModuleVisibility('objectives', checked)}
        disabled={saving}
      />
      
      <FormSwitch
        id="requirements-visibility"
        label="显示学习模式模块"
        description="控制是否向学生显示学习模式/课程要求模块"
        checked={visibility.requirements}
        onCheckedChange={(checked) => updateModuleVisibility('requirements', checked)}
        disabled={saving}
      />
      
      <FormSwitch
        id="audiences-visibility"
        label="显示适合人群模块"
        description="控制是否向学生显示适合人群模块"
        checked={visibility.audiences}
        onCheckedChange={(checked) => updateModuleVisibility('audiences', checked)}
        disabled={saving}
      />
    </div>
  );
};
