
import React, { useEffect, useState } from 'react';
import { CourseMaterials } from '@/components/course/CourseMaterials';
import { Course } from '@/lib/types/course';
import { useTranslations } from "@/hooks/useTranslations";
import { supabase } from '@/integrations/supabase/client';
import { Target, BookOpen, Users } from 'lucide-react';
import IconDisplay from './IconDisplay';
import { 
  ModuleSettings, 
  ModuleItem, 
  getModuleSettings, 
  getModuleItems 
} from '@/lib/services/moduleSettingsService';

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
        // Fetch all data in parallel
        const [
          objectivesData,
          requirementsData,
          audiencesData,
          objSettings,
          reqSettings,
          audSettings
        ] = await Promise.all([
          getModuleItems('course_learning_objectives', course.id),
          getModuleItems('course_requirements', course.id),
          getModuleItems('course_audiences', course.id),
          getModuleSettings(course.id, 'objectives'),
          getModuleSettings(course.id, 'requirements'),
          getModuleSettings(course.id, 'audiences')
        ]);
        
        // Update state with fetched data
        setObjectives(objectivesData);
        setRequirements(requirementsData);
        setAudiences(audiencesData);
        
        // Update settings
        setObjectivesSettings(objSettings);
        setRequirementsSettings(reqSettings);
        setAudiencesSettings(audSettings);
      } catch (error) {
        console.error("Error fetching course module data:", error);
      }
    };
    
    fetchModuleData();
  }, [course.id]);
  
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
