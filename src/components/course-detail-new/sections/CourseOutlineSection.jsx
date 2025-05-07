
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { AnimatedCollapsible } from '@/components/ui/animated-collapsible';
import { Button } from '@/components/ui/button';
import { BookOpen, Lock } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const CourseOutlineSection = ({ 
  course, 
  isLoading = false,
  isVisible = true,
  onVisibilityChange = () => {}
}) => {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const [openSectionIds, setOpenSectionIds] = useState({});
  const [isOutlineLoading, setIsOutlineLoading] = useState(true);

  // Initialize with first section open
  useEffect(() => {
    if (course?.sections && course.sections.length > 0) {
      setOpenSectionIds(prev => ({
        ...prev,
        [course.sections[0].id]: true
      }));
    }
  }, [course?.sections]);

  // Simulate outline loading with a short delay
  useEffect(() => {
    if (isVisible && !isLoading) {
      const timer = setTimeout(() => {
        setIsOutlineLoading(false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, isLoading]);

  // Use IntersectionObserver to detect when component is in viewport
  useEffect(() => {
    if (!isLoading) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          onVisibilityChange(entry.isIntersecting);
        },
        { threshold: 0.1 }
      );
      
      const element = document.getElementById('course-outline-section');
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

  const toggleSection = (sectionId) => {
    setOpenSectionIds(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  const handleFreeLearnClick = (lectureId) => {
    navigate(`/learn/${course.id}?source=new&lectureId=${lectureId}`);
  };

  const totalLessons = course?.sections?.reduce(
    (count, section) => count + (section.lectures?.length || 0),
    0
  ) || 0;

  if (isLoading || !isVisible) {
    return (
      <Card id="course-outline-section" className="shadow-sm animate-in fade-in duration-500">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t('courses:courseOutline')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-sm text-gray-500 mb-4">
            <Skeleton className="h-4 w-48" />
          </div>

          <div className="space-y-4 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="mt-4 space-y-2">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-12 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="course-outline-section" className="hover:shadow-lg transition-shadow duration-500 shadow-sm animate-in fade-in duration-500">
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
                    <span className="text-xs flex items-center justify-center min-w-[60px] py-1 px-2 bg-gray-200 text-gray-800 rounded">
                      {t('courses:lessons', { count: section.lectures?.length || 0 })}
                    </span>
                  </div>
                }
                onToggle={() => toggleSection(section.id)}
                className={`border-gray-300 hover:bg-gray-50 transition-colors ${
                  openSectionIds[section.id] 
                    ? 'bg-gray-100 shadow-md' 
                    : 'shadow-sm hover:shadow-md'
                }`}
              >
                <ul className="space-y-3">
                  {section.lectures?.map((lecture, lectureIdx) => (
                    <li
                      key={lecture.id}
                      className="flex justify-between items-center p-4 border rounded-lg 
                        bg-white
                        transition-all duration-300 ease-in-out
                        shadow-sm hover:shadow-md
                        hover:bg-gray-50 hover:translate-x-1"
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
  );
};

export default CourseOutlineSection;
