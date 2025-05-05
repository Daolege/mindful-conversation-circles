
import React, { useState } from 'react';
import { CourseWithDetails } from '@/lib/types/course-new';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedCollapsible } from '@/components/ui/animated-collapsible';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, BookOpen, 
  Download, File, Target, Award, Users, Bookmark, GraduationCap, Book, CheckCircle,
  Video, Clock, Star, Languages, FileText
} from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import IconDisplay from '../course-detail/IconDisplay';

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
  
  React.useEffect(() => {
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

  // Generate sample materials if none exist
  const courseMaterials = course.materials?.length ? course.materials : [
    { id: "mat1", course_id: course.id, name: "课程讲义.PDF", url: "#", position: 1, is_visible: true, created_at: new Date().toISOString() },
    { id: "mat2", course_id: course.id, name: "练习题.PDF", url: "#", position: 2, is_visible: true, created_at: new Date().toISOString() }
  ];

  // Default learning objectives if none exist
  const learningObjectives = course.learning_objectives?.length ? course.learning_objectives : [
    "人工智能基础知识的掌握",
    "机器学习算法的理解",
    "神经网络基础",
    "AI应用场景理解"
  ];

  // Default requirements if none exist
  const requirements = course.requirements?.length ? course.requirements : [
    "基本编程技能(推荐Python)",
    "具备初步的数学知识(统计学基础)",
    "有兴趣了解AI发展前沿"
  ];

  // Default target audience if none exist
  const targetAudience = course.target_audience?.length ? course.target_audience : [
    "对人工智能感兴趣的初学者",
    "希望提升个人技能的专业人士",
    "想在AI领域发展的学习者",
    "对技术有兴趣的爱好者"
  ];

  // Default course highlights - 保留这个数据，但不在此组件中渲染
  const courseHighlights = [
    { icon: 'video', text: '高清视频课程' },
    { icon: 'clock', text: '随时随地学习' },
    { icon: 'star', text: `${course.sections?.length || 0}个精选章节` },
    { icon: 'language', text: `课程语言: ${course.language === 'zh' ? '中文' : '英文'}` },
    { icon: 'file-text', text: '内容持续更新' },
    { icon: 'users', text: '学员专属社群' },
    { icon: 'book', text: '附赠学习资料' }
  ];

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

      {/* 删除课程亮点卡片 */}

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
                    {section.lectures?.map((lecture, lectureIdx) => (
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
              {courseMaterials.map((material, idx) => (
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

      {/* 学习信息栏 - 三栏布局 - Enhanced with better UI/UX */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 学习目标 */}
        <Card 
          className="overflow-hidden hover:shadow-xl transition-all duration-500 border-0 group
            animate-in fade-in duration-500 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-70"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
          
          <CardHeader className="pb-0 relative">
            <div className="mb-2 w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg font-bold text-gray-800">
              {t('courses:learningObjectives')}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-4 relative z-10">
            {learningObjectives && learningObjectives.length > 0 ? (
              <ul className="space-y-3">
                {learningObjectives.map((objective, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-3 group animate-in fade-in duration-300 hover:translate-x-1 transition-transform"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="mt-0.5 bg-blue-100 rounded-full p-1 flex-shrink-0 text-blue-700 shadow-sm group-hover:bg-blue-200 transition-colors">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <span className="text-gray-700 font-medium">{objective}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500 italic">{t('courses:noObjectives')}</div>
            )}
          </CardContent>
        </Card>

        {/* 课程要求 */}
        <Card 
          className="overflow-hidden hover:shadow-xl transition-all duration-500 border-0 group
            animate-in fade-in duration-500 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-70"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400"></div>
          
          <CardHeader className="pb-0 relative">
            <div className="mb-2 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Book className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg font-bold text-gray-800">
              {t('courses:requirements')}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-4 relative z-10">
            {requirements && requirements.length > 0 ? (
              <ul className="space-y-3">
                {requirements.map((requirement, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-3 group animate-in fade-in duration-300 hover:translate-x-1 transition-transform"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="mt-0.5 bg-amber-100 rounded-full p-1 flex-shrink-0 text-amber-700 shadow-sm group-hover:bg-amber-200 transition-colors">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <span className="text-gray-700 font-medium">{requirement}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500 italic">{t('courses:noRequirements')}</div>
            )}
          </CardContent>
        </Card>

        {/* 适合人群 */}
        <Card 
          className="overflow-hidden hover:shadow-xl transition-all duration-500 border-0 group
            animate-in fade-in duration-500 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-70"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
          
          <CardHeader className="pb-0 relative">
            <div className="mb-2 w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg font-bold text-gray-800">
              {t('courses:targetAudience')}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-4 relative z-10">
            {targetAudience && targetAudience.length > 0 ? (
              <ul className="space-y-3">
                {targetAudience.map((audience, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-3 group animate-in fade-in duration-300 hover:translate-x-1 transition-transform"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="mt-0.5 bg-green-100 rounded-full p-1 flex-shrink-0 text-green-700 shadow-sm group-hover:bg-green-200 transition-colors">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="text-gray-700 font-medium">{audience}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500 italic">{t('courses:suitableForEveryone')}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
