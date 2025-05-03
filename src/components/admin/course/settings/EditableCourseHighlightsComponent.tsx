
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Award, Star, MessageSquare, Headphones, Pen, 
  Image, Calendar, ListOrdered, ListCheck, Check,
  Video, Clock, BookOpen, Globe, RefreshCw, Users, File
} from 'lucide-react';

// Define interfaces for our components
export interface CourseHighlight {
  id: string;
  course_id: number;
  icon: string;
  content: string;
  position: number;
  is_visible: boolean;
}

interface EditableCourseHighlightsComponentProps {
  courseId?: number;
  highlights: CourseHighlight[];
  onChange: (newItems: CourseHighlight[]) => void;
  lectureCount?: number;
  courseLanguage?: string;
}

// Icon component map for rendering icons
const IconComponents = {
  // Original icons
  video: Video,
  clock: Clock,
  'book-open': BookOpen,
  globe: Globe,
  'refresh-cw': RefreshCw,
  users: Users,
  file: File,
  // New added icons
  award: Award,
  star: Star,
  'message-square': MessageSquare,
  headphones: Headphones,
  pen: Pen,
  image: Image,
  calendar: Calendar,
  'list-ordered': ListOrdered,
  'list-check': ListCheck,
  check: Check,
};

// Available icons for selection - now with more options
const availableIcons = [
  { name: 'video', label: '视频', icon: Video },
  { name: 'clock', label: '时钟', icon: Clock },
  { name: 'book-open', label: '书本', icon: BookOpen },
  { name: 'globe', label: '地球', icon: Globe },
  { name: 'refresh-cw', label: '刷新', icon: RefreshCw },
  { name: 'users', label: '用户', icon: Users },
  { name: 'file', label: '文件', icon: File },
  // New icons
  { name: 'award', label: '奖项', icon: Award },
  { name: 'star', label: '星级', icon: Star },
  { name: 'message-square', label: '消息', icon: MessageSquare },
  { name: 'headphones', label: '音频', icon: Headphones },
  { name: 'pen', label: '笔记', icon: Pen },
  { name: 'image', label: '图片', icon: Image },
  { name: 'calendar', label: '日历', icon: Calendar },
  { name: 'list-ordered', label: '列表', icon: ListOrdered },
  { name: 'list-check', label: '清单', icon: ListCheck },
  { name: 'check', label: '完成', icon: Check },
];

