
import React, { useState, useCallback, useRef } from 'react';
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListItem } from '@/lib/types/course-new';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  item: ListItem;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ item, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(item.text);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleSave = () => {
    if (text.trim()) {
      onEdit(item.id, text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setText(item.text);
      setIsEditing(false);
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex items-center justify-between gap-2 p-3 bg-white border rounded-lg shadow-sm mb-2 group hover:border-gray-400 transition-colors"
    >
      {isEditing ? (
        <div className="flex-1 flex">
          <Input 
            ref={inputRef}
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
        </div>
      ) : (
        <>
          <div 
            {...attributes} 
            {...listeners} 
            className="cursor-grab flex items-center justify-center p-1 text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="4" cy="8" r="1"></circle>
              <circle cx="12" cy="8" r="1"></circle>
              <circle cx="4" cy="4" r="1"></circle>
              <circle cx="12" cy="4" r="1"></circle>
              <circle cx="4" cy="12" r="1"></circle>
              <circle cx="12" cy="12" r="1"></circle>
            </svg>
          </div>
          <div className="flex-1 px-2 truncate">{item.text}</div>
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handleEdit} className="opacity-0 group-hover:opacity-100 transition-opacity">
              编辑
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
              删除
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

interface EditableListComponentProps {
  title: string;
  description?: string;
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
  placeholder?: string;
  titleEditable?: boolean;
  onTitleChange?: (title: string) => void;
  isVisible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

export const EditableListComponent: React.FC<EditableListComponentProps> = ({
  title,
  description,
  items,
  onChange,
  placeholder = "Add new item...",
  titleEditable = false,
  onTitleChange,
  isVisible = true,
  onVisibilityChange
}) => {
  const [newItemText, setNewItemText] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddItem = () => {
    if (newItemText.trim()) {
      const newItem: ListItem = {
        id: `item-${Date.now()}`,
        text: newItemText.trim(),
        position: items.length,
        is_visible: true,
      };
      onChange([...items, newItem]);
      setNewItemText("");
    }
  };

  const handleDeleteItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const handleEditItem = (id: string, text: string) => {
    onChange(items.map(item => item.id === id ? { ...item, text } : item));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      onChange(newItems);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddItem();
    }
  };

  const handleEditTitle = () => {
    if (titleEditable) {
      setIsEditingTitle(true);
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 0);
    }
  };

  const handleSaveTitle = useCallback(() => {
    if (titleText.trim() && onTitleChange) {
      onTitleChange(titleText);
    }
    setIsEditingTitle(false);
  }, [titleText, onTitleChange]);

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      setTitleText(title);
      setIsEditingTitle(false);
    }
  };

  const handleVisibilityToggle = (checked: boolean) => {
    if (onVisibilityChange) {
      onVisibilityChange(checked);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          {isEditingTitle ? (
            <div className="flex-1">
              <Input
                ref={titleInputRef}
                value={titleText}
                onChange={(e) => setTitleText(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleTitleKeyDown}
                className="font-semibold text-lg"
              />
            </div>
          ) : (
            <div 
              className={`flex-1 flex items-center gap-2 ${titleEditable ? 'cursor-pointer' : ''}`} 
              onClick={handleEditTitle}
            >
              <CardTitle>{titleText}</CardTitle>
              {titleEditable && <span className="text-xs text-gray-400">(点击编辑)</span>}
            </div>
          )}
          
          {onVisibilityChange && (
            <div className="flex items-center gap-2">
              {isVisible ? 
                <EyeIcon size={16} className="text-green-500" /> : 
                <EyeOffIcon size={16} className="text-gray-400" />
              }
              <Switch
                checked={isVisible}
                onCheckedChange={handleVisibilityToggle}
              />
            </div>
          )}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex space-x-2">
            <Input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder={placeholder}
              onKeyDown={handleKeyDown}
            />
            <Button onClick={handleAddItem} disabled={!newItemText.trim()}>
              添加
            </Button>
          </div>
        </div>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
            {items.length > 0 ? (
              items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onDelete={handleDeleteItem}
                  onEdit={handleEditItem}
                />
              ))
            ) : (
              <div className="text-center py-5 text-gray-500">
                还没有添加项目，请使用上面的输入框添加新项目
              </div>
            )}
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
};
