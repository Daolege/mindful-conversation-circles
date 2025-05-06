
import React from 'react';
import { FileText, DownloadCloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslations } from '@/hooks/useTranslations';

export function CourseMaterials({ materials, isLoading = false }) {
  const { t } = useTranslations();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }
  
  if (!materials || materials.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        {t('courses:noMaterials')}
      </div>
    );
  }
  
  // Process materials data
  let processedMaterials = materials;
  
  // Handle if materials is a JSON string
  if (typeof materials === 'string') {
    try {
      processedMaterials = JSON.parse(materials);
    } catch (e) {
      console.error('Error parsing materials JSON:', e);
      processedMaterials = [];
    }
  }
  
  // Handle if materials is not an array
  if (!Array.isArray(processedMaterials)) {
    console.error('Materials is not an array:', processedMaterials);
    processedMaterials = [];
  }
  
  return (
    <ScrollArea className="h-[500px]">
      <ul className="space-y-2 p-1">
        {processedMaterials.map((material, index) => (
          <li key={material.id || index} className="border rounded-md hover:bg-gray-50 transition-colors">
            <a 
              href={material.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium">{material.name}</p>
                  {material.description && (
                    <p className="text-sm text-gray-500 mt-1">{material.description}</p>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                <DownloadCloud className="h-4 w-4 mr-2" />
                {t('courses:download')}
              </Button>
            </a>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
