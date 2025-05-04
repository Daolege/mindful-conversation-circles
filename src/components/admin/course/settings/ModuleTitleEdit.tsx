
import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import IconSelect from './IconSelect';
import { Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

export interface ModuleSettings {
  title: string;
  icon: string;
  module_type: string;
}

interface ModuleTitleEditProps {
  settings?: ModuleSettings;
  onUpdate?: (settings: ModuleSettings) => Promise<void>;
  className?: string;
  courseId?: number;
  moduleType?: string;
}

export const ModuleTitleEdit: React.FC<ModuleTitleEditProps> = ({
  settings,
  onUpdate,
  className,
  courseId,
  moduleType
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(settings?.title || '');
  const [icon, setIcon] = useState(settings?.icon || 'check');
  const [isSaving, setIsSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState<ModuleSettings | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // 如果直接传入courseId和moduleType，则从数据库获取设置
  useEffect(() => {
    if (courseId && moduleType && !settings) {
      fetchModuleSettings();
    } else if (settings) {
      setTitle(settings.title);
      setIcon(settings.icon);
      setLocalSettings(settings);
    }
  }, [courseId, moduleType, settings]);

  // 获取模块设置
  const fetchModuleSettings = async () => {
    if (!courseId || !moduleType) return;
    
    try {
      const { data: moduleData, error } = await supabase
        .rpc('get_module_settings', {
          p_course_id: courseId,
          p_module_type: moduleType
        });
        
      if (error) throw error;
      
      if (moduleData) {
        const settings = moduleData as ModuleSettings;
        setTitle(settings.title);
        setIcon(settings.icon);
        setLocalSettings(settings);
      }
    } catch (error) {
      console.error("获取模块设置失败:", error);
    }
  };
  
  // 保存模块设置
  const updateModuleSettings = async (updatedSettings: ModuleSettings) => {
    if (!courseId || !moduleType) return;
    
    try {
      const { error } = await supabase
        .from('module_settings')
        .upsert({
          course_id: courseId,
          module_type: moduleType,
          title: updatedSettings.title,
          icon: updatedSettings.icon
        });
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("更新模块设置失败:", error);
      return false;
    }
  };

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
      setTitle(settings?.title || localSettings?.title || '');
      setIcon(settings?.icon || localSettings?.icon || 'check');
      setIsEditing(false);
      return;
    }

    if (title === (settings?.title || localSettings?.title) && icon === (settings?.icon || localSettings?.icon)) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const updatedSettings = {
        title: title.trim(),
        icon: icon,
        module_type: settings?.module_type || moduleType || ''
      };
      
      if (onUpdate) {
        await onUpdate(updatedSettings);
      } else if (courseId && moduleType) {
        const success = await updateModuleSettings(updatedSettings);
        if (!success) throw new Error("Failed to update module settings");
      } else {
        throw new Error("No update method provided");
      }
      
      setLocalSettings(updatedSettings);
      toast.success("模块标题已更新");
    } catch (error) {
      console.error("Error updating module title:", error);
      toast.error("更新模块标题失败");
      setTitle(settings?.title || localSettings?.title || '');
      setIcon(settings?.icon || localSettings?.icon || 'check');
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveChanges();
    } else if (e.key === 'Escape') {
      setTitle(settings?.title || localSettings?.title || '');
      setIcon(settings?.icon || localSettings?.icon || 'check');
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
