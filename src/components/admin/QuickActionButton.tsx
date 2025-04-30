
import { Button } from "@/components/ui/button";
import { memo } from "react";

interface QuickActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost" | "success";
}

export const QuickActionButton = memo(({ 
  icon: Icon, 
  label, 
  onClick, 
  disabled,
  variant = "outline" 
}: QuickActionButtonProps) => (
  <Button 
    variant={variant}
    onClick={onClick} 
    className="flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 duration-200 rounded-10"
    disabled={disabled}
  >
    <Icon className="h-4 w-4" /> {label}
  </Button>
));

QuickActionButton.displayName = 'QuickActionButton';
