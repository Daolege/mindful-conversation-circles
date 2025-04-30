
import React from 'react';
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseMaterial } from "@/lib/types/course";

interface CourseMaterialsProps {
  materials?: CourseMaterial[] | null;
  isVisible?: boolean;
}

export function CourseMaterials({ materials, isVisible = true }: CourseMaterialsProps) {
  // If materials section is not visible, don't render anything
  if (!isVisible) {
    return null;
  }

  if (!materials?.length) {
    return <p className="text-muted-foreground">暂无课程资料</p>;
  }

  // Filter out invisible materials
  const visibleMaterials = materials.filter(material => material.is_visible !== false);

  if (!visibleMaterials.length) {
    return <p className="text-muted-foreground">暂无可见的课程资料</p>;
  }

  return (
    <div className="space-y-2">
      {visibleMaterials.map((material, index) => (
        <div 
          key={material.id || index} 
          className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-all duration-200 rounded-lg border border-gray-200 group cursor-pointer hover:shadow-sm"
        >
          <div className="flex items-center space-x-3">
            <Download className="h-4 w-4 text-gray-500 group-hover:text-gray-900 transition-colors" />
            <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
              {material.name}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="rounded-10 border-gray-200 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200"
            asChild
          >
            <a href={material.url} download className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              下载
            </a>
          </Button>
        </div>
      ))}
    </div>
  );
}
