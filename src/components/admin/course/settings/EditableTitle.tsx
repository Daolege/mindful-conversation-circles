
import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { IconSelector } from './IconSelector';
import { CardTitle } from "@/components/ui/card";

interface EditableTitleProps {
  title: string;
  icon?: string;
  onTitleChange: (title: string) => void;
  onIconChange: (icon: string) => void;
}

const EditableTitle: React.FC<EditableTitleProps> = ({
  title,
  icon,
  onTitleChange,
  onIconChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (editedTitle.trim() !== '') {
      onTitleChange(editedTitle);
    } else {
      setEditedTitle(title); // Reset to original title if empty
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditedTitle(title);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-shrink-0">
        <IconSelector 
          currentIcon={icon} 
          onSelectIcon={onIconChange} 
        />
      </div>
      
      {isEditing ? (
        <Input
          ref={inputRef}
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="font-medium py-1 px-1"
        />
      ) : (
        <CardTitle 
          onDoubleClick={handleDoubleClick} 
          className="cursor-pointer hover:bg-gray-50 py-1 px-2 rounded transition-colors"
        >
          {title}
        </CardTitle>
      )}
    </div>
  );
};

export default EditableTitle;
