
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CourseWithDetails } from '@/lib/types/course-new';
import { Clock, Calendar, Globe, CheckCircle, Download, Users, MessageSquare, Video, BookOpen, Award } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '@/hooks/useTranslations';
import IconDisplay from '../course-detail/IconDisplay';

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
  };

  // 课程亮点数据
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

          {/* 课程亮点 - 替换原有的Course features部分 */}
          <div className="border border-gray-100 rounded-lg bg-gray-50/50 p-4">
            <h3 className="text-base font-medium mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              课程亮点
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {courseHighlights.map((highlight, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 animate-in fade-in duration-300"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <IconDisplay iconName={highlight.icon} size={14} />
                  </div>
                  <span className="text-sm">{highlight.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
