
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from '@/hooks/useTranslations';

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'destructive';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  description,
  confirmText,
  cancelText,
  open,
  onConfirm,
  onCancel,
  variant = 'default'
}) => {
  const { t } = useTranslations();
  
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onCancel();
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{cancelText || t('actions:cancel')}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className={variant === 'destructive' ? 
              'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 
              undefined}
          >
            {confirmText || t('actions:confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
