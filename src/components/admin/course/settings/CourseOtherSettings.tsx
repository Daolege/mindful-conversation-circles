
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';
import { getObjectives, getRequirements, getAudiences } from '@/lib/services/courseSettingsService';
import { Loader2 } from 'lucide-react';
import { useCourseEditor } from '@/hooks/useCourseEditor';
import { supabase } from '@/integrations/supabase/client';

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
    materials: boolean;
  };
}

// Create a separate function to handle section visibility updates
const updateSectionVisibility = async ({ courseId, section, isVisible }: { 
  courseId: number;
  section: string;
  isVisible: boolean;
}) => {
  try {
    // 使用直接的数据表操作而不是RPC方法，避免RPC不存在的问题
    let tableName = '';
    switch (section) {
      case 'objectives':
        tableName = 'course_objectives';
        break;
      case 'requirements':
        tableName = 'course_requirements';
        break;
      case 'audiences':
        tableName = 'course_audiences';
        break;
      default:
        throw new Error(`Unknown section: ${section}`);
    }
    
    // 使用直接的数据表更新操作
    const { data, error } = await supabase
      .from(tableName)
      .update({ is_visible: isVisible })
      .eq('course_id', courseId);
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating ${section} visibility:`, error);
    return { data: null, error };
  }
};

// Export BOTH as default and named export to fix import issues
export const CourseOtherSettings: React.FC<CourseOtherSettingsProps> = ({ courseId, savedSections, sectionVisibility }) => {
  const [loading, setLoading] = useState(true);
  const [objectivesVisible, setObjectivesVisible] = useState(true);
  const [requirementsVisible, setRequirementsVisible] = useState(true);
  const [audiencesVisible, setAudiencesVisible] = useState(true);
  const courseEditor = useCourseEditor();
  
  useEffect(() => {
    const loadInitialVisibility = async () => {
      setLoading(true);
      try {
        const [objectivesRes, requirementsRes, audiencesRes] = await Promise.all([
          getObjectives(courseId),
          getRequirements(courseId),
          getAudiences(courseId)
        ]);
        
        setObjectivesVisible(objectivesRes.data && objectivesRes.data.length > 0 ? objectivesRes.data[0].is_visible !== false : true);
        setRequirementsVisible(requirementsRes.data && requirementsRes.data.length > 0 ? requirementsRes.data[0].is_visible !== false : true);
        setAudiencesVisible(audiencesRes.data && audiencesRes.data.length > 0 ? audiencesRes.data[0].is_visible !== false : true);
      } catch (error) {
        console.error("Failed to load initial visibility:", error);
        toast.error("Failed to load initial visibility");
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialVisibility();
  }, [courseId]);
  
  const handleUpdateVisibility = async (section: string, isVisible: boolean) => {
    try {
      if (!courseId) {
        throw new Error("Course ID is missing");
      }
      
      const { data, error } = await updateSectionVisibility({ 
        courseId, 
        section, 
        isVisible 
      });
      
      if (error) {
        console.error(`Failed to update ${section} visibility:`, error);
        toast.error(`Failed to update ${section} visibility`);
        return;
      }
      
      toast.success(`Successfully updated ${section} visibility`);
      
      // Update local state
      switch (section) {
        case 'objectives':
          setObjectivesVisible(isVisible);
          break;
        case 'requirements':
          setRequirementsVisible(isVisible);
          break;
        case 'audiences':
          setAudiencesVisible(isVisible);
          break;
        default:
          break;
      }
      
      // Update context if available
      if (courseEditor.setSectionVisibility) {
        courseEditor.setSectionVisibility({
          ...courseEditor.sectionVisibility,
          [section]: isVisible
        });
      }
      
      // Save to localStorage
      const visibilityStorageKey = `course_${courseId}_section_visibility`;
      const visibilityData = JSON.parse(localStorage.getItem(visibilityStorageKey) || '{}');
      localStorage.setItem(visibilityStorageKey, JSON.stringify({
        ...visibilityData,
        [section]: isVisible
      }));
      
    } catch (error: any) {
      console.error(`Failed to update ${section} visibility:`, error);
      toast.error(`Failed to update ${section} visibility: ${error.message}`);
    }
  };
  
  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>其他设置</CardTitle>
        </CardHeader>
        <CardContent className="py-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>其他设置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="objectives-visibility">显示学习目标</Label>
            <Switch
              id="objectives-visibility"
              checked={objectivesVisible}
              onCheckedChange={(checked) => handleUpdateVisibility('objectives', checked)}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            在课程详情页显示或隐藏学习目标
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="requirements-visibility">显示学习前提</Label>
            <Switch
              id="requirements-visibility"
              checked={requirementsVisible}
              onCheckedChange={(checked) => handleUpdateVisibility('requirements', checked)}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            在课程详情页显示或隐藏学习前提
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="audiences-visibility">显示适合人群</Label>
            <Switch
              id="audiences-visibility"
              checked={audiencesVisible}
              onCheckedChange={(checked) => handleUpdateVisibility('audiences', checked)}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            在课程详情页显示或隐藏适合人群
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Also export as default for flexibility
export default CourseOtherSettings;
