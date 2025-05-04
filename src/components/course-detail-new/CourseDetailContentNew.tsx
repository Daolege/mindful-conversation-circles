import React, { useState, useEffect } from 'react';
import { CourseWithDetails } from '@/lib/types/course-new';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedCollapsible } from '@/components/ui/animated-collapsible';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, BookOpen, 
  Download, File, Target, Award, Users, Bookmark, GraduationCap, Book, CheckCircle
} from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { getDefaultLearningObjectives, getDefaultLearningModes, getDefaultTargetAudience } from '@/lib/services/courseDefaultContentService';

interface CourseDetailContentNewProps {
  course: CourseWithDetails;
}

export const CourseDetailContentNew: React.FC<CourseDetailContentNewProps> = ({ course }) => {
  const { t } = useTranslations();
  
  const [openSectionIds, setOpenSectionIds] = useState<{[key: string]: boolean}>(() => {
    // Default: first section is open
    const initial: {[key: string]: boolean} = {};
    if (course.sections && course.sections.length > 0) {
      // Open the first section by default
      if (course.sections[0]) {
        initial[course.sections[0].id] = true;
      }
    }
    return initial;
  });
  
  const [isOutlineLoading, setIsOutlineLoading] = useState(true);
  
  useEffect(() => {
    // Simulate outline loading with a short delay to show loading animation
    const timer = setTimeout(() => {
      setIsOutlineLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  const navigate = useNavigate();

  const toggleSection = (sectionId: string) => {
    setOpenSectionIds(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  const handleFreeLearnClick = (lectureId: string) => {
    navigate(`/learn/${course.id}?source=new&lectureId=${lectureId}`);
  };

  const totalLessons = course.sections?.reduce(
    (count, section) => count + (section.lectures?.length || 0),
    0
  ) || 0;

  // 详细日志记录，用于调试
  console.log('[CourseDetailContentNew] 课程数据:', course);
  console.log('[CourseDetailContentNew] 课程ID:', course.id);
  console.log('[CourseDetailContentNew] 附件材料:', course.materials);
  console.log('[CourseDetailContentNew] 学习目标 (直接):', course.learning_objectives);
  console.log('[CourseDetailContentNew] 课程要求 (直接):', course.requirements);
  console.log('[CourseDetailContentNew] 适合人群 (直接):', course.target_audience);

  // 改进的数组有效性检查函数 - 明确区分undefined、null和空数组
  const isValidArray = (arr: any): boolean => {
    // 只有在数组完全不存在（undefined或null）时才返回false
    // 如果是空数组也视为有效，因为用户可能故意将列表清空
    return Array.isArray(arr);
  };
  
  // 改进的非空数组检查
  const hasItems = (arr: any[]): boolean => {
    return isValidArray(arr) && arr.length > 0;
  };
  
  // 记录数组有效性
  console.log('[CourseDetailContentNew] 数据有效性检查:', {
    learning_objectives: isValidArray(course.learning_objectives),
    requirements: isValidArray(course.requirements),
    target_audience: isValidArray(course.target_audience),
    learning_objectives_length: course.learning_objectives?.length,
    requirements_length: course.requirements?.length,
    target_audience_length: course.target_audience?.length,
    has_learning_items: hasItems(course.learning_objectives || []),
    has_requirement_items: hasItems(course.requirements || []),
    has_audience_items: hasItems(course.target_audience || [])
  });

  // 使用课程中的材料数据，如果不存在则提供默认值
  const courseMaterials = course.materials?.length ? course.materials : [
    { id: "mat1", course_id: course.id, name: "课程讲义.PDF", url: "#", position: 1, is_visible: true, created_at: new Date().toISOString() },
    { id: "mat2", course_id: course.id, name: "练习题.PDF", url: "#", position: 2, is_visible: true, created_at: new Date().toISOString() }
  ];

  // 改进后的数据获取逻辑：只有在数组完全不存在（undefined或null）时才使用默认值
  // 如果数据库返回了空数组，也应该尊重这个结果（用户可能是想清空这些项）
  const learningObjectives = isValidArray(course.learning_objectives) 
    ? course.learning_objectives 
    : getDefaultLearningObjectives().map(item => item.text);

  const requirements = isValidArray(course.requirements)
    ? course.requirements
    : getDefaultLearningModes().map(item => item.text);

  const targetAudience = isValidArray(course.target_audience)
    ? course.target_audience
    : getDefaultTargetAudience().map(item => item.text);
    
  // 添加日志以显示我们最终使用的数据
  console.log('[CourseDetailContentNew] 最终使用的数据:', {
    learningObjectives: learningObjectives?.length || 0,
    requirements: requirements?.length || 0,
    targetAudience: targetAudience?.length || 0,
    isFromDatabase: {
      learningObjectives: isValidArray(course.learning_objectives),
      requirements: isValidArray(course.requirements),
      targetAudience: isValidArray(course.target_audience)
    },
    firstLearningObjective: learningObjectives?.length > 0 ? learningObjectives[0] : 'none',
    firstRequirement: requirements?.length > 0 ? requirements[0] : 'none',
    firstTargetAudience: targetAudience?.length > 0 ? targetAudience[0] : 'none'
  });

  return (
    <div className="space-y-8">
      {/* 课程介绍 */}
      <Card className="hover:shadow-lg transition-shadow duration-500 shadow-sm animate-in fade-in duration-500">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl flex items-center gap-2">
            <File className="h-5 w-5" />
            {t('courses:courseIntroduction')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none py-4">
            {course.description ? (
              <div className="whitespace-pre-wrap">{course.description}</div>
            ) : (
              <div className="text-gray-500">{t('courses:noDescription')}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 课程大纲 */}
      <Card className="hover:shadow-lg transition-shadow duration-500 shadow-sm animate-in fade-in duration-500">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t('courses:courseOutline')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-sm text-gray-500 mb-4">
            {course.sections?.length || 0} {t('courses:sections')} • {t('courses:lessons', { count: totalLessons })}
          </div>

          {isOutlineLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-12 bg-gray-100 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : course.sections && course.sections.length > 0 ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              {course.sections.map((section, index) => (
                <AnimatedCollapsible
                  key={section.id}
                  isOpen={!!openSectionIds[section.id]}
                  headerContent={
                    <div className="flex justify-between w-full items-center">
                      <span className="text-lg">{section.title}</span>
                      <span className="text-xs text-gray-500">
                        {t('courses:lessons', { count: section.lectures?.length || 0 })}
                      </span>
                    </div>
                  }
                  onToggle={() => toggleSection(section.id)}
                  className="border-gray-200 hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md"
                >
                  <ul className="space-y-3">
                    {section.lectures?.map((lecture) => (
                      <li
                        key={lecture.id}
                        className="flex justify-between items-center p-4 border rounded-lg 
                          bg-white
                          transition-all duration-300 ease-in-out
                          shadow-sm hover:shadow-md
                          hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-normal">{lecture.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {lecture.is_free ? (
                            <Button 
                              size="sm" 
                              variant="knowledge" 
                              className="text-xs py-2 px-3 h-8 flex items-center gap-1"
                              onClick={() => handleFreeLearnClick(lecture.id)}
                            >
                              {t('courses:freeAccess')}
                            </Button>
                          ) : (
                            <Lock size={16} className="text-gray-400" />
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </AnimatedCollapsible>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">{t('courses:noSections')}</div>
          )}
        </CardContent>
      </Card>

      {/* 课程附件 */}
      <Card className="hover:shadow-lg transition-shadow duration-500 shadow-sm animate-in fade-in duration-500">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl flex items-center gap-2">
            <File className="h-5 w-5" />
            {t('courses:courseAttachments')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {courseMaterials && courseMaterials.length > 0 ? (
            <ul className="space-y-3">
              {courseMaterials.map((material) => (
                <li 
                  key={material.id} 
                  className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 
                    transition-all duration-300 ease-in-out 
                    shadow-sm hover:shadow-md animate-in fade-in duration-300"
                >
                  <div className="flex items-center gap-2">
                    <File size={18} className="text-gray-600" />
                    <span className="font-semibold">{material.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="knowledge"
                    className="text-xs py-2 px-3 h-8 flex items-center gap-1"
                  >
                    <Download size={14} />
                    {t('courses:download')}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">{t('courses:noAttachments')}</div>
          )}
        </CardContent>
      </Card>

      {/* 学习信息栏 - 三栏布局 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 学习目标 */}
        <Card 
          className="hover:shadow-xl transition-all duration-500 ease-in-out shadow-lg shadow-gray-200/60 border-2 
            transform hover:-translate-y-1 hover:scale-[1.01] focus:scale-[1.01]
            animate-in fade-in duration-500"
        >
          <CardHeader className="pb-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              {t('courses:learningObjectives')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {learningObjectives && learningObjectives.length > 0 ? (
              <ul className="space-y-2">
                {learningObjectives.map((objective, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-2 animate-in fade-in duration-300"
                  >
                    <Target className="h-4 w-4 text-gray-800 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">{objective}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">{t('courses:noObjectives')}</div>
            )}
          </CardContent>
        </Card>

        {/* 学习模式 (Previously called 课程要求) */}
        <Card 
          className="hover:shadow-xl transition-all duration-500 ease-in-out shadow-lg shadow-gray-200/60 border-2 
            transform hover:-translate-y-1 hover:scale-[1.01] focus:scale-[1.01]
            animate-in fade-in duration-500"
        >
          <CardHeader className="pb-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Book className="h-5 w-5" />
              {t('courses:learningModes')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {requirements && requirements.length > 0 ? (
              <ul className="space-y-2">
                {requirements.map((requirement, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-2 animate-in fade-in duration-300"
                  >
                    <Book className="h-4 w-4 text-gray-800 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">{t('courses:noRequirements')}</div>
            )}
          </CardContent>
        </Card>

        {/* 适合人群 */}
        <Card 
          className="hover:shadow-xl transition-all duration-500 ease-in-out shadow-lg shadow-gray-200/60 border-2 
            transform hover:-translate-y-1 hover:scale-[1.01] focus:scale-[1.01]
            animate-in fade-in duration-500"
        >
          <CardHeader className="pb-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('courses:targetAudience')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {targetAudience && targetAudience.length > 0 ? (
              <ul className="space-y-2">
                {targetAudience.map((audience, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-2 animate-in fade-in duration-300"
                  >
                    <Users className="h-4 w-4 text-gray-800 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">{audience}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">{t('courses:suitableForEveryone')}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
