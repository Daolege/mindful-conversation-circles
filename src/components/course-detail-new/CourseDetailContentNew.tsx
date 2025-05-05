
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
  
  // Add state for tracking hovered card and adjacent cards
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
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
      <Card className="hover:shadow-lg transition-shadow duration-500 shadow-sm animate-in fade-in duration-500 mb-12">
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

      {/* 学习信息栏 - 三栏布局 - 增强3D悬浮卡片设计 - 调整位置离课程附件更远 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-1000 mt-28">
        {/* 学习目标 */}
        <div 
          className={`transform transition-all duration-500 ease-out ${
            hoveredCard === 'objectives' 
            ? 'scale-[1.01] z-20 translate-y-[-5px] shadow-xl' 
            : hoveredCard === 'requirements' || hoveredCard === 'audience' 
              ? 'scale-[0.995] opacity-95 translate-y-[2px]'
              : ''
          }`}
          onMouseEnter={() => setHoveredCard('objectives')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="relative overflow-visible rounded-lg border border-gray-200 bg-white shadow-lg group 
                        hover:shadow-2xl transition-all duration-500 animate-in fade-in preserve-3d">
            {/* 顶部边框装饰 */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
            
            {/* 图标 - 完全显示于顶部边框位置，不被遮挡 - 减小图标大小 */}
            <div className="absolute left-0 right-0 mx-auto -top-6 flex justify-center transform transition-all duration-700 
                         group-hover:scale-[1.03] group-hover:-translate-y-1 z-10">
              <div className="w-14 h-14 bg-gradient-to-b from-gray-50 to-gray-100 rounded-full border-4 border-white 
                          shadow-[0_2px_8px_rgba(0,0,0,0.15)] group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]
                          flex items-center justify-center overflow-visible transition-all duration-500">
                <Target className="h-7 w-7 text-gray-700" />
              </div>
            </div>
            
            <div className="pb-6 pt-10">
              {/* 创新标题设计 - 带有装饰元素和立体感 */}
              <div className="relative py-4 px-4 mb-6 overflow-hidden">
                {/* 背景层 */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50"></div>
                
                {/* 顶部装饰 */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                
                {/* 底部装饰 */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                
                {/* 左侧装饰元素 */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-transparent via-gray-200 to-transparent rounded-full"></div>
                
                {/* 右侧装饰元素 */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-transparent via-gray-200 to-transparent rounded-full"></div>
                
                <h3 className="text-xl font-bold text-center text-gray-800 transition-all duration-300
                            group-hover:text-black relative z-10
                            drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
                  {t('courses:learningObjectives')}
                </h3>
              </div>
              
              <div className="px-6 transition-all duration-500 ease-in-out group-hover:translate-y-[-1px] overflow-hidden">
                {learningObjectives && learningObjectives.length > 0 ? (
                  <ul className="space-y-4 relative transition-all duration-300">
                    {learningObjectives.map((objective, index) => (
                      <li 
                        key={index} 
                        className="flex items-start gap-3 transition-all duration-300 
                                overflow-visible group-hover:translate-x-1 whitespace-normal break-words w-full"
                        style={{ 
                          transitionDelay: `${index * 25}ms`,
                        }}
                      >
                        <div className="mt-0.5 shrink-0 w-6 h-6 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full p-1 flex-shrink-0 text-gray-700 shadow-sm 
                                      group-hover:bg-gray-200 transition-all duration-500 ease-out
                                      group-hover:shadow-md flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 transition-all duration-300 ease-in-out" />
                        </div>
                        <span className="text-gray-700 transition-all duration-300 break-words whitespace-normal">
                          {objective}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-500 italic text-center">{t('courses:noObjectives')}</div>
                )}
              </div>
            </div>
            
            {/* 底部装饰 */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent absolute bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>

        {/* 课程要求 */}
        <div 
          className={`transform transition-all duration-500 ease-out ${
            hoveredCard === 'requirements' 
            ? 'scale-[1.01] z-20 translate-y-[-5px] shadow-xl' 
            : hoveredCard === 'objectives' || hoveredCard === 'audience' 
              ? 'scale-[0.995] opacity-95 translate-y-[2px]'
              : ''
          }`}
          onMouseEnter={() => setHoveredCard('requirements')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="relative overflow-visible rounded-lg border border-gray-200 bg-white shadow-lg group 
                        hover:shadow-2xl transition-all duration-500 animate-in fade-in preserve-3d">
            {/* 顶部边框装饰 */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
            
            {/* 图标 - 完全显示于顶部边框位置，不被遮挡 - 减小图标大小 */}
            <div className="absolute left-0 right-0 mx-auto -top-6 flex justify-center transform transition-all duration-700 
                         group-hover:scale-[1.03] group-hover:-translate-y-1 z-10">
              <div className="w-14 h-14 bg-gradient-to-b from-gray-50 to-gray-100 rounded-full border-4 border-white 
                          shadow-[0_2px_8px_rgba(0,0,0,0.15)] group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]
                          flex items-center justify-center overflow-visible transition-all duration-500">
                <Book className="h-7 w-7 text-gray-700" />
              </div>
            </div>
            
            <div className="pb-6 pt-10">
              {/* 创新标题设计 - 带有装饰元素和立体感 */}
              <div className="relative py-4 px-4 mb-6 overflow-hidden">
                {/* 背景层 */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50"></div>
                
                {/* 顶部装饰 */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                
                {/* 底部装饰 */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                
                {/* 左侧装饰元素 */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-transparent via-gray-200 to-transparent rounded-full"></div>
                
                {/* 右侧装饰元素 */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-transparent via-gray-200 to-transparent rounded-full"></div>
                
                <h3 className="text-xl font-bold text-center text-gray-800 transition-all duration-300
                            group-hover:text-black relative z-10
                            drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
                  {t('courses:requirements')}
                </h3>
              </div>
              
              <div className="px-6 transition-all duration-500 ease-in-out group-hover:translate-y-[-1px] overflow-hidden">
                {requirements && requirements.length > 0 ? (
                  <ul className="space-y-4 relative transition-all duration-300">
                    {requirements.map((requirement, index) => (
                      <li 
                        key={index} 
                        className="flex items-start gap-3 transition-all duration-300 
                                overflow-visible group-hover:translate-x-1 whitespace-normal break-words w-full"
                        style={{ 
                          transitionDelay: `${index * 25}ms`,
                        }}
                      >
                        <div className="mt-0.5 shrink-0 w-6 h-6 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full p-1 flex-shrink-0 text-gray-700 shadow-sm 
                                      group-hover:bg-gray-200 transition-all duration-500 ease-out
                                      group-hover:shadow-md flex items-center justify-center">
                          <BookOpen className="h-4 w-4 transition-all duration-300 ease-in-out" />
                        </div>
                        <span className="text-gray-700 transition-all duration-300 break-words whitespace-normal">
                          {requirement}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-500 italic text-center">{t('courses:noRequirements')}</div>
                )}
              </div>
            </div>
            
            {/* 底部装饰 */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent absolute bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>

        {/* 适合人群 */}
        <div 
          className={`transform transition-all duration-500 ease-out ${
            hoveredCard === 'audience' 
            ? 'scale-[1.01] z-20 translate-y-[-5px] shadow-xl' 
            : hoveredCard === 'objectives' || hoveredCard === 'requirements' 
              ? 'scale-[0.995] opacity-95 translate-y-[2px]'
              : ''
          }`}
          onMouseEnter={() => setHoveredCard('audience')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="relative overflow-visible rounded-lg border border-gray-200 bg-white shadow-lg group 
                        hover:shadow-2xl transition-all duration-500 animate-in fade-in preserve-3d">
            {/* 顶部边框装饰 */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
            
            {/* 图标 - 完全显示于顶部边框位置，不被遮挡 - 减小图标大小 */}
            <div className="absolute left-0 right-0 mx-auto -top-6 flex justify-center transform transition-all duration-700 
                         group-hover:scale-[1.03] group-hover:-translate-y-1 z-10">
              <div className="w-14 h-14 bg-gradient-to-b from-gray-50 to-gray-100 rounded-full border-4 border-white 
                          shadow-[0_2px_8px_rgba(0,0,0,0.15)] group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]
                          flex items-center justify-center overflow-visible transition-all duration-500">
                <Users className="h-7 w-7 text-gray-700" />
              </div>
            </div>
            
            <div className="pb-6 pt-10">
              {/* 创新标题设计 - 带有装饰元素和立体感 */}
              <div className="relative py-4 px-4 mb-6 overflow-hidden">
                {/* 背景层 */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50"></div>
                
                {/* 顶部装饰 */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                
                {/* 底部装饰 */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                
                {/* 左侧装饰元素 */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-transparent via-gray-200 to-transparent rounded-full"></div>
                
                {/* 右侧装饰元素 */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-transparent via-gray-200 to-transparent rounded-full"></div>
                
                <h3 className="text-xl font-bold text-center text-gray-800 transition-all duration-300
                            group-hover:text-black relative z-10
                            drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
                  {t('courses:targetAudience')}
                </h3>
              </div>
              
              <div className="px-6 transition-all duration-500 ease-in-out group-hover:translate-y-[-1px] overflow-hidden">
                {targetAudience && targetAudience.length > 0 ? (
                  <ul className="space-y-4 relative transition-all duration-300">
                    {targetAudience.map((audience, index) => (
                      <li 
                        key={index} 
                        className="flex items-start gap-3 transition-all duration-300 
                                overflow-visible group-hover:translate-x-1 whitespace-normal break-words w-full"
                        style={{ 
                          transitionDelay: `${index * 25}ms`,
                        }}
                      >
                        <div className="mt-0.5 shrink-0 w-6 h-6 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full p-1 flex-shrink-0 text-gray-700 shadow-sm 
                                      group-hover:bg-gray-200 transition-all duration-500 ease-out
                                      group-hover:shadow-md flex items-center justify-center">
                          <Users className="h-4 w-4 transition-all duration-300 ease-in-out" />
                        </div>
                        <span className="text-gray-700 transition-all duration-300 break-words whitespace-normal">
                          {audience}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-500 italic text-center">{t('courses:suitableForEveryone')}</div>
                )}
              </div>
            </div>
            
            {/* 底部装饰 */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent absolute bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
