
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import IconSelect from './IconSelect';
import ModuleTitleEdit, { ModuleSettings } from './ModuleTitleEdit';
import { ListItem } from '@/lib/types/course-new';

interface EditableListComponentProps {
  title: string;
  description: string;
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
  placeholder?: string;
  moduleType?: string;
  moduleSettings?: ModuleSettings;
  onUpdateModuleSettings?: (settings: ModuleSettings) => Promise<void>;
  courseId?: number;
}

interface SortableItemProps {
  id: string;
  item: ListItem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string, icon: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, item, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(item.text);
  const [icon, setIcon] = useState(item.icon || 'smile');
  
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
      setIcon(item.icon || 'smile');
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

export const EditableListComponent: React.FC<EditableListComponentProps> = ({
  title,
  description,
  items,
  onChange,
  placeholder = "添加新项目...",
  moduleType,
  moduleSettings,
  onUpdateModuleSettings,
  courseId
}) => {
  const [newItemText, setNewItemText] = useState("");
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleAddItem = () => {
    if (newItemText.trim() === "") return;
    
    const newItem: ListItem = {
      id: `item-${Date.now()}`,
      text: newItemText.trim(),
      position: items.length,
      icon: 'smile',
      is_visible: true
    };
    
    onChange([...items, newItem]);
    setNewItemText("");
  };

  const handleUpdateItem = (id: string, text: string, icon: string) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        return { ...item, text, icon };
      }
      return item;
    });
    
    onChange(updatedItems);
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id)
      .map((item, index) => ({ ...item, position: index }));
    
    onChange(updatedItems);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      
      const newItems = [...items];
      const [removed] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, removed);
      
      // Update positions
      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        position: index
      }));
      
      onChange(reorderedItems);
    }
  }, [items, onChange]);

  return (
    <Card>
      {moduleSettings && onUpdateModuleSettings ? (
        <ModuleTitleEdit 
          settings={moduleSettings}
          onUpdate={onUpdateModuleSettings}
          className="mb-2"
        />
      ) : (
        <CardHeader className="pb-3">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext 
            items={items.map(item => item.id)} 
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {items.map((item) => (
                <SortableItem
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
            placeholder={placeholder}
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

export default EditableListComponent;
