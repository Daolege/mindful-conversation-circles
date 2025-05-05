
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
  
  // 只使用可见的课程材料
  const courseMaterials = course?.materials
    ?.filter(material => material.is_visible !== false) || [];
    
  const hasMaterials = courseMaterials.length > 0;
  
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

  // 如果正在加载或不可见，显示骨架屏
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

  // 如果没有材料，不显示此区域
  if (!hasMaterials) {
    return null;
  }

  // 获取文件类型图标
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch(extension) {
      case 'pdf':
        return <File size={18} className="text-red-500" />;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <File size={18} className="text-green-600" />;
      case 'pptx':
      case 'ppt':
        return <File size={18} className="text-orange-500" />;
      case 'docx':
      case 'doc':
        return <File size={18} className="text-blue-600" />;
      case 'zip':
      case 'rar':
        return <File size={18} className="text-purple-600" />;
      default:
        return <File size={18} className="text-gray-600" />;
    }
  };

  return (
    <Card id="course-attachments-section" className="hover:shadow-lg transition-shadow duration-500 shadow-sm animate-in fade-in duration-500 mb-12">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl flex items-center gap-2">
          <File className="h-5 w-5" />
          {t('courses:courseAttachments')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-3">
          {courseMaterials.map((material, idx) => (
            <li 
              key={material.id || idx} 
              className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 
                transition-all duration-300 ease-in-out 
                shadow-sm hover:shadow-md animate-in fade-in duration-300"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-center gap-2">
                {getFileIcon(material.name)}
                <span className="font-semibold">{material.name}</span>
              </div>
              <Button
                size="sm"
                variant="knowledge"
                className="text-xs py-2 px-3 h-8 flex items-center gap-1"
                asChild
              >
                <a href={material.url} target="_blank" rel="noopener noreferrer">
                  <Download size={14} />
                  {t('courses:download')}
                </a>
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default CourseAttachmentsSection;
