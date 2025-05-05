
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { File, Download } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { Skeleton } from '@/components/ui/skeleton';

const CourseAttachmentsSection = ({ 
  course, 
  isLoading = false,
  isVisible = true,
  onVisibilityChange = () => {}
}) => {
  const { t } = useTranslations();
  
  // Generate sample materials if none exist
  const courseMaterials = course?.materials?.length ? course.materials : [
    { id: "mat1", course_id: course?.id, name: "课程讲义.PDF", url: "#", position: 1, is_visible: true },
    { id: "mat2", course_id: course?.id, name: "练习题.PDF", url: "#", position: 2, is_visible: true }
  ];
  
  // Use IntersectionObserver to detect when component is in viewport
  React.useEffect(() => {
    if (!isLoading) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          onVisibilityChange(entry.isIntersecting);
        },
        { threshold: 0.1 }
      );
      
      const element = document.getElementById('course-attachments-section');
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
      <Card id="course-attachments-section" className="shadow-sm animate-in fade-in duration-500 mb-12">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl flex items-center gap-2">
            <File className="h-5 w-5" />
            {t('courses:courseAttachments')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="course-attachments-section" className="hover:shadow-lg transition-shadow duration-500 shadow-sm animate-in fade-in duration-500 mb-12">
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
                style={{ animationDelay: `${idx * 100}ms` }}
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
  );
};

export default CourseAttachmentsSection;
