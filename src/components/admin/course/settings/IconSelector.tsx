
import React, { useState } from 'react';
import { 
  Book, BookOpen, Target, Users, Award, Star, Flag, Briefcase, 
  GraduationCap, Image, Video, List, Check, Pencil, 
  Plus, Minus, X, Trash, Edit, Move, ArrowDown, ArrowUp, 
  ArrowLeft, ArrowRight, ChevronDown, ChevronUp, ChevronLeft, 
  ChevronRight, CircleCheck, CircleMinus, CirclePlus, CircleX
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Define all available icons
const availableIcons = [
  { name: "book", component: Book },
  { name: "book-open", component: BookOpen },
  { name: "target", component: Target },
  { name: "users", component: Users },
  { name: "award", component: Award },
  { name: "star", component: Star },
  { name: "flag", component: Flag },
  { name: "briefcase", component: Briefcase },
  { name: "graduation-cap", component: GraduationCap },
  { name: "image", component: Image },
  { name: "video", component: Video },
  { name: "list", component: List },
  { name: "check", component: Check },
  { name: "pencil", component: Pencil },
  { name: "plus", component: Plus },
  { name: "minus", component: Minus },
  { name: "x", component: X },
  { name: "trash", component: Trash },
  { name: "edit", component: Edit },
  { name: "move", component: Move },
  { name: "arrow-down", component: ArrowDown },
  { name: "arrow-up", component: ArrowUp },
  { name: "arrow-left", component: ArrowLeft },
  { name: "arrow-right", component: ArrowRight },
  { name: "chevron-down", component: ChevronDown },
  { name: "chevron-up", component: ChevronUp },
  { name: "chevron-left", component: ChevronLeft },
  { name: "chevron-right", component: ChevronRight },
  { name: "circle-check", component: CircleCheck },
  { name: "circle-minus", component: CircleMinus },
  { name: "circle-plus", component: CirclePlus },
  { name: "circle-x", component: CircleX }
];

// Helper function to render icon by name
export const renderIcon = (iconName: string | undefined, className?: string) => {
  if (!iconName) return null;
  
  const iconData = availableIcons.find(i => i.name === iconName);
  if (!iconData) return null;
  
  const IconComponent = iconData.component;
  return <IconComponent className={className || "h-4 w-4"} />;
};

interface IconSelectorProps {
  currentIcon?: string;
  onSelectIcon: (iconName: string) => void;
  triggerClassName?: string;
  buttonSize?: "default" | "sm" | "lg" | "icon";
}

export const IconSelector: React.FC<IconSelectorProps> = ({
  currentIcon,
  onSelectIcon,
  triggerClassName,
  buttonSize = "icon"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSelectIcon = (iconName: string) => {
    onSelectIcon(iconName);
    setIsOpen(false);
    toast.success("图标已更新");
  };

  const currentIconDisplay = currentIcon 
    ? renderIcon(currentIcon)
    : <Edit className="h-4 w-4" />;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size={buttonSize}
          className={triggerClassName || "p-1"}
        >
          {currentIconDisplay}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <h4 className="font-medium mb-2">选择图标</h4>
        <div className="grid grid-cols-6 gap-2">
          {availableIcons.map((icon) => (
            <Button
              key={icon.name}
              variant={currentIcon === icon.name ? "secondary" : "outline"}
              size="icon"
              className="h-8 w-8 p-1"
              title={icon.name}
              onClick={() => handleSelectIcon(icon.name)}
            >
              <icon.component className="h-5 w-5" />
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default IconSelector;
