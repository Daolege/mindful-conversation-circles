
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import IconSelect from './IconSelect';
import ModuleTitleEdit from './ModuleTitleEdit';
import { ListItem } from '@/lib/types/course-new';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getModuleSettings } from '@/lib/services/moduleSettingsService';

interface EditableListComponentProps {
  courseId: number;
  itemType: string;
  title: string;
  description?: string;
  tableName: string;
  isVisible: boolean;
  onVisibilityChange: (isVisible: boolean) => Promise<void>;
  placeholder?: string;
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
  courseId,
  itemType,
  title,
  description = "",
  tableName,
  isVisible,
  onVisibilityChange,
  placeholder = "添加新项目..."
}) => {
  const [items, setItems] = useState<ListItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [moduleSettings, setModuleSettings] = useState({
    title: title,
    icon: itemType === 'objectives' ? 'target' : 
          itemType === 'requirements' ? 'book-open' : 
          itemType === 'audiences' ? 'users' : 'check',
    module_type: itemType
  });
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Load items from database
  useEffect(() => {
    const fetchItems = async () => {
      if (!courseId || !tableName) return;
      
      try {
        setIsLoading(true);
        
        // Fetch module settings
        if (['objectives', 'requirements', 'audiences'].includes(itemType)) {
          try {
            const settings = await getModuleSettings(courseId, itemType);
            setModuleSettings(settings);
          } catch (error) {
            console.error(`Error fetching ${itemType} settings:`, error);
          }
        }
        
        // Fetch items
        const { data, error } = await supabase
          .from(tableName as any)
          .select('*')
          .eq('course_id', courseId)
          .order('position');
          
        if (error) {
          console.error(`Error fetching ${tableName}:`, error);
          toast.error(`无法加载${title}`);
          return;
        }
        
        if (data) {
          const formattedItems: ListItem[] = data.map(item => ({
            id: item.id,
            text: item.content,
            position: item.position,
            is_visible: item.is_visible !== false,
            icon: item.icon || 'check'
          }));
          
          setItems(formattedItems);
        }
      } catch (err) {
        console.error(`Exception fetching ${tableName}:`, err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchItems();
  }, [courseId, tableName, itemType]);

  // Save item to database
  const saveItem = async (item: ListItem) => {
    try {
      const { error } = await supabase
        .from(tableName as any)
        .upsert({
          id: item.id,
          course_id: courseId,
          content: item.text,
          position: item.position,
          is_visible: item.is_visible,
          icon: item.icon || 'check'
        });
        
      if (error) {
        console.error(`Error saving ${tableName} item:`, error);
        toast.error(`保存项目失败`);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error(`Exception saving ${tableName} item:`, err);
      return false;
    }
  };
  
  // Delete item from database
  const deleteItemFromDB = async (id: string) => {
    try {
      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error(`Error deleting ${tableName} item:`, error);
        toast.error(`删除项目失败`);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error(`Exception deleting ${tableName} item:`, err);
      return false;
    }
  };

  const handleAddItem = async () => {
    if (newItemText.trim() === "") return;
    
    const newItem: ListItem = {
      id: `item-${Date.now()}`,
      text: newItemText.trim(),
      position: items.length,
      icon: 'check',
      is_visible: true
    };
    
    const success = await saveItem(newItem);
    if (success) {
      setItems([...items, newItem]);
      setNewItemText("");
    }
  };

  const handleUpdateItem = async (id: string, text: string, icon: string) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        return { ...item, text, icon };
      }
      return item;
    });
    
    const itemToUpdate = updatedItems.find(item => item.id === id);
    if (itemToUpdate) {
      const success = await saveItem(itemToUpdate);
      if (success) {
        setItems(updatedItems);
      }
    }
  };

  const handleDeleteItem = async (id: string) => {
    const success = await deleteItemFromDB(id);
    if (success) {
      const updatedItems = items.filter(item => item.id !== id)
        .map((item, index) => ({ ...item, position: index }));
        
      // Update positions in database
      await Promise.all(updatedItems.map(saveItem));
      
      setItems(updatedItems);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = [...items];
        const [removed] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, removed);
        
        // Update positions
        const reorderedItems = newItems.map((item, index) => ({
          ...item,
          position: index
        }));
        
        // Save updated positions to database
        await Promise.all(reorderedItems.map(saveItem));
        
        setItems(reorderedItems);
      }
    }
  }, [items]);

  const handleModuleSettingsUpdate = async (settings: any) => {
    try {
      // Update module_settings in database
      const { error } = await supabase
        .rpc('upsert_course_section_config', {
          p_course_id: courseId,
          p_section_type: settings.module_type,
          p_title: settings.title,
          p_description: '',
          p_icon: settings.icon
        });
        
      if (error) {
        console.error(`Error updating ${settings.module_type} settings:`, error);
        toast.error(`更新模块设置失败`);
        return;
      }
      
      setModuleSettings(settings);
      toast.success("模块设置已更新");
    } catch (err) {
      console.error(`Exception updating ${itemType} settings:`, err);
      toast.error(`更新模块设置失败`);
    }
  };

  return (
    <Card>
      {['objectives', 'requirements', 'audiences'].includes(itemType) ? (
        <ModuleTitleEdit 
          courseId={courseId}
          moduleType={itemType}
          defaultTitle={moduleSettings.title}
          defaultIcon={moduleSettings.icon}
          className="mb-2"
        />
      ) : (
        <CardHeader className="pb-3">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      
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
