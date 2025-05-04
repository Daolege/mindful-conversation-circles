
import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import IconSelect from './IconSelect';
import { Edit2 } from 'lucide-react';
import { toast } from 'sonner';

export interface ModuleSettings {
  title: string;
  icon: string;
  module_type: string;
}

interface ModuleTitleEditProps {
  settings: ModuleSettings;
  onUpdate: (settings: ModuleSettings) => Promise<void>;
  className?: string;
}

export const ModuleTitleEdit: React.FC<ModuleTitleEditProps> = ({
  settings,
  onUpdate,
  className
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(settings.title);
  const [icon, setIcon] = useState(settings.icon);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle(settings.title);
    setIcon(settings.icon);
  }, [settings]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isEditing && cardRef.current && !cardRef.current.contains(event.target as Node)) {
        saveChanges();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, title, icon]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 10);
  };

  const saveChanges = async () => {
    if (!title.trim()) {
      setTitle(settings.title);
      setIcon(settings.icon);
      setIsEditing(false);
      return;
    }

    if (title === settings.title && icon === settings.icon) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate({
        ...settings,
        title: title.trim(),
        icon: icon
      });
      toast.success("模块标题已更新");
    } catch (error) {
      console.error("Error updating module title:", error);
      toast.error("更新模块标题失败");
      setTitle(settings.title);
      setIcon(settings.icon);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveChanges();
    } else if (e.key === 'Escape') {
      setTitle(settings.title);
      setIcon(settings.icon);
      setIsEditing(false);
    }
  };

  return (
    <Card 
      ref={cardRef}
      className={cn(
        "cursor-pointer transition-all relative overflow-visible border-transparent hover:border-primary/20",
        isEditing && "border-primary/30 shadow-md",
        className
      )}
      onDoubleClick={handleDoubleClick}
    >
      <CardHeader className="p-4 pb-3 space-y-2 flex flex-col items-center">
        <div className="relative w-full flex justify-center mb-2">
          <IconSelect 
            value={icon} 
            onChange={setIcon}
            size="lg"
            className={cn(
              "transition-opacity",
              isEditing ? "opacity-100" : "opacity-80"
            )}
          />
          {!isEditing && (
            <Button 
              size="icon" 
              variant="ghost" 
              className="absolute -right-3 -top-3 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleDoubleClick();
              }}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        {isEditing ? (
          <Input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={saveChanges}
            className="text-center font-medium"
            disabled={isSaving}
          />
        ) : (
          <h3 className="text-center font-medium cursor-pointer">
            {title}
          </h3>
        )}
      </CardHeader>
    </Card>
  );
};

export default ModuleTitleEdit;
