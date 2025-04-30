
import React, { useState, useEffect, useRef } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface InlineEditProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onDoubleClick?: () => void;
  onBlur?: () => void;
}

export const InlineEdit = ({
  value,
  onChange,
  placeholder = "Click to edit",
  className,
  disabled = false,
  onDoubleClick,
  onBlur
}: InlineEditProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (!disabled) {
      setIsEditing(true);
      onDoubleClick?.();
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
    onBlur?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  return (
    <div 
      className={cn(
        "min-w-[100px] relative group", 
        disabled ? "cursor-default" : "cursor-text",
        className
      )}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="py-0 h-7"
        />
      ) : (
        <div className={cn(
          "py-1 px-1 rounded-sm min-h-[28px] flex items-center",
          !disabled && "hover:bg-gray-100 group-hover:after:content-['✎'] group-hover:after:ml-2 group-hover:after:text-gray-400 group-hover:after:text-xs",
          disabled && "cursor-default"
        )}>
          {value || <span className="text-gray-400">{placeholder}</span>}
        </div>
      )}
    </div>
  );
};
