
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  GripVertical, 
  Play, 
  Clock, 
  BookOpen,
  Settings
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { HomeworkPanel } from './HomeworkPanel';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface LectureItemProps {
  id: string;
  title: string;
  position: number;
  sectionId: string;
  isFree?: boolean;
  duration?: string | null;
  showHomeworkSettings?: boolean;
  requiresHomeworkCompletion?: boolean;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
  dragHandleProps: any;
  courseId?: number;
  onHomeworkRequirementChange?: (requiresHomework: boolean) => void;
}

export const LectureItem = ({
  id,
  title,
  position,
  sectionId,
  isFree = false,
  duration,
  showHomeworkSettings = false,
  requiresHomeworkCompletion = false,
  onUpdate,
  onDelete,
  dragHandleProps,
  courseId,
  onHomeworkRequirementChange
}: LectureItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [isVideoUploaderOpen, setIsVideoUploaderOpen] = useState(false);
  const [showHomeworkPanel, setShowHomeworkPanel] = useState(false);
  const [localIsFree, setLocalIsFree] = useState(isFree);
  
  // 使用useEffect确保localIsFree与props同步
  useEffect(() => {
    setLocalIsFree(isFree);
  }, [isFree]);
  
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
    zIndex: isDragging ? 100 : 1
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim() !== "") {
      onUpdate({ title: editedTitle });
      setIsEditing(false);
    } else {
      toast.error('课时标题不能为空');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditedTitle(title);
      setIsEditing(false);
    }
  };
  
  const handleIsFreeChange = (checked: boolean) => {
    setLocalIsFree(checked);
    onUpdate({ is_free: checked });
  };

  const toggleHomeworkPanel = () => {
    setShowHomeworkPanel(!showHomeworkPanel);
  };

  const handleHomeworkRequirementChange = (checked: boolean) => {
    if (onHomeworkRequirementChange) {
      onHomeworkRequirementChange(checked);
    }
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "border border-gray-200 mb-2 transition-colors",
        isDragging ? "shadow-lg ring-2 ring-primary/20" : ""
      )}
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          {/* 左侧拖拽控制和标题 */}
          <div className="flex items-center flex-grow">
            <div 
              className="mr-2 cursor-grab p-1 hover:bg-gray-100 rounded text-gray-500"
              {...attributes}
              {...listeners}
            >
              <GripVertical size={18} />
            </div>
            
            {isEditing ? (
              <div className="flex-grow">
                <Input 
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSaveTitle}
                  className="h-8"
                  autoFocus
                />
              </div>
            ) : (
              <div className="flex-grow">
                <div className="font-medium">
                  <span className="text-sm text-gray-500 mr-1">{position + 1}.</span>
                  {title}
                </div>
              </div>
            )}
          </div>
          
          {/* 右侧操作按钮 */}
          <div className="flex items-center gap-1">
            {!isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={toggleHomeworkPanel} className="h-8 px-2">
                  <BookOpen className="h-4 w-4 mr-1" />
                  作业
                </Button>
                
                <div className="flex items-center ml-2">
                  <Checkbox
                    id={`lecture-free-${id}`}
                    checked={localIsFree}
                    onCheckedChange={handleIsFreeChange}
                    className="mr-1"
                  />
                  <label 
                    htmlFor={`lecture-free-${id}`}
                    className="text-xs cursor-pointer"
                  >
                    免费
                  </label>
                </div>
                
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
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSaveTitle}
                  className="h-8 w-8"
                >
                  <Save className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditedTitle(title);
                    setIsEditing(false);
                  }}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* 作业面板（可折叠） */}
      <Collapsible open={showHomeworkPanel} onOpenChange={setShowHomeworkPanel}>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-3">
            {showHomeworkSettings && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-100 rounded-md">
                <div className="flex items-center">
                  <Checkbox
                    id={`homework-required-${id}`}
                    checked={requiresHomeworkCompletion}
                    onCheckedChange={handleHomeworkRequirementChange}
                    className="mr-2"
                  />
                  <label 
                    htmlFor={`homework-required-${id}`}
                    className="text-sm cursor-pointer"
                  >
                    学习此课时需要完成作业
                  </label>
                </div>
              </div>
            )}
            
            <HomeworkPanel 
              lectureId={id}
              courseId={courseId}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
