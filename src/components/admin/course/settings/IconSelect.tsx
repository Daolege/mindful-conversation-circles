
import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import IconDisplay from '../../../course-detail/IconDisplay';

// 可用图标列表
const icons = [
  'check', 'star', 'award', 'book-open', 'bookmark', 'bookmark-check', 
  'bookmark-plus', 'bookmark-minus', 'bookmark-x'
];

export interface IconSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  // 兼容旧接口
  selected?: string;
  onSelect?: (value: string) => void;
}

const IconSelect = ({ 
  value, 
  onChange, 
  className,
  size = 'md',
  // 兼容旧接口
  selected,
  onSelect
}: IconSelectProps) => {
  const [open, setOpen] = useState(false);
  
  // 使用value或selected作为当前值
  const currentValue = value || selected || 'check';
  
  // 处理图标选择
  const handleSelect = (icon: string) => {
    if (onChange) onChange(icon);
    if (onSelect) onSelect(icon);
    setOpen(false);
  };

  // 根据尺寸设置图标大小
  const iconSize = {
    sm: 14,
    md: 18,
    lg: 24
  }[size];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex items-center justify-between gap-2 px-3 py-2",
            className
          )}
          onClick={() => setOpen(!open)}
        >
          <IconDisplay 
            iconName={currentValue} 
            className="text-primary"
            size={iconSize} 
          />
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="搜索图标..." />
          <CommandEmpty>未找到图标</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {icons.map((icon) => (
              <CommandItem
                key={icon}
                value={icon}
                onSelect={() => handleSelect(icon)}
                className="flex items-center gap-2 py-2"
              >
                <IconDisplay iconName={icon} size={iconSize} />
                <span className="text-sm">{icon}</span>
                {currentValue === icon && (
                  <Check className="h-4 w-4 ml-auto text-primary" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default IconSelect;
