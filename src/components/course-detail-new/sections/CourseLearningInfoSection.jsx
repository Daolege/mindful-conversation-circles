
import React from 'react';
import { Target, Book, Users, CheckCircle, BookOpen } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { Skeleton } from '@/components/ui/skeleton';

const CourseLearningInfoSection = ({ 
  course, 
  isLoading = false,
  isVisible = true,
  onVisibilityChange = () => {}
}) => {
  const { t } = useTranslations();
  const [hoveredCard, setHoveredCard] = React.useState(null);
  
  // Default learning objectives if none exist
  const learningObjectives = course?.learning_objectives?.length 
    ? course.learning_objectives 
    : ["人工智能基础知识的掌握", "机器学习算法的理解", "神经网络基础", "AI应用场景理解"];

  // Default requirements if none exist
  const requirements = course?.requirements?.length 
    ? course.requirements 
    : ["基本编程技能(推荐Python)", "具备初步的数学知识(统计学基础)", "有兴趣了解AI发展前沿"];

  // Default target audience if none exist
  const targetAudience = course?.target_audience?.length 
    ? course.target_audience 
    : ["对人工智能感兴趣的初学者", "希望提升个人技能的专业人士", "想在AI领域发展的学习者", "对技术有兴趣的爱好者"];
  
  // Use IntersectionObserver to detect when component is in viewport
  React.useEffect(() => {
    if (!isLoading) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          onVisibilityChange(entry.isIntersecting);
        },
        { threshold: 0.1 }
      );
      
      const element = document.getElementById('course-learning-info-section');
      if (element) {
        observer.observe(element);
      }
      
      return () => {
        if (element) {
          observer.unobserve(element);
        }
      };
    }
  }, [isLoading, onVisibilityChange]);

  if (isLoading || !isVisible) {
    return (
      <div id="course-learning-info-section" className="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-1000 mt-36">
        {[1, 2, 3].map(i => (
          <div key={i} className="relative overflow-visible rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="absolute left-0 right-0 mx-auto -top-6 flex justify-center">
              <Skeleton className="w-12 h-12 rounded-full" />
            </div>
            <div className="pb-6 pt-8">
              <div className="relative py-4 px-4 mb-4">
                <Skeleton className="h-6 w-40 mx-auto" />
              </div>
              <div className="px-6">
                <div className="space-y-3.5">
                  {[1, 2, 3, 4].map(j => (
                    <div key={j} className="flex items-start gap-3">
                      <Skeleton className="w-6 h-6 rounded-full mt-0.5" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div id="course-learning-info-section" className="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-1000 mt-36">
      {/* 学习目标 */}
      <div 
        className={`transform transition-all duration-500 ease-out ${
          hoveredCard === 'objectives' 
          ? 'scale-[1.003] z-20' 
          : hoveredCard === 'requirements' || hoveredCard === 'audience' 
            ? 'scale-[0.999] opacity-99'
            : ''
        }`}
        onMouseEnter={() => setHoveredCard('objectives')}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div className="relative overflow-visible rounded-lg border border-gray-200 bg-white 
                      group hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] shadow-[0_4px_12px_-3px_rgba(0,0,0,0.1),0_3px_4px_-2px_rgba(0,0,0,0.05)]
                      transition-all duration-500 animate-in fade-in preserve-3d">
          {/* 顶部边框装饰 - 使用知识主题颜色 */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-knowledge-primary/70 via-knowledge-primary to-knowledge-primary/70 transition-all duration-500 group-hover:opacity-100"></div>
          
          {/* 图标 - 调整大小和位置 */}
          <div className="absolute left-0 right-0 mx-auto -top-6 flex justify-center transform transition-all duration-700 
                       group-hover:scale-[1.02] group-hover:-translate-y-0.5 z-10">
            <div className="w-12 h-12 bg-gradient-to-b from-gray-50 to-gray-100 rounded-full border-4 border-white 
                        shadow-[0_2px_10px_rgba(0,0,0,0.12)] group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.16)]
                        flex items-center justify-center overflow-visible transition-all duration-500">
              <Target className="h-6 w-6 text-gray-700 group-hover:text-knowledge-primary transition-colors duration-500" />
            </div>
          </div>
          
          <div className="pb-6 pt-8">
            {/* 创新标题设计 - 增强光晕效果和线条扩展动画 - 移除四角边框 */}
            <div className="relative py-4 px-4 mb-4 overflow-hidden group-hover:bg-gradient-to-r group-hover:from-gray-50/80 group-hover:via-gray-100/90 group-hover:to-gray-50/80 transition-all duration-700">
              {/* 背景增强光晕 - 2倍强度 */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                {/* 光晕效果增强 */}
                <div className="absolute inset-0 bg-radial-gradient from-gray-200/60 via-gray-100/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50/20 via-gray-200/40 to-gray-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 mix-blend-overlay"></div>
                
                {/* 扩展光效 */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50/30 via-transparent to-gray-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-md"></div>
              </div>
              
              {/* 顶部装饰线条 - 动画扩展效果 */}
              <div className="absolute top-0 left-[30%] right-[30%] h-[1px] bg-gradient-to-r from-transparent via-gray-400 to-transparent 
                           transition-all duration-700 group-hover:left-[10%] group-hover:right-[10%] group-hover:via-knowledge-primary/80"></div>
              
              {/* 底部装饰线条 - 动画扩展效果 */}
              <div className="absolute bottom-0 left-[30%] right-[30%] h-[1px] bg-gradient-to-r from-transparent via-gray-400 to-transparent
                           transition-all duration-700 group-hover:left-[10%] group-hover:right-[10%] group-hover:via-knowledge-primary/60"></div>
              
              <h3 className="text-xl font-bold text-center text-gray-800 transition-all duration-500
                          group-hover:text-knowledge-primary relative z-10
                          drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                {t('courses:learningObjectives')}
              </h3>
            </div>
            
            <div className="px-6 transition-all duration-500 ease-in-out group-hover:translate-y-[-1px] overflow-hidden">
              {learningObjectives && learningObjectives.length > 0 ? (
                <ul className="space-y-3.5 relative transition-all duration-300">
                  {learningObjectives.map((objective, index) => (
                    <li 
                      key={index} 
                      className="flex items-start gap-3 transition-all duration-300 
                              overflow-visible group-hover:translate-x-0.5 whitespace-normal break-words w-full"
                      style={{ 
                        transitionDelay: `${index * 20}ms`,
                      }}
                    >
                      <div className="mt-0.5 shrink-0 w-6 h-6 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full p-1 flex-shrink-0 text-gray-700 shadow-sm 
                                    group-hover:bg-gray-100 transition-all duration-500 ease-out
                                    group-hover:shadow-md flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 transition-all duration-300 ease-in-out group-hover:text-knowledge-primary" />
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
              
              {/* 添加底部阴影消除 - 确保没有多余的阴影 */}
              <div className="h-6 w-full relative">
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white to-transparent"></div>
              </div>
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
          ? 'scale-[1.003] z-20' 
          : hoveredCard === 'objectives' || hoveredCard === 'audience' 
            ? 'scale-[0.999] opacity-99'
            : ''
        }`}
        onMouseEnter={() => setHoveredCard('requirements')}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div className="relative overflow-visible rounded-lg border border-gray-200 bg-white 
                      group hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] shadow-[0_4px_12px_-3px_rgba(0,0,0,0.1),0_3px_4px_-2px_rgba(0,0,0,0.05)]
                      transition-all duration-500 animate-in fade-in preserve-3d">
          {/* 顶部边框装饰 */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-knowledge-primary/70 via-knowledge-primary to-knowledge-primary/70 transition-all duration-500 group-hover:opacity-100"></div>
          
          {/* 图标 */}
          <div className="absolute left-0 right-0 mx-auto -top-6 flex justify-center transform transition-all duration-700 
                       group-hover:scale-[1.02] group-hover:-translate-y-0.5 z-10">
            <div className="w-12 h-12 bg-gradient-to-b from-gray-50 to-gray-100 rounded-full border-4 border-white 
                        shadow-[0_2px_10px_rgba(0,0,0,0.12)] group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.16)]
                        flex items-center justify-center overflow-visible transition-all duration-500">
              <Book className="h-6 w-6 text-gray-700 group-hover:text-knowledge-primary transition-colors duration-500" />
            </div>
          </div>
          
          <div className="pb-6 pt-8">
            {/* 标题设计 */}
            <div className="relative py-4 px-4 mb-4 overflow-hidden group-hover:bg-gradient-to-r group-hover:from-gray-50/80 group-hover:via-gray-100/90 group-hover:to-gray-50/80 transition-all duration-700">
              {/* 背景光晕 */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 bg-radial-gradient from-gray-200/60 via-gray-100/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50/20 via-gray-200/40 to-gray-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50/30 via-transparent to-gray-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-md"></div>
              </div>
              
              {/* 装饰线条 */}
              <div className="absolute top-0 left-[30%] right-[30%] h-[1px] bg-gradient-to-r from-transparent via-gray-400 to-transparent 
                           transition-all duration-700 group-hover:left-[10%] group-hover:right-[10%] group-hover:via-knowledge-primary/80"></div>
              <div className="absolute bottom-0 left-[30%] right-[30%] h-[1px] bg-gradient-to-r from-transparent via-gray-400 to-transparent
                           transition-all duration-700 group-hover:left-[10%] group-hover:right-[10%] group-hover:via-knowledge-primary/60"></div>
              
              <h3 className="text-xl font-bold text-center text-gray-800 transition-all duration-500
                          group-hover:text-knowledge-primary relative z-10
                          drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                {t('courses:requirements')}
              </h3>
            </div>
            
            <div className="px-6 transition-all duration-500 ease-in-out group-hover:translate-y-[-1px] overflow-hidden">
              {requirements && requirements.length > 0 ? (
                <ul className="space-y-3.5 relative transition-all duration-300">
                  {requirements.map((requirement, index) => (
                    <li 
                      key={index} 
                      className="flex items-start gap-3 transition-all duration-300 
                              overflow-visible group-hover:translate-x-0.5 whitespace-normal break-words w-full"
                      style={{ transitionDelay: `${index * 20}ms` }}
                    >
                      <div className="mt-0.5 shrink-0 w-6 h-6 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full p-1 flex-shrink-0 text-gray-700 shadow-sm 
                                    group-hover:bg-gray-100 transition-all duration-500 ease-out
                                    group-hover:shadow-md flex items-center justify-center">
                        <BookOpen className="h-4 w-4 transition-all duration-300 ease-in-out group-hover:text-knowledge-primary" />
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
              
              <div className="h-6 w-full relative">
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white to-transparent"></div>
              </div>
            </div>
          </div>
          
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent absolute bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>

      {/* 适合人群 */}
      <div 
        className={`transform transition-all duration-500 ease-out ${
          hoveredCard === 'audience' 
          ? 'scale-[1.003] z-20' 
          : hoveredCard === 'objectives' || hoveredCard === 'requirements' 
            ? 'scale-[0.999] opacity-99'
            : ''
        }`}
        onMouseEnter={() => setHoveredCard('audience')}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div className="relative overflow-visible rounded-lg border border-gray-200 bg-white 
                      group hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] shadow-[0_4px_12px_-3px_rgba(0,0,0,0.1),0_3px_4px_-2px_rgba(0,0,0,0.05)]
                      transition-all duration-500 animate-in fade-in preserve-3d">
          {/* 顶部边框装饰 */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-knowledge-primary/70 via-knowledge-primary to-knowledge-primary/70 transition-all duration-500 group-hover:opacity-100"></div>
          
          {/* 图标 */}
          <div className="absolute left-0 right-0 mx-auto -top-6 flex justify-center transform transition-all duration-700 
                       group-hover:scale-[1.02] group-hover:-translate-y-0.5 z-10">
            <div className="w-12 h-12 bg-gradient-to-b from-gray-50 to-gray-100 rounded-full border-4 border-white 
                        shadow-[0_2px_10px_rgba(0,0,0,0.12)] group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.16)]
                        flex items-center justify-center overflow-visible transition-all duration-500">
              <Users className="h-6 w-6 text-gray-700 group-hover:text-knowledge-primary transition-colors duration-500" />
            </div>
          </div>
          
          <div className="pb-6 pt-8">
            {/* 标题设计 */}
            <div className="relative py-4 px-4 mb-4 overflow-hidden group-hover:bg-gradient-to-r group-hover:from-gray-50/80 group-hover:via-gray-100/90 group-hover:to-gray-50/80 transition-all duration-700">
              {/* 背景光晕 */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 bg-radial-gradient from-gray-200/60 via-gray-100/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50/20 via-gray-200/40 to-gray-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50/30 via-transparent to-gray-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-md"></div>
              </div>
              
              {/* 装饰线条 */}
              <div className="absolute top-0 left-[30%] right-[30%] h-[1px] bg-gradient-to-r from-transparent via-gray-400 to-transparent 
                           transition-all duration-700 group-hover:left-[10%] group-hover:right-[10%] group-hover:via-knowledge-primary/80"></div>
              <div className="absolute bottom-0 left-[30%] right-[30%] h-[1px] bg-gradient-to-r from-transparent via-gray-400 to-transparent
                           transition-all duration-700 group-hover:left-[10%] group-hover:right-[10%] group-hover:via-knowledge-primary/60"></div>
              
              <h3 className="text-xl font-bold text-center text-gray-800 transition-all duration-500
                          group-hover:text-knowledge-primary relative z-10
                          drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                {t('courses:targetAudience')}
              </h3>
            </div>
            
            <div className="px-6 transition-all duration-500 ease-in-out group-hover:translate-y-[-1px] overflow-hidden">
              {targetAudience && targetAudience.length > 0 ? (
                <ul className="space-y-3.5 relative transition-all duration-300">
                  {targetAudience.map((audience, index) => (
                    <li 
                      key={index} 
                      className="flex items-start gap-3 transition-all duration-300 
                              overflow-visible group-hover:translate-x-0.5 whitespace-normal break-words w-full"
                      style={{ transitionDelay: `${index * 20}ms` }}
                    >
                      <div className="mt-0.5 shrink-0 w-6 h-6 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full p-1 flex-shrink-0 text-gray-700 shadow-sm 
                                    group-hover:bg-gray-100 transition-all duration-500 ease-out
                                    group-hover:shadow-md flex items-center justify-center">
                        <Users className="h-4 w-4 transition-all duration-300 ease-in-out group-hover:text-knowledge-primary" />
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
              
              <div className="h-6 w-full relative">
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white to-transparent"></div>
              </div>
            </div>
          </div>
          
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent absolute bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearningInfoSection;
