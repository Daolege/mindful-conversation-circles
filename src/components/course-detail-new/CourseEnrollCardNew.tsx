
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CourseWithDetails } from '@/lib/types/course-new';
import { Clock, Calendar, Globe, CheckCircle, Download, Users, MessageSquare, Video, BookOpen } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

interface CourseEnrollCardNewProps {
  course: CourseWithDetails;
}

export const CourseEnrollCardNew: React.FC<CourseEnrollCardNewProps> = ({ course }) => {
  // Format price with currency symbol
  const formattedPrice = `¥${course.price.toFixed(2)}`;
  const formattedOriginalPrice = course.original_price
    ? `¥${course.original_price.toFixed(2)}`
    : null;

  // Calculate discount percentage if original price exists
  const discountPercentage = course.original_price
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
    navigate(`/checkout?courseId=${course.id}`, { 
      state: { 
        isNewCourse: true, // Flag to identify this is from the new course system
        courseId: course.id,
        courseTitle: course.title,
        courseDescription: course.description,
        coursePrice: course.price
      }
    });
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
                省{discountPercentage}%
              </div>
            )}
          </div>

          {/* Enrollment button */}
          <Button 
            className="w-full py-6 text-base h-14 animate-in fade-in duration-700 delay-400" 
            variant="knowledge"
            onClick={handleEnrollClick}
          >
            立即报名学习
          </Button>

          {/* Course features */}
          <div className={`space-y-3 text-sm ${isMobile ? 'grid grid-cols-2 gap-2' : ''}`}>
            <div className="flex items-center animate-in fade-in slide-in-from-bottom-3 duration-700 delay-500">
              <Video className="h-4 w-4 text-gray-500 mr-2" />
              <span>高清视频课程</span>
            </div>
            <div className="flex items-center animate-in fade-in slide-in-from-bottom-3 duration-700 delay-600">
              <Clock className="h-4 w-4 text-gray-500 mr-2" />
              <span>随时随地学习</span>
            </div>
            <div className="flex items-center animate-in fade-in slide-in-from-bottom-3 duration-700 delay-700">
              <BookOpen className="h-4 w-4 text-gray-500 mr-2" />
              <span>0门槛学习</span>
            </div>
            <div className="flex items-center animate-in fade-in slide-in-from-bottom-3 duration-700 delay-800">
              <Globe className="h-4 w-4 text-gray-500 mr-2" />
              <span>课程语言：{course.language || '中文'}</span>
            </div>
            <div className="flex items-center animate-in fade-in slide-in-from-bottom-3 duration-700 delay-900">
              <Download className="h-4 w-4 text-gray-500 mr-2" />
              <span>可下载课件附件</span>
            </div>
            <div className="flex items-center animate-in fade-in slide-in-from-bottom-3 duration-700 delay-[1000ms]">
              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
              <span>长期观看权益</span>
            </div>
            <div className="flex items-center animate-in fade-in slide-in-from-bottom-3 duration-700 delay-[1100ms]">
              <MessageSquare className="h-4 w-4 text-gray-500 mr-2" />
              <span>学员专属社群</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
