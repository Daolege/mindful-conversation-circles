
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, GripVertical, Pencil } from "lucide-react";
import { ListItem, ListSectionConfig } from '@/lib/types/course-new';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { IconSelector, renderIcon } from './IconSelector';
import EditableTitle from './EditableTitle';
import { toast } from "sonner";

interface EditableListComponentProps {
  title: string;
  description: string;
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
  placeholder?: string;
  sectionIcon?: string;
  onSectionConfigChange?: (config: ListSectionConfig) => void;
}

export const EditableListComponent: React.FC<EditableListComponentProps> = ({
  title,
  description,
  items,
  onChange,
  placeholder = "添加新项目...",
  sectionIcon,
  onSectionConfigChange
}) => {
  const [newItemText, setNewItemText] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState("");

  const handleAddItem = () => {
    if (newItemText.trim() === "") return;
    
    const newItem: ListItem = {
      id: `item-${Date.now()}`,
      text: newItemText.trim(),
      position: items.length,
      is_visible: true,
      icon: sectionIcon // Default to section icon
    };
    
    onChange([...items, newItem]);
    setNewItemText("");
    toast.success("项目已添加");
  };

  const handleUpdateItem = (id: string, text: string) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        return { ...item, text };
      }
      return item;
    });
    
    onChange(updatedItems);
  };

  const handleUpdateItemIcon = (id: string, icon: string) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        return { ...item, icon };
      }
      return item;
    });
    
    onChange(updatedItems);
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    onChange(updatedItems);
    toast.success("项目已删除");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    
    const reorderedItems = [...items];
    const [removed] = reorderedItems.splice(startIndex, 1);
    reorderedItems.splice(endIndex, 0, removed);
    
    // Update positions
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      position: index
    }));
    
    onChange(updatedItems);
    toast.success("排序已更新");
  };

  const handleDoubleClickItem = (item: ListItem) => {
    setEditingItemId(item.id);
    setEditingItemText(item.text);
  };

  const handleSaveEdit = () => {
    if (editingItemId && editingItemText.trim() !== "") {
      handleUpdateItem(editingItemId, editingItemText);
      setEditingItemId(null);
      toast.success("项目已更新");
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  const handleTitleChange = (newTitle: string) => {
    if (onSectionConfigChange) {
      onSectionConfigChange({
        title: newTitle,
        description,
        icon: sectionIcon
      });
    }
  };

  const handleIconChange = (newIcon: string) => {
    if (onSectionConfigChange) {
      onSectionConfigChange({
        title,
        description,
        icon: newIcon
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <EditableTitle 
          title={title} 
          icon={sectionIcon}
          onTitleChange={handleTitleChange}
          onIconChange={handleIconChange}
        />
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId={`list-${title}`}>
            {(provided) => (
              <div 
                className="space-y-2" 
                {...provided.droppableProps} 
                ref={provided.innerRef}
              >
                {items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center gap-2 bg-white rounded-md border border-gray-200"
                      >
                        <div 
                          {...provided.dragHandleProps} 
                          className="cursor-move p-2"
                        >
                          <GripVertical className="h-4 w-4 text-gray-400" />
                        </div>
                        
                        <div className="flex-shrink-0 pl-1">
                          <IconSelector 
                            currentIcon={item.icon} 
                            onSelectIcon={(icon) => handleUpdateItemIcon(item.id, icon)} 
                          />
                        </div>
                        
                        {editingItemId === item.id ? (
                          <div className="flex flex-1 items-center pr-1">
                            <Input
                              value={editingItemText}
                              onChange={(e) => setEditingItemText(e.target.value)}
                              className="flex-1"
                              autoFocus
                              onBlur={handleSaveEdit}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit();
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                            />
                          </div>
                        ) : (
                          <div 
                            className="flex flex-1 py-2 px-1 cursor-pointer items-center"
                            onDoubleClick={() => handleDoubleClickItem(item)}
                          >
                            {item.icon && renderIcon(item.icon, "h-4 w-4 mr-2 text-gray-500 flex-shrink-0")}
                            <div className="flex-1">{item.text}</div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDoubleClickItem(item)}
                              className="w-8 h-8 text-gray-500 hover:text-gray-700"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteItem(item.id)}
                              className="w-8 h-8 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="flex items-center gap-2 pt-2">
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
