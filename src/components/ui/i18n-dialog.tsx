
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from '@/hooks/useTranslations';

interface I18nDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
  onConfirm?: () => void;
  children?: React.ReactNode;
  variant?: 'default' | 'destructive';
}

export function I18nDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelText,
  confirmText,
  onConfirm,
  children,
  variant = 'default'
}: I18nDialogProps) {
  const { t } = useTranslations();
  
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        {children}
        
        {(cancelText || confirmText) && (
          <DialogFooter>
            {cancelText && (
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {cancelText}
              </Button>
            )}
            {confirmText && onConfirm && (
              <Button 
                variant={variant === 'destructive' ? 'destructive' : 'default'}
                onClick={handleConfirm}
              >
                {confirmText}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