// Sortable highlight item component
const SortableHighlightItem = ({ highlight, onEdit, onDelete, processDisplayContent }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedIcon, setEditedIcon] = useState(highlight.icon);
  const [editedContent, setEditedContent] = useState(highlight.content);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: highlight.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onEdit(highlight.id, editedIcon, editedContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedIcon(highlight.icon);
    setEditedContent(highlight.content);
    setIsEditing(false);
  };

  const IconComponent = IconComponents[highlight.icon] || Video;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="bg-muted/40 rounded-lg p-3 mb-2 transition-all hover:bg-muted/60"
      onDoubleClick={!isEditing ? handleDoubleClick : undefined}
    >
      {isEditing ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Select 
              value={editedIcon}
              onValueChange={setEditedIcon}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="选择图标">
                  {editedIcon && (
                    <div className="flex items-center gap-2">
                      {React.createElement(IconComponents[editedIcon] || Video, { className: "h-4 w-4" })}
                      <span className="sr-only">{editedIcon}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableIcons.map((icon) => (
                  <SelectItem key={icon.name} value={icon.name}>
                    <div className="flex items-center gap-2">
                      <icon.icon className="h-4 w-4" />
                      <span>{icon.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input 
              value={editedContent}
              placeholder="亮点内容" 
              onChange={(e) => setEditedContent(e.target.value)}
              className="flex-1"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleCancel}
            >
              取消
            </Button>
            <Button 
              size="sm"
              onClick={handleSave}
            >
              保存
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3 flex-1">
            <div 
              {...attributes} 
              {...listeners} 
              className="cursor-grab active:cursor-grabbing p-1"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <IconComponent className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{processDisplayContent(highlight.content)}</span>
          </div>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => onDelete(highlight.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )}
    </div>
  );
};

export const EditableCourseHighlightsComponent: React.FC<EditableCourseHighlightsComponentProps> = ({
  courseId,
  highlights,
  onChange,
  lectureCount = 0,
  courseLanguage = '中文'
}) => {
  const [items, setItems] = useState<CourseHighlight[]>(highlights);
  const [newItemIcon, setNewItemIcon] = useState<string>('video');
  const [newItemContent, setNewItemContent] = useState<string>('');

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setItems(highlights);
  }, [highlights]);

  // Process dynamic content for display
  const processDisplayContent = (content: string): string => {
    if (content.includes('XX个精选章节')) {
      return content.replace('XX', lectureCount.toString());
    } else if (content.includes('课程语言')) {
      return content.replace('中文', courseLanguage);
    }
    return content;
  };

  const handleItemEdit = (id: string, icon: string, content: string) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, icon, content } : item
    );
    setItems(updatedItems);
    onChange(updatedItems);
  };

  const handleItemDelete = (id: string) => {
    const newItems = items.filter(item => item.id !== id)
      .map((item, index) => ({ ...item, position: index }));
    
    setItems(newItems);
    onChange(newItems);
  };

  const handleAddItem = () => {
    if (!newItemContent.trim()) {
      toast.error("请输入亮点内容");
      return;
    }

    const newItem: CourseHighlight = {
      id: `temp-${Date.now()}`,
      course_id: courseId || 0,
      icon: newItemIcon,
      content: newItemContent,
      position: items.length,
      is_visible: true
    };

    const newItems = [...items, newItem];
    setItems(newItems);
    onChange(newItems);
    setNewItemIcon('video');
    setNewItemContent('');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }
    
    const oldIndex = items.findIndex(item => item.id === active.id);
    const newIndex = items.findIndex(item => item.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = arrayMove(items, oldIndex, newIndex).map(
        (item, index) => ({
          ...item,
          position: index
        })
      );
      
      setItems(newItems);
      onChange(newItems);
    }
  };

  const handleResetToDefault = async () => {
    if (!courseId) return;
    
    try {
      const { data, error } = await supabase
        .rpc('reset_course_highlights', { p_course_id: courseId });
        
      if (error) throw error;
      
      // Reload highlights after reset
      const { data: newHighlights, error: loadError } = await supabase
        .from('course_highlights')
        .select('*')
        .eq('course_id', courseId)
        .order('position');
        
      if (loadError) throw loadError;
      
      if (newHighlights) {
        setItems(newHighlights);
        onChange(newHighlights);
        toast.success("课程亮点已重置为默认值");
      }
    } catch (error) {
      console.error("重置课程亮点失败:", error);
      toast.error("重置课程亮点失败");
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          课程亮点
          {courseId && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleResetToDefault}
            >
              重置为默认
            </Button>
          )}
        </CardTitle>
        <CardDescription>添加并管理课程亮点，双击卡片可以编辑</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
        >
          <SortableContext 
            items={items.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {items.map((item) => (
                <SortableHighlightItem
                  key={item.id}
                  highlight={item}
                  onEdit={handleItemEdit}
                  onDelete={handleItemDelete}
                  processDisplayContent={processDisplayContent}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        
        {/* Add new highlight form */}
        <div className="flex gap-2 pt-2">
          <Select value={newItemIcon} onValueChange={setNewItemIcon}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="选择图标">
                {newItemIcon && (
                  <div className="flex items-center gap-2">
                    {React.createElement(IconComponents[newItemIcon] || Video, { className: "h-4 w-4" })}
                    <span className="sr-only">{newItemIcon}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableIcons.map((icon) => (
                <SelectItem key={icon.name} value={icon.name}>
                  <div className="flex items-center gap-2">
                    <icon.icon className="h-4 w-4" />
                    <span>{icon.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input 
            placeholder="输入亮点内容" 
            value={newItemContent}
            onChange={(e) => setNewItemContent(e.target.value)}
            className="flex-1"
          />
          
          <Button onClick={handleAddItem}>
            <PlusCircle className="h-4 w-4 mr-1" /> 添加
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
