
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import IconSelect from './IconSelect';
import IconDisplay from '../../../course-detail/IconDisplay';

// 统一的列表项定义
export interface ListItem {
  id?: string | number;
  content: string;
  icon?: string;
  position?: number;
}

interface EditableListComponentProps {
  items: ListItem[] | string[];
  onAdd: (item: string) => void;
  onDelete: (index: number) => void;
  onReorder: (sourceIndex: number, destinationIndex: number) => void;
  onUpdate: (index: number, value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  defaultIcon?: string;
}

export const EditableListComponent: React.FC<EditableListComponentProps> = ({
  items,
  onAdd,
  onDelete,
  onReorder,
  onUpdate,
  placeholder = '添加新项...',
  emptyMessage = '列表为空',
  defaultIcon = 'check'
}) => {
  const [newItem, setNewItem] = useState('');
  
  // 处理添加新项目
  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd(newItem.trim());
      setNewItem('');
    }
  };

  // 转换items为标准格式
  const normalizedItems: ListItem[] = items.map((item, index) => {
    if (typeof item === 'string') {
      return {
        id: index,
        content: item,
        icon: defaultIcon,
        position: index
      };
    }
    return item as ListItem;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input 
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          className="flex-1"
        />
        <Button 
          onClick={handleAdd}
          disabled={!newItem.trim()}
          className="flex-shrink-0"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          添加
        </Button>
      </div>
      
      {normalizedItems.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {normalizedItems.map((item, index) => (
            <div 
              key={item.id || index}
              className="flex items-center p-3 border rounded-md bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 mr-2">
                <IconDisplay 
                  iconName={item.icon || defaultIcon}
                  size={18}
                  className="text-primary"
                />
              </div>
              <div className="flex-1">
                <Input 
                  value={item.content}
                  onChange={(e) => onUpdate(index, e.target.value)}
                  className="border-none shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onReorder(index, index - 1)}
                  disabled={index === 0}
                  className="h-8 w-8"
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onReorder(index, index + 1)}
                  disabled={index === normalizedItems.length - 1}
                  className="h-8 w-8"
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(index)}
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
