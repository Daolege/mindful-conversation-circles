
import React, { useState, useRef } from 'react';
import { useTranslations } from "@/hooks/useTranslations";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Download, Upload, FileText } from 'lucide-react';
import { exportTranslationsToJson, importTranslationsFromFile } from '@/lib/utils/translationUtils';
import { useQuery } from "@tanstack/react-query";
import { getTranslationsByLanguage } from '@/lib/services/languageService';

export const ImportExportTranslations = () => {
  const { t, importTranslations, refreshTranslations } = useTranslations();
  const { supportedLanguages } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: translations = [], isLoading, refetch } = useQuery({
    queryKey: ['translations', selectedLanguage],
    queryFn: () => getTranslationsByLanguage(selectedLanguage),
    enabled: !!selectedLanguage,
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Ensure at least one language is selected
  React.useEffect(() => {
    if (supportedLanguages.length > 0 && !selectedLanguage) {
      setSelectedLanguage(supportedLanguages[0].code);
    }
  }, [supportedLanguages, selectedLanguage]);
  
  const handleExport = async () => {
    if (!selectedLanguage) {
      toast.error(t('errors:selectLanguage'));
      return;
    }
    
    setIsExporting(true);
    
    try {
      // Refresh data before export
      await refetch();
      exportTranslationsToJson(translations, selectedLanguage);
      toast.success(t('admin:exportSuccess'));
    } catch (error) {
      console.error('Error exporting translations:', error);
      toast.error(t('errors:exportFailed'));
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedLanguage) return;
    
    setIsImporting(true);
    
    try {
      const result = await importTranslationsFromFile(file, selectedLanguage);
      
      if (result.success && result.translations) {
        // Import translations to the database
        const importResult = await importTranslations(result.translations);
        
        if (importResult.success) {
          toast.success(t('admin:importSuccess'));
          // Refresh translations in the UI
          await refreshTranslations();
          // Refresh the query data
          await refetch();
        } else {
          toast.error(t('errors:importFailed'), { description: importResult.error });
        }
      } else {
        toast.error(t('errors:invalidFileFormat'), { description: result.error });
      }
    } catch (error) {
      console.error('Error importing translations:', error);
      toast.error(t('errors:importFailed'));
    } finally {
      setIsImporting(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">{t('admin:translationTips')}</h3>
            <p className="text-sm text-blue-700 mt-1">
              {t('admin:translationExportImportTip')}
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="export-language">{t('admin:selectLanguage')}</Label>
          <Select
            value={selectedLanguage}
            onValueChange={setSelectedLanguage}
          >
            <SelectTrigger id="export-language" className="w-full sm:w-72">
              <SelectValue placeholder={t('admin:selectLanguage')} />
            </SelectTrigger>
            <SelectContent>
              {supportedLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center gap-2">
                    <span>{lang.nativeName}</span>
                    <span className="text-xs text-muted-foreground">({lang.name})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border rounded-md">
            <h3 className="text-lg font-medium mb-4">{t('admin:exportTranslations')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('admin:exportTranslationsDescription')}
            </p>
            
            <Button
              onClick={handleExport}
              disabled={isExporting || isLoading || !selectedLanguage}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? t('admin:exporting') : t('admin:exportJson')}
            </Button>
          </div>
          
          <div className="p-4 border rounded-md">
            <h3 className="text-lg font-medium mb-4">{t('admin:importTranslations')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('admin:importTranslationsDescription')}
            </p>
            
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden"
              accept=".json"
              onChange={handleFileImport}
            />
            
            <Button
              onClick={handleImportClick}
              disabled={isImporting || !selectedLanguage}
              variant="outline"
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isImporting ? t('admin:importing') : t('admin:importJson')}
            </Button>
          </div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          {t('admin:translationCount')}: {translations.length}
        </div>
      </div>
    </div>
  );
};
