
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { File, Download, FileText, FileAudio, FileVideo, FileImage, FileArchive } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { Skeleton } from '@/components/ui/skeleton';

const CourseAttachmentsSection = ({ 
  course, 
  isLoading = false,
  isVisible = true,  // Default to true to ensure visibility
  onVisibilityChange = () => {}
}) => {
  const { t } = useTranslations();
  
  // 确保始终显示有效的课程材料 (Ensure always display valid course materials)
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

  // 如果正在加载，显示骨架屏 (If loading, display skeleton screen)
  if (isLoading) {
    return (
      <Card id="course-attachments-section" className="shadow-sm animate-in fade-in duration-500 mb-12">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl flex items-center gap-2">
            <File className="h-5 w-5" />
            {t('courses:courseAttachments') || '课程附件'}
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

  // 如果没有实际材料，但我们需要展示示例数据 (If no materials but we need to show example data)
  if (!hasMaterials) {
    // 创建示例课程材料数据 (Create example course materials)
    const exampleMaterials = [
      {
        id: 'example-pdf-1',
        name: '课程讲义.pdf',
        url: '#',
        position: 1
      },
      {
        id: 'example-doc-2',
        name: '练习题.docx',
        url: '#',
        position: 2
      },
      {
        id: 'example-ppt-3',
        name: '课程幻灯片.pptx',
        url: '#',
        position: 3
      }
    ];
    
    return (
      <Card id="course-attachments-section" className="hover:shadow-lg transition-shadow duration-500 shadow-sm animate-in fade-in duration-500 mb-12">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl flex items-center gap-2">
            <File className="h-5 w-5" />
            {t('courses:courseAttachments') || '课程附件'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ul className="space-y-3">
            {exampleMaterials.map((material, idx) => (
              <li 
                key={material.id} 
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
                >
                  <Download size={14} />
                  {t('courses:download') || '下载'}
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  }

  // 获取文件类型图标
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch(extension) {
      case 'pdf':
        // Replace FilePdf with FileText with red color
        return <FileText size={18} className="text-red-500" />;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileText size={18} className="text-green-600" />;
      case 'pptx':
      case 'ppt':
        return <FileText size={18} className="text-orange-500" />;
      case 'docx':
      case 'doc':
        return <FileText size={18} className="text-blue-600" />;
      case 'zip':
      case 'rar':
        // Replace FileZip with FileArchive with purple color
        return <FileArchive size={18} className="text-purple-600" />;
      case 'mp3':
      case 'wav':
      case 'ogg':
        return <FileAudio size={18} className="text-indigo-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <FileVideo size={18} className="text-pink-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage size={18} className="text-yellow-500" />;
      default:
        return <File size={18} className="text-gray-600" />;
    }
  };

  return (
    <Card id="course-attachments-section" className="hover:shadow-lg transition-shadow duration-500 shadow-sm animate-in fade-in duration-500 mb-12">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl flex items-center gap-2">
          <File className="h-5 w-5" />
          {t('courses:courseAttachments') || '课程附件'}
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
                  {t('courses:download') || '下载'}
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
