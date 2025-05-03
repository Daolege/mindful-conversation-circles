
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { ListItem } from '@/lib/types/course-new';
import { InlineEdit } from '@/components/ui/inline-edit';

interface EditableListComponentProps {
  title: string;
  description: string;
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
  placeholder?: string;
  titleEditable?: boolean;
  onTitleChange?: (title: string) => void;
}

export const EditableListComponent: React.FC<EditableListComponentProps> = ({
  title,
  description,
  items,
  onChange,
  placeholder = "添加新项目...",
  titleEditable = false,
  onTitleChange
}) => {
  const [newItemText, setNewItemText] = useState("");

  const handleAddItem = () => {
    if (newItemText.trim() === "") return;
    
    const newItem: ListItem = {
      id: `item-${Date.now()}`,
      text: newItemText.trim(),
      position: items.length,
      is_visible: true
    };
    
    onChange([...items, newItem]);
    setNewItemText("");
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

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    onChange(updatedItems);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const handleTitleChange = (newTitle: string) => {
    if (onTitleChange) {
      onTitleChange(newTitle);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        {titleEditable ? (
          <InlineEdit 
            value={title} 
            onChange={handleTitleChange}
            className="text-xl font-semibold"
          />
        ) : (
          <CardTitle>{title}</CardTitle>
        )}
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <div className="cursor-move p-2">
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                value={item.text}
                onChange={(e) => handleUpdateItem(item.id, e.target.value)}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteItem(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

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
