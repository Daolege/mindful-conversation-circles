
import React from 'react';
import { FileText, DownloadCloud, Loader2, File, FileAudio, FileVideo, FileImage, FileArchive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslations } from '@/hooks/useTranslations';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

interface CourseMaterialsProps {
  materials: any;
  isLoading?: boolean;
  isVisible?: boolean;
}

export function CourseMaterials({ materials, isLoading = false, isVisible = true }: CourseMaterialsProps) {
  const { t } = useTranslations();
  
  // If not visible, don't render
  if (!isVisible) {
    return null;
  }
  
  // 获取文件类型图标
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch(extension) {
      case 'pdf':
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
  
  if (isLoading) {
    return (
      <Card id="course-materials-section" className="shadow-sm animate-in fade-in duration-500">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl flex items-center gap-2">
            <File className="h-5 w-5" />
            {t('courses:courseMaterials') || '课程附件'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // 处理材料数据
  let processedMaterials = materials;
  
  // 处理字符串形式的材料数据
  if (typeof materials === 'string') {
    try {
      processedMaterials = JSON.parse(materials);
    } catch (e) {
      console.error('Error parsing materials JSON:', e);
      processedMaterials = [];
    }
  }
  
  // 处理非数组形式的材料数据
  if (!Array.isArray(processedMaterials)) {
    console.error('Materials is not an array:', processedMaterials);
    processedMaterials = [];
  }

  // 如果没有材料，改为显示示例材料数据
  if (processedMaterials.length === 0) {
    // 创建示例材料数据用于展示
    const exampleMaterials = [
      {
        id: 'example-1',
        name: '课程讲义.pdf',
        url: '#example-pdf',
        position: 1
      },
      {
        id: 'example-2',
        name: '练习题.docx',
        url: '#example-docx',
        position: 2
      },
      {
        id: 'example-3',
        name: '课程幻灯片.pptx',
        url: '#example-ppt',
        position: 3
      },
      {
        id: 'example-4',
        name: '补充资料.xlsx',
        url: '#example-xlsx',
        position: 4
      },
      {
        id: 'example-5',
        name: '示例代码.zip',
        url: '#example-zip',
        position: 5
      }
    ];
    
    return (
      <Card id="course-materials-section" className="hover:shadow-lg transition-shadow duration-500 shadow-sm animate-in fade-in duration-500">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl flex items-center gap-2">
            <File className="h-5 w-5" />
            {t('courses:courseMaterials') || '课程附件'} 
            <span className="text-xs text-gray-500 font-normal">(示例数据)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ScrollArea className="h-[450px]">
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
                    <span className="font-medium">{material.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-gray-700 hover:bg-gray-100 text-xs py-2 px-3 h-8 flex items-center gap-1"
                    onClick={() => alert('这是示例数据，无法下载')}
                  >
                    <DownloadCloud size={14} />
                    {t('courses:download') || '下载'}
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card id="course-materials-section" className="hover:shadow-lg transition-shadow duration-500 shadow-sm animate-in fade-in duration-500">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl flex items-center gap-2">
          <File className="h-5 w-5" />
          {t('courses:courseMaterials') || '课程附件'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ScrollArea className="h-[450px]">
          <ul className="space-y-3">
            {processedMaterials.map((material, idx) => (
              <li 
                key={material.id || idx} 
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 
                  transition-all duration-300 ease-in-out 
                  shadow-sm hover:shadow-md animate-in fade-in duration-300"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-2">
                  {getFileIcon(material.name)}
                  <span className="font-medium">{material.name}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-gray-700 hover:bg-gray-100 text-xs py-2 px-3 h-8 flex items-center gap-1"
                  asChild
                >
                  <a href={material.url} target="_blank" rel="noopener noreferrer">
                    <DownloadCloud size={14} />
                    {t('courses:download') || '下载'}
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
