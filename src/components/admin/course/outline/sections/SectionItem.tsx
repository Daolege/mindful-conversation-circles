import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, Edit2, Trash2, Save, X, PlusCircle, GripVertical } from 'lucide-react';
import { CourseSection, CourseLecture } from '@/lib/types/course-new';
import { cn } from '@/lib/utils';
import { SectionLectureList } from '../lectures/SectionLectureList';
import { AddLectureForm } from '../lectures/AddLectureForm';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SectionItemProps {
  section: CourseSection;
  isExpanded: boolean;
  isLast: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<CourseSection>) => void;
  onLectureAdd: (title: string, isFree: boolean) => Promise<boolean>;
  onLectureUpdate: (lectureId: string, updates: Partial<CourseLecture>) => void;
  onLectureDelete: (lectureId: string) => void;
  onLecturesReorder: (updatedLectures: CourseLecture[]) => void;
  onHomeworkRequirementChange: (lectureId: string, requiresHomework: boolean) => void;
  dragHandleProps: {
    id: string;
    data: {
      type: string;
      section: CourseSection;
    };
  };
}

export const SectionItem: React.FC<SectionItemProps> = ({
  section,
  isExpanded,
  isLast,
  onToggleExpand,
  onDelete,
  onUpdate,
  onLectureAdd,
  onLectureUpdate,
  onLectureDelete,
  onLecturesReorder,
  onHomeworkRequirementChange,
  dragHandleProps
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(section.title);
  const [showAddLecture, setShowAddLecture] = useState(false);
  
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition,
    isDragging
  } = useSortable({
    id: dragHandleProps.id,
    data: dragHandleProps.data
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim() !== "") {
      onUpdate({ title: editedTitle });
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditedTitle(section.title);
      setIsEditing(false);
    }
  };

  const lectureCount = section.lectures?.length || 0;

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "border border-gray-200 hover:border-gray-300 transition-colors",
        isDragging ? "shadow-lg ring-2 ring-primary/20" : ""
      )}
    >
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-grow">
            <div 
              className="mr-2 cursor-grab p-1 hover:bg-gray-100 rounded text-gray-500"
              {...attributes}
              {...listeners}
            >
              <GripVertical size={18} />
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1 h-auto" 
              onClick={onToggleExpand}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </Button>
            
            {isEditing ? (
              <div className="flex items-center flex-grow">
                <Input 
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSaveTitle}
                  className="h-8 text-base font-medium"
                  autoFocus
                />
              </div>
            ) : (
              <CardTitle className="text-base font-medium">
                {section.title} 
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({lectureCount} 课时)
                </span>
              </CardTitle>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {!isEditing && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onDelete}
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pb-3">
          {showAddLecture ? (
            <AddLectureForm
              onLectureAdded={onLectureAdd}
              onCancel={() => setShowAddLecture(false)}
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddLecture(true)}
              className="mb-4 text-sm"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              添加课时
            </Button>
          )}
          
          <SectionLectureList 
            lectures={section.lectures || []}
            onUpdate={onLectureUpdate}
            onDelete={onLectureDelete}
            onReorder={onLecturesReorder}
            onHomeworkRequirementChange={onHomeworkRequirementChange}
          />
        </CardContent>
      )}
    </Card>
  );
};
