
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '@/hooks/useTranslations';

const EnrollCardMobile = ({ course }) => {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState('up');
  
  // Format price with currency symbol
  const formattedPrice = course.price === 0 ? t('courses:free') : `¥${course.price.toFixed(2)}`;
  const formattedOriginalPrice = course.original_price && course.price !== 0
    ? `¥${course.original_price.toFixed(2)}`
    : null;

  // Calculate discount percentage if original price exists
  const discountPercentage = course.original_price && course.price !== 0
    ? Math.round(((course.original_price - course.price) / course.original_price) * 100)
    : null;
  
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
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
        if (currentScrollY > 100) {
          setIsExpanded(false);
        }
      } else {
        setScrollDirection('up');
        if (currentScrollY < 100) {
          setIsExpanded(true);
        }
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30
                  transform transition-all duration-300 ease-in-out
                  ${isExpanded ? 'py-4 px-4' : 'py-2 px-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]'}`}>
      <div className="container mx-auto">
        <div className={`flex items-center justify-between transition-all duration-300
                      ${isExpanded ? 'flex-wrap gap-4' : 'flex-nowrap'}`}>
          
          {/* Price section - Always visible */}
          <div className="flex items-baseline flex-nowrap animate-in fade-in-0 duration-700 delay-200">
            <div className={`font-bold transition-all duration-300 ${isExpanded ? 'text-2xl' : 'text-lg'}`}>
              {formattedPrice}
            </div>
            
            {isExpanded && formattedOriginalPrice && (
              <div className="ml-3 text-gray-500 line-through text-base">
                {formattedOriginalPrice}
              </div>
            )}
            
            {discountPercentage && (
              <div className={`ml-2 bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium
                            transition-all duration-300
                            ${isExpanded ? 'text-sm' : 'text-xs'}`}>
                {t('courses:save', { percentage: discountPercentage })}
              </div>
            )}
          </div>

          {/* Enrollment button - Always visible */}
          <Button 
            className={`text-base transition-all duration-300 focus-visible:ring-offset-0
                      ${isExpanded ? 'py-6 h-14 flex-grow' : 'h-10 w-auto'}`} 
            variant="knowledge"
            onClick={handleEnrollClick}
          >
            {course.price === 0 ? t('courses:freeAccess') : t('courses:enrollAndStart')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnrollCardMobile;
