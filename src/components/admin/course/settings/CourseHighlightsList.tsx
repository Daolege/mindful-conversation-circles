
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import IconDisplay from '@/components/course-detail/IconDisplay';
import { ListItem } from '@/lib/types/course-new';
import IconSelect from './IconSelect';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CourseHighlightsListProps {
  courseId: number;
  title?: string;
}

const SortableHighlightItem: React.FC<{
  id: string;
  item: ListItem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string, icon: string) => void;
}> = ({ id, item, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(item.text);
  const [icon, setIcon] = useState(item.icon || 'star');
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (text.trim() === '') {
      setText(item.text);
    } else {
      onUpdate(id, text, icon);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (text.trim() === '') {
        setText(item.text);
      } else {
        onUpdate(id, text, icon);
      }
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setText(item.text);
      setIcon(item.icon || 'star');
      setIsEditing(false);
    }
  };

  const handleIconChange = (newIcon: string) => {
    setIcon(newIcon);
    onUpdate(id, text, newIcon);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center gap-2 mb-2 group"
    >
      <div
        {...listeners}
        className="cursor-grab p-2 active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      
      <IconSelect
        value={icon}
        onChange={handleIconChange}
        size="sm"
        className="flex-shrink-0"
      />
      
      {isEditing ? (
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="flex-1"
          autoFocus
        />
      ) : (
        <div
          className="flex-1 p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
          onDoubleClick={handleDoubleClick}
        >
          {text}
        </div>
      )}
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(id)}
        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const CourseHighlightsList: React.FC<CourseHighlightsListProps> = ({
  courseId,
  title = "课程亮点"
}) => {
  const [highlights, setHighlights] = useState<ListItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  // Load highlights from database
  useEffect(() => {
    const fetchHighlights = async () => {
      if (!courseId) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('course_highlights')
          .select('*')
          .eq('course_id', courseId)
          .order('position');
          
        if (error) {
          console.error('Error fetching course highlights:', error);
          toast.error('无法加载课程亮点');
          return;
        }
        
        if (data) {
          const formattedHighlights: ListItem[] = data.map(item => ({
            id: item.id,
            text: item.content,
            position: item.position,
            is_visible: item.is_visible,
            icon: item.icon || 'star'
          }));
          
          setHighlights(formattedHighlights);
        }
      } catch (err) {
        console.error('Exception fetching course highlights:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHighlights();
  }, [courseId]);

  // Save highlight to database
  const saveHighlight = async (item: ListItem) => {
    try {
      const { error } = await supabase
        .from('course_highlights')
        .upsert({
          id: item.id,
          course_id: courseId,
          content: item.text,
          position: item.position,
          is_visible: item.is_visible,
          icon: item.icon || 'star'
        });
        
      if (error) {
        console.error('Error saving highlight:', error);
        toast.error('保存亮点失败');
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Exception saving highlight:', err);
      return false;
    }
  };
  
  // Delete highlight from database
  const deleteHighlightFromDB = async (id: string) => {
    try {
      const { error } = await supabase
        .from('course_highlights')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting highlight:', error);
        toast.error('删除亮点失败');
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Exception deleting highlight:', err);
      return false;
    }
  };

  const handleAddItem = async () => {
    if (newItemText.trim() === "") return;
    
    const newItem: ListItem = {
      id: `highlight-${Date.now()}`,
      text: newItemText.trim(),
      position: highlights.length,
      icon: 'star',
      is_visible: true
    };
    
    const success = await saveHighlight(newItem);
    if (success) {
      setHighlights([...highlights, newItem]);
      setNewItemText("");
    }
  };

  const handleUpdateItem = async (id: string, text: string, icon: string) => {
    const updatedItems = highlights.map(item => {
      if (item.id === id) {
        return { ...item, text, icon };
      }
      return item;
    });
    
    const itemToUpdate = updatedItems.find(item => item.id === id);
    if (itemToUpdate) {
      const success = await saveHighlight(itemToUpdate);
      if (success) {
        setHighlights(updatedItems);
      }
    }
  };

  const handleDeleteItem = async (id: string) => {
    const success = await deleteHighlightFromDB(id);
    if (success) {
      const updatedItems = highlights.filter(item => item.id !== id)
        .map((item, index) => ({ ...item, position: index }));
        
      // Update positions in database
      await Promise.all(updatedItems.map(saveHighlight));
      
      setHighlights(updatedItems);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = highlights.findIndex(item => item.id === active.id);
      const newIndex = highlights.findIndex(item => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = [...highlights];
        const [removed] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, removed);
        
        // Update positions
        const reorderedItems = newItems.map((item, index) => ({
          ...item,
          position: index
        }));
        
        // Save updated positions to database
        await Promise.all(reorderedItems.map(saveHighlight));
        
        setHighlights(reorderedItems);
      }
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="py-4 text-center text-gray-500">加载中...</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext 
              items={highlights.map(item => item.id)} 
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {highlights.map((item) => (
                  <SortableHighlightItem
                    key={item.id}
                    id={item.id}
                    item={item}
                    onDelete={handleDeleteItem}
                    onUpdate={handleUpdateItem}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <div className="flex items-center gap-2 pt-2">
          <IconSelect
            value="plus"
            onChange={() => {}}
            size="sm"
            className="flex-shrink-0"
            buttonClassName="opacity-50"
            placeholder="+"
          />
          <Input
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="添加新亮点..."
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={handleAddItem}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            添加
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseHighlightsList;
