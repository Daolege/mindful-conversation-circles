
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
