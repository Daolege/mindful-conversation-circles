
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from '@/hooks/useTranslations';
import { getTranslationHistory, rollbackToVersion, TranslationHistoryItem } from '@/lib/services/language/translationBatchService';
import { History, RotateCcw, Diff, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface TranslationHistoryProps {
  open: boolean;
  onClose: () => void;
  translationId: number;
  onHistoryChange: () => void;
}

export function TranslationHistory({
  open,
  onClose,
  translationId,
  onHistoryChange
}: TranslationHistoryProps) {
  const { t } = useTranslations();
  const [historyItems, setHistoryItems] = useState<TranslationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [isRollingBack, setIsRollingBack] = useState(false);
  
  useEffect(() => {
    if (open && translationId) {
      loadHistory();
    }
  }, [open, translationId]);
  
  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const result = await getTranslationHistory(translationId);
      
      if (result.success && Array.isArray(result.data)) {
        setHistoryItems(result.data);
      } else {
        throw new Error(result.error?.message || 'Failed to load history');
      }
    } catch (error) {
      console.error('Error loading translation history:', error);
      toast.error(t('admin:historyLoadError'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRollback = async (version: number) => {
    setIsRollingBack(true);
    try {
      const result = await rollbackToVersion(translationId, version);
      
      if (result.success) {
        toast.success(t('admin:rollbackSuccess'));
        onHistoryChange();
        loadHistory(); // Reload history to show the new version
      } else {
        throw new Error(result.error?.message || 'Failed to rollback');
      }
    } catch (error) {
      console.error('Error during rollback:', error);
      toast.error(t('admin:rollbackError'));
    } finally {
      setIsRollingBack(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      return dateString;
    }
  };
  
  // Find differences between versions to highlight changes
  const highlightDifferences = (oldText: string, newText: string) => {
    if (!oldText || !newText) return { oldHighlighted: oldText, newHighlighted: newText };
    
    // Very simple diff highlighting - in a real app would use a proper diff library
    const words1 = oldText.split(/\s+/);
    const words2 = newText.split(/\s+/);
    
    const oldHighlighted = words1.map(word => 
      words2.includes(word) ? word : `<span class="bg-red-100">${word}</span>`
    ).join(' ');
    
    const newHighlighted = words2.map(word => 
      words1.includes(word) ? word : `<span class="bg-green-100">${word}</span>`
    ).join(' ');
    
    return { oldHighlighted, newHighlighted };
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" />
            {t('admin:translationHistory')}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-r-transparent"></div>
          </div>
        ) : historyItems.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground">{t('admin:noHistoryFound')}</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4 pr-4">
              {historyItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`border rounded-md p-4 ${selectedVersion === item.version ? 'border-blue-300 bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <Badge variant="outline" className="mb-1">
                        {t('admin:version')} {item.version}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(item.changed_at)}
                        {item.changed_by && ` • ${item.changed_by}`}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => setSelectedVersion(selectedVersion === item.version ? null : item.version)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        {t('actions:view')}
                      </Button>
                      {index !== 0 && ( // Don't allow rollback to current version
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => handleRollback(item.version)}
                          disabled={isRollingBack}
                        >
                          <RotateCcw className="h-3.5 w-3.5 mr-1" />
                          {t('admin:rollback')}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {selectedVersion === item.version && (
                    <div className="mt-2">
                      {item.old_value && (
                        <div className="mb-2">
                          <div className="text-xs font-medium mb-1">{t('admin:previousValue')}</div>
                          <div className="bg-red-50 p-2 rounded text-sm font-mono whitespace-pre-wrap">
                            {item.old_value || t('admin:emptyValue')}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-medium mb-1">{t('admin:newValue')}</div>
                        <div className="bg-green-50 p-2 rounded text-sm font-mono whitespace-pre-wrap">
                          {item.new_value || t('admin:emptyValue')}
                        </div>
                      </div>
                      
                      {item.old_value && item.new_value && (
                        <div className="mt-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="flex items-center text-xs h-7"
                          >
                            <Diff className="h-3.5 w-3.5 mr-1" />
                            {t('admin:showDifferences')}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
