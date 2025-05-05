
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
  
  // 只使用真实附件数据，过滤掉模拟材料和隐藏材料
  const courseMaterials = course?.materials
    ?.filter(m => {
      // 排除隐藏的材料
      if (m.is_visible === false) return false;
      
      // 排除模拟文件 - 通过名称或URL特征识别
      if (
        m.name?.toLowerCase().includes('模拟') || 
        m.name?.toLowerCase().includes('mock') || 
        m.url?.includes('fallback')
      ) {
        return false;
      }
      
      return true;
    }) || [];
    
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
