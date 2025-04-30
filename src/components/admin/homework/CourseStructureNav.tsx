
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Layers
} from 'lucide-react';
import type { CourseSection } from '@/lib/types/course-new';

interface CourseStructureNavProps {
  sections: CourseSection[];
  onLectureSelect: (lectureId: string) => void;
  selectedLectureId: string | null;
  onViewAll: () => void;
}

export function CourseStructureNav({ 
  sections, 
  onLectureSelect, 
  selectedLectureId,
  onViewAll
}: CourseStructureNavProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  // 切换章节展开/折叠
  const toggleSection = (sectionId: string) => {
    const newExpandedSections = new Set(expandedSections);
    if (newExpandedSections.has(sectionId)) {
      newExpandedSections.delete(sectionId);
    } else {
      newExpandedSections.add(sectionId);
    }
    setExpandedSections(newExpandedSections);
  };
  
  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        className={`w-full justify-start text-left pl-2 ${!selectedLectureId ? 'bg-gray-100' : ''}`}
        onClick={onViewAll}
      >
        <Layers className="h-4 w-4 mr-2" />
        查看所有作业提交
      </Button>
      
      <div className="space-y-1">
        {sections.map((section) => (
          <div key={section.id} className="space-y-1">
            {/* 章节标题 */}
            <div
              className="flex items-center px-2 py-1.5 hover:bg-gray-100 rounded-md cursor-pointer text-sm"
              onClick={() => toggleSection(section.id)}
            >
              {expandedSections.has(section.id) ? (
                <ChevronDown className="h-4 w-4 mr-1 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0" />
              )}
              <span className="font-medium truncate">{section.title}</span>
              {(section.lectures?.length || 0) > 0 && (
                <span className="ml-auto text-xs text-gray-500">
                  {section.lectures?.length || 0}个课时
                </span>
              )}
            </div>
            
            {/* 课时列表 */}
            {expandedSections.has(section.id) && (section.lectures || []).length > 0 && (
              <div className="ml-6 space-y-1">
                {(section.lectures || []).map((lecture) => (
                  <Button
                    key={lecture.id}
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-start pl-2 h-auto py-1 text-left ${
                      selectedLectureId === lecture.id ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => onLectureSelect(lecture.id)}
                  >
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    <span className="truncate text-sm">{lecture.title}</span>
                    {(lecture.submission_count && lecture.submission_count > 0) ? (
                      <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                        {lecture.submission_count}
                      </span>
                    ) : null}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {sections.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            此课程尚未添加章节和课时
          </div>
        )}
      </div>
    </div>
  );
}
