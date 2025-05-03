
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TranslationItem } from '@/lib/services/language/languageCore';
import { useTranslations } from '@/hooks/useTranslations';
import { toast } from 'sonner';
import { batchUpdateTranslations } from '@/lib/services/language/translationBatchService';
import { Search, Replace, Trash, AlertCircle } from 'lucide-react';

interface BatchEditDialogProps {
  open: boolean;
  onClose: () => void;
  selectedTranslations: TranslationItem[];
  onBatchUpdateComplete: () => void;
}

export function BatchEditDialog({
  open,
  onClose,
  selectedTranslations,
  onBatchUpdateComplete,
}: BatchEditDialogProps) {
  const { t } = useTranslations();
  const [editMode, setEditMode] = useState<'replace' | 'set' | 'clear'>('set');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [setValue, setSetValue] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleBatchEdit = async () => {
    if (selectedTranslations.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      // Process translations based on edit mode
      const updatedTranslations = selectedTranslations.map(translation => {
        const item = { ...translation };
        
        switch (editMode) {
          case 'replace':
            if (findText) {
              // Replace text in the value
              if (caseSensitive) {
                item.value = item.value.split(findText).join(replaceText);
              } else {
                // Case insensitive replace
                const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                item.value = item.value.replace(regex, replaceText);
              }
            }
            break;
            
          case 'set':
            // Set a specific value
            item.value = setValue;
            break;
            
          case 'clear':
            // Clear the value
            item.value = '';
            break;
        }
        
        return item;
      });
      
      // Call API to update all translations
      const result = await batchUpdateTranslations(updatedTranslations);
      
      if (result.success) {
        toast.success(t('admin:batchUpdateSuccess'), {
          description: t('admin:itemsUpdated', { count: result.count })
        });
        onBatchUpdateComplete();
        onClose();
      } else {
        throw new Error(result.error?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Batch edit error:', error);
      toast.error(t('admin:batchUpdateFailed'), {
        description: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {t('admin:batchEditTitle')}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({t('admin:selectedItems', { count: selectedTranslations.length })})
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Edit mode selector */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={editMode === 'replace' ? 'default' : 'outline'}
              onClick={() => setEditMode('replace')}
              className="flex items-center"
            >
              <Replace className="h-4 w-4 mr-2" />
              {t('admin:findReplace')}
            </Button>
            <Button
              size="sm"
              variant={editMode === 'set' ? 'default' : 'outline'}
              onClick={() => setEditMode('set')}
              className="flex items-center"
            >
              <Search className="h-4 w-4 mr-2" />
              {t('admin:setValue')}
            </Button>
            <Button
              size="sm"
              variant={editMode === 'clear' ? 'default' : 'outline'}
              onClick={() => setEditMode('clear')}
              className="flex items-center"
            >
              <Trash className="h-4 w-4 mr-2" />
              {t('admin:clearValues')}
            </Button>
          </div>
          
          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              {t('admin:batchEditWarning')}
            </p>
          </div>
          
          {/* Edit mode content */}
          {editMode === 'replace' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="find-text">{t('admin:findText')}</Label>
                <Input 
                  id="find-text"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  placeholder={t('admin:findTextPlaceholder')}
                />
              </div>
              <div>
                <Label htmlFor="replace-text">{t('admin:replaceWith')}</Label>
                <Input 
                  id="replace-text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  placeholder={t('admin:replaceWithPlaceholder')}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="case-sensitive" 
                  checked={caseSensitive}
                  onCheckedChange={(checked) => setCaseSensitive(!!checked)}
                />
                <Label htmlFor="case-sensitive">{t('admin:caseSensitive')}</Label>
              </div>
            </div>
          )}
          
          {editMode === 'set' && (
            <div>
              <Label htmlFor="set-value">{t('admin:setValue')}</Label>
              <Textarea 
                id="set-value"
                value={setValue}
                onChange={(e) => setSetValue(e.target.value)}
                placeholder={t('admin:setValuePlaceholder')}
                rows={4}
              />
            </div>
          )}
          
          {editMode === 'clear' && (
            <p className="text-sm text-gray-500">
              {t('admin:clearValuesDescription')}
            </p>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('actions:cancel')}
          </Button>
          <Button 
            onClick={handleBatchEdit}
            disabled={isProcessing || 
              (editMode === 'replace' && !findText) ||
              (editMode === 'set' && !setValue) ||
              selectedTranslations.length === 0}
          >
            {isProcessing ? t('actions:processing') : t('actions:applyChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
