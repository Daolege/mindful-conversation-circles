
import React, { useEffect, useState } from 'react';
import { CourseMaterials } from '@/components/course/CourseMaterials';
import { Course } from '@/lib/types/course';
import { useTranslations } from "@/hooks/useTranslations";
import { supabase } from '@/integrations/supabase/client';
import { Target, BookOpen, Users } from 'lucide-react';
import IconDisplay from './IconDisplay';
import { ModuleSettings, ModuleItem, getDefaultModuleSettings } from '@/lib/services/moduleSettingsService';
import { typeSafeSupabase } from '@/lib/services/typeSafeSupabase';

interface CourseDetailContentProps {
  course: Course;
}

export function CourseDetailContent({ course }: CourseDetailContentProps) {
  const { t } = useTranslations();
  
  // State for module data
  const [objectives, setObjectives] = useState<ModuleItem[]>([]);
  const [requirements, setRequirements] = useState<ModuleItem[]>([]);
  const [audiences, setAudiences] = useState<ModuleItem[]>([]);
  
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
  
  // Get materials visibility from course data
  const materialsVisible = course.materialsVisible !== false; // Default to true if undefined
  
  // Fetch module data from database
  useEffect(() => {
    const fetchModuleData = async () => {
      if (!course.id) return;
      
      try {
        // Fetch module items using typeSafeSupabase helper to avoid type issues
        const fetchModuleItems = async (tableName: string): Promise<ModuleItem[]> => {
          try {
            // Use explicit type casting to avoid TypeScript limitations with dynamic table names
            const { data, error } = await supabase
              .from(tableName as any)
              .select('*')
              .eq('course_id', course.id)
              .eq('is_visible', true)
              .order('position');
              
            if (error) throw error;
            
            // Add default icon if missing and convert to ModuleItem type
            return (Array.isArray(data) ? data : []).map(item => ({
              ...item,
              icon: item.icon || 'check'
            })) as ModuleItem[];
          } catch (error) {
            console.error(`Error fetching ${tableName}:`, error);
            return [];
          }
        };
        
        // Fetch module settings using RPC function
        const fetchSettings = async (moduleType: string): Promise<ModuleSettings> => {
          try {
            const { data, error } = await supabase.rpc('get_module_settings', {
              p_course_id: course.id,
              p_module_type: moduleType
            });
            
            if (error) throw error;
            
            // Convert JSON data to ModuleSettings type with proper type safety
            if (data && typeof data === 'object' && !Array.isArray(data)) {
              const jsonData = data as Record<string, any>;
              return {
                title: jsonData.title || getDefaultTitle(moduleType),
                icon: jsonData.icon || getDefaultIcon(moduleType),
                module_type: moduleType
              };
            }
            
            return getDefaultModuleSettings(moduleType);
          } catch (error) {
            console.error(`Error fetching ${moduleType} settings:`, error);
            return getDefaultModuleSettings(moduleType);
          }
        };
        
        // Fetch all data in parallel
        const [
          objectivesData,
          requirementsData,
          audiencesData,
          objSettings,
          reqSettings,
          audSettings
        ] = await Promise.all([
          fetchModuleItems('course_learning_objectives'),
          fetchModuleItems('course_requirements'),
          fetchModuleItems('course_audiences'),
          fetchSettings('objectives'),
          fetchSettings('requirements'),
          fetchSettings('audiences')
        ]);
        
        // Update state with fetched data
        setObjectives(objectivesData);
        setRequirements(requirementsData);
        setAudiences(audiencesData);
        
        // Update settings
        if (objSettings) setObjectivesSettings(objSettings);
        if (reqSettings) setRequirementsSettings(reqSettings);
        if (audSettings) setAudiencesSettings(audSettings);
      } catch (error) {
        console.error("Error fetching course module data:", error);
      }
    };
    
    fetchModuleData();
  }, [course.id]);
  
  // Helper functions for getting specific default values
  const getDefaultTitle = (moduleType: string): string => {
    const titles: Record<string, string> = {
      'objectives': '学习目标',
      'requirements': '学习模式',
      'audiences': '适合人群'
    };
    return titles[moduleType] || '课程部分';
  };
  
  const getDefaultIcon = (moduleType: string): string => {
    const icons: Record<string, string> = {
      'objectives': 'target',
      'requirements': 'book-open',
      'audiences': 'users'
    };
    return icons[moduleType] || 'check';
  };
  
  // Fallback to whatyouwilllearn if no objectives in database
  const displayObjectives = objectives.length > 0 
    ? objectives 
    : (course.whatyouwilllearn?.map((item, index) => ({
        id: `legacy-${index}`,
        content: item,
        position: index,
        is_visible: true,
        icon: 'check'
      })) || []);
  
  // Fallback to requirements if no requirements in database
  const displayRequirements = requirements.length > 0
    ? requirements
    : (course.requirements?.map((item, index) => ({
        id: `legacy-${index}`,
        content: item,
        position: index,
        is_visible: true,
        icon: 'check'
      })) || []);
    
  // Fallback to target_audience if no audiences in database
  const displayAudiences = audiences.length > 0
    ? audiences
    : (course.whatyouwilllearn?.map((item, index) => ({ // Using whatyouwilllearn as fallback
        id: `legacy-${index}`,
        content: item,
        position: index,
        is_visible: true,
        icon: 'check'
      })) || []);
  
  return (
    <div className="space-y-8">
      {course.description && (
        <section>
          <h2 className="text-xl font-bold mb-3">{t('courses:courseIntro')}</h2>
          <div className="prose max-w-none">
            <p>{course.description}</p>
          </div>
        </section>
      )}

      {displayObjectives.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <IconDisplay iconName={objectivesSettings.icon} fallback={<Target />} />
            <span>{objectivesSettings.title}</span>
          </h2>
          <ul className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            {displayObjectives.map((item) => (
              <li key={item.id} className="flex items-start gap-2">
                <IconDisplay 
                  iconName={item.icon || 'check'} 
                  className="text-primary flex-shrink-0 mt-1" 
                  size={18}
                />
                <span className="text-gray-700">{item.content}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      
      {displayRequirements.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <IconDisplay iconName={requirementsSettings.icon} fallback={<BookOpen />} />
            <span>{requirementsSettings.title}</span>
          </h2>
          <ul className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            {displayRequirements.map((item) => (
              <li key={item.id} className="flex items-start gap-2">
                <IconDisplay 
                  iconName={item.icon || 'check'} 
                  className="text-primary flex-shrink-0 mt-1" 
                  size={18}
                />
                <span className="text-gray-700">{item.content}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      
      {displayAudiences.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <IconDisplay iconName={audiencesSettings.icon} fallback={<Users />} />
            <span>{audiencesSettings.title}</span>
          </h2>
          <ul className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            {displayAudiences.map((item) => (
              <li key={item.id} className="flex items-start gap-2">
                <IconDisplay 
                  iconName={item.icon || 'check'} 
                  className="text-primary flex-shrink-0 mt-1" 
                  size={18}
                />
                <span className="text-gray-700">{item.content}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      
      {course.materials && course.materials.length > 0 && materialsVisible && (
        <section>
          <h2 className="text-xl font-bold mb-3">{t('courses:courseMaterials')}</h2>
          <CourseMaterials 
            materials={course.materials} 
            isVisible={materialsVisible}
          />
        </section>
      )}
    </div>
  );
}
