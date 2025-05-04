
import React, { useState } from 'react';
import { 
  Book, BookOpen, Target, Users, Award, Star, Flag, Briefcase, 
  GraduationCap, Image, Video, List, Check, Pencil, 
  Trash, Edit, BookText, FileText, Brain, 
  Lightbulb, BarChart, PieChart, LineChart, Presentation,
  School, Calculator, BookA, BookCopy, BookDashed, BookHeart,
  BookKey, BookLock, BookMarked, BookOpenCheck, BookType, BookUp,
  Notebook, Folders, Database, FileSpreadsheet, Code, Library,
  Microscope, Atom, Beaker, Coffee, Globe
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
  { name: "trash", component: Trash },
  { name: "edit", component: Edit },
  // New added icons
  { name: "book-text", component: BookText },
  { name: "file-text", component: FileText },
  { name: "brain", component: Brain },
  { name: "lightbulb", component: Lightbulb },
  { name: "bar-chart", component: BarChart },
  { name: "pie-chart", component: PieChart },
  { name: "line-chart", component: LineChart },
  { name: "presentation", component: Presentation },
  { name: "school", component: School },
  { name: "calculator", component: Calculator },
  { name: "book-a", component: BookA },
  { name: "book-copy", component: BookCopy },
  { name: "book-dashed", component: BookDashed },
  { name: "book-heart", component: BookHeart },
  { name: "book-key", component: BookKey },
  { name: "book-lock", component: BookLock },
  { name: "book-marked", component: BookMarked },
  { name: "book-open-check", component: BookOpenCheck },
  { name: "book-type", component: BookType },
  { name: "book-up", component: BookUp },
  { name: "notebook", component: Notebook },
  { name: "folders", component: Folders },
  { name: "database", component: Database },
  { name: "file-spreadsheet", component: FileSpreadsheet },
  { name: "code", component: Code },
  { name: "library", component: Library },
  { name: "microscope", component: Microscope },
  { name: "atom", component: Atom },
  { name: "beaker", component: Beaker },
  { name: "coffee", component: Coffee },
  { name: "globe", component: Globe }
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
