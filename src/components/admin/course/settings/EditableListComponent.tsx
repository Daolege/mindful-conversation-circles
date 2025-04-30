
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Grip, Pencil, Trash2, Plus, Check, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ExpandableScrollArea } from "@/components/ui/expandable-scroll-area";

export interface ListItem {
  id: string;
  content: string;
  position: number;
  is_visible: boolean;
}

interface SortableItemProps {
  id: string;
  content: string;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  isNew?: boolean; // Flag to highlight newly added items
}

interface EditableListComponentProps {
  title: string;
  items: ListItem[];
  isVisible: boolean;
  placeholder: string;
  helperText?: string;
  onChange: (items: ListItem[]) => void;
  onVisibilityChange: (isVisible: boolean) => void;
  onAdd: (content: string) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onReorder: (items: ListItem[]) => void;
  emptyStateText?: string;
}

function SortableItem({ id, content, onEdit, onDelete, isNew = false }: SortableItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // For highlighting newly added items
  const [highlight, setHighlight] = useState(isNew);
  
  useEffect(() => {
    // If this is a new item, highlight it briefly
    if (isNew) {
      const timer = setTimeout(() => {
        setHighlight(false);
      }, 3000); // Highlight for 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isNew]);

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

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedContent(content);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() === '') {
      toast.error("内容不能为空");
      return;
    }
    onEdit(id, editedContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Calculate background color based on highlight state
  const bgColorClass = highlight 
    ? "bg-green-50 border-green-300" 
    : "bg-white border";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 ${bgColorClass} rounded-md mb-2 group transition-colors duration-300`}
    >
      <div 
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none"
      >
        <Grip className="h-4 w-4 text-gray-400" />
      </div>
      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            ref={inputRef}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
            autoFocus
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSaveEdit}
            className="h-8 w-8 p-0"
          >
            <Check className="h-4 w-4 text-green-500" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancelEdit}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ) : (
        <>
          <span className="flex-1 text-sm">{content}</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEditClick}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(id)}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export function EditableListComponent({
  title,
  items,
  isVisible,
  placeholder,
  helperText,
  onChange,
  onVisibilityChange,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
  emptyStateText = `暂无${title}，请添加`
}: EditableListComponentProps) {
  const [newItemContent, setNewItemContent] = useState('');
  const [newItems, setNewItems] = useState<Record<string, boolean>>({});
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      
      // Update positions
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        position: index,
      }));
      
      onChange(updatedItems);
      onReorder(updatedItems);
    }
  }, [items, onChange, onReorder]);

  const handleAddItem = () => {
    if (newItemContent.trim() === '') {
      toast.error("内容不能为空");
      return;
    }
    
    // Call the parent's add function
    onAdd(newItemContent.trim());
    
    // Clear input field
    setNewItemContent('');
  };

  // Track newly added items to highlight them
  useEffect(() => {
    // When items change, check for new items (the last one added)
    if (items.length > 0) {
      const mostRecentItem = items[items.length - 1];
      if (mostRecentItem && !newItems[mostRecentItem.id]) {
        // Mark this as a new item
        setNewItems(prev => ({ ...prev, [mostRecentItem.id]: true }));
        
        // Clear the highlight after a timeout
        setTimeout(() => {
          setNewItems(prev => {
            const updated = { ...prev };
            delete updated[mostRecentItem.id];
            return updated;
          });
        }, 3000);
      }
    }
  }, [items.length]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  // Check if an item is new
  const isNewItem = (id: string) => {
    return !!newItems[id];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {isVisible ? (
            <Eye className="h-4 w-4 text-primary" />
          ) : (
            <EyeOff className="h-4 w-4 text-gray-400" />
          )}
          <Label htmlFor={`visibility-${title}`}>显示{title}</Label>
        </div>
        <Switch 
          id={`visibility-${title}`}
          checked={isVisible}
          onCheckedChange={onVisibilityChange}
        />
      </div>
      
      {helperText && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder={placeholder}
            value={newItemContent}
            onChange={(e) => setNewItemContent(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={handleAddItem}
            size="sm"
            className="whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-1" />
            添加
          </Button>
        </div>
        
        <ExpandableScrollArea>
          {items.length > 0 ? (
            <div className="pt-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {items.map((item) => (
                    <SortableItem
                      key={item.id}
                      id={item.id}
                      content={item.content}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      isNew={isNewItem(item.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic text-center py-4">
              {emptyStateText}
            </p>
          )}
        </ExpandableScrollArea>
      </div>
    </div>
  );
}
