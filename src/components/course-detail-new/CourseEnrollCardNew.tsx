
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CourseWithDetails } from '@/lib/types/course-new';
import { Clock, Calendar, Globe, CheckCircle, Download, Users, MessageSquare, Video, BookOpen } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '@/hooks/useTranslations';
import { toast } from 'sonner';

interface CourseEnrollCardNewProps {
  course: CourseWithDetails;
}

export const CourseEnrollCardNew: React.FC<CourseEnrollCardNewProps> = ({ course }) => {
  const { t } = useTranslations();
  
  // Format price with currency symbol
  const formattedPrice = course.price === 0 ? t('courses:free') : `¥${course.price.toFixed(2)}`;
  const formattedOriginalPrice = course.original_price && course.price !== 0
    ? `¥${course.original_price.toFixed(2)}`
    : null;

  // Calculate discount percentage if original price exists
  const discountPercentage = course.original_price && course.price !== 0
    ? Math.round(((course.original_price - course.price) / course.original_price) * 100)
    : null;
    
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleEnrollClick = () => {
    try {
      if (course.price === 0) {
        // For free courses, navigate directly to the learning page
        navigate(`/learn/${course.id}?source=new`);
      } else {
        // For paid courses, navigate to checkout
        navigate(`/checkout?courseId=${course.id}`, { 
          state: { 
            isNewCourse: true,
            courseId: course.id,
            courseTitle: course.title,
            courseDescription: course.description,
            coursePrice: course.price
          }
        });
      }
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('导航到结账页面时出错');
    }
  };

  return (
    <div className={`sticky transition-all duration-300 animate-in fade-in slide-in-from-right-5 duration-700 ${isScrolled ? "top-24" : "top-4"}`}>
      <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-500">
        <div className="p-6 space-y-6">
          {/* Price section */}
          <div className="flex items-baseline flex-wrap animate-in fade-in duration-700 delay-200">
            <div className="text-3xl font-bold">{formattedPrice}</div>
            {formattedOriginalPrice && (
              <div className="ml-3 text-gray-500 line-through text-lg">
                {formattedOriginalPrice}
              </div>
            )}
            {discountPercentage && (
              <div className="ml-3 bg-green-100 text-green-700 px-2 py-1 text-sm rounded-full font-medium">
                {t('courses:save', { percentage: discountPercentage })}
              </div>
            )}
          </div>

          {/* Enrollment button */}
          <Button 
            className="w-full py-6 text-base h-14 animate-in fade-in duration-700 delay-400" 
            variant="knowledge"
            onClick={handleEnrollClick}
          >
            {course.price === 0 ? t('courses:freeAccess') : t('courses:enrollAndStart')}
          </Button>

          {/* Course features */}
          <div className={`space-y-3 text-sm ${isMobile ? 'grid grid-cols-2 gap-2' : ''}`}>
            <div className="flex items-center animate-in fade-in duration-300">
              <Video className="h-4 w-4 text-gray-500 mr-2" />
              <span>{t('courses:hdVideo')}</span>
            </div>
            <div className="flex items-center animate-in fade-in duration-300">
              <Clock className="h-4 w-4 text-gray-500 mr-2" />
              <span>{t('courses:learnAnytime')}</span>
            </div>
            <div className="flex items-center animate-in fade-in duration-300">
              <BookOpen className="h-4 w-4 text-gray-500 mr-2" />
              <span>{t('courses:noBarrier')}</span>
            </div>
            <div className="flex items-center animate-in fade-in duration-300">
              <Globe className="h-4 w-4 text-gray-500 mr-2" />
              <span>{t('courses:courseLanguage', { language: course.language || '中文' })}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
