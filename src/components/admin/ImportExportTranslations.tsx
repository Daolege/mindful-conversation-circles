
import React, { useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { FileType, Upload, Download, FileCheck, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { exportTranslationsToJson, importTranslationsFromFile } from '@/lib/utils/translationUtils';
import { importTranslations, getTranslationsByLanguage } from '@/lib/services/languageService';

export const ImportExportTranslations = () => {
  const { t, refreshTranslations } = useTranslations();
  const { supportedLanguages } = useLanguage();
  
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importFile, setImportFile] = useState<File | null>(null);
  
  const handleExportTranslations = async () => {
    if (!selectedLanguage) {
      toast.error(t('admin:selectLanguageFirst'));
      return;
    }
    
    setIsExporting(true);
    try {
      const translations = await getTranslationsByLanguage(selectedLanguage);
      
      if (!translations.length) {
        toast.warning(t('admin:noTranslationsToExport'));
        return;
      }
      
      exportTranslationsToJson(translations, selectedLanguage);
      toast.success(t('admin:translationsExported'));
    } catch (error) {
      console.error('Error exporting translations:', error);
      toast.error(t('errors:general'));
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    
    if (file && !file.name.endsWith('.json')) {
      toast.error(t('admin:onlyJsonAllowed'));
      event.target.value = '';
      return;
    }
    
    setImportFile(file);
  };
  
  const handleImportTranslations = async () => {
    if (!selectedLanguage) {
      toast.error(t('admin:selectLanguageFirst'));
      return;
    }
    
    if (!importFile) {
      toast.error(t('admin:selectFileFirst'));
      return;
    }
    
    setIsImporting(true);
    setImportProgress(10);
    
    try {
      const result = await importTranslationsFromFile(importFile, selectedLanguage);
      
      if (!result.success || !result.translations) {
        toast.error(result.error || t('errors:general'));
        setIsImporting(false);
        setImportProgress(0);
        return;
      }
      
      setImportProgress(50);
      
      // Save translations to the database
      const importResult = await importTranslations(result.translations);
      
      if (!importResult.success) {
        toast.error(importResult.error?.message || t('errors:general'));
        setIsImporting(false);
        setImportProgress(0);
        return;
      }
      
      setImportProgress(90);
      
      // Refresh translations
      await refreshTranslations();
      
      setImportProgress(100);
      toast.success(t('admin:translationsImported', { count: result.translations.length }));
      
      // Reset file input
      setImportFile(null);
      const fileInput = document.getElementById('import-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error importing translations:', error);
      toast.error(t('errors:general'));
    } finally {
      setIsImporting(false);
      setTimeout(() => setImportProgress(0), 1000);
    }
  };
  
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="export-language">{t('admin:selectLanguage')}</Label>
            <Select
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
            >
              <SelectTrigger id="export-language">
                <SelectValue placeholder={t('admin:selectLanguage')} />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-md p-4">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <Download className="h-5 w-5" />
                {t('admin:exportTranslations')}
              </h3>
              <p className="text-muted-foreground mt-2 mb-4 text-sm">
                {t('admin:exportTranslationsDescription')}
              </p>
              
              <Button
                onClick={handleExportTranslations}
                disabled={!selectedLanguage || isExporting}
                className="w-full"
              >
                {isExporting ? t('actions:exporting') : t('admin:exportJson')}
              </Button>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {t('admin:importTranslations')}
              </h3>
              <p className="text-muted-foreground mt-2 mb-4 text-sm">
                {t('admin:importTranslationsDescription')}
              </p>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="import-file" className="block mb-2">
                    {t('admin:selectJsonFile')}
                  </Label>
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={handleFileSelected}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary file:text-white
                      hover:file:bg-primary/90"
                  />
                </div>
                
                {importFile && (
                  <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                    <FileCheck className="h-4 w-4 text-green-500" />
                    <span className="truncate">{importFile.name}</span>
                  </div>
                )}
                
                {importProgress > 0 && (
                  <Progress value={importProgress} className="h-2" />
                )}
                
                <Button
                  onClick={handleImportTranslations}
                  disabled={!selectedLanguage || !importFile || isImporting}
                  className="w-full"
                >
                  {isImporting ? t('actions:importing') : t('admin:importJson')}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 border-amber-200 border rounded-md p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <h4 className="font-semibold">{t('admin:importWarningTitle')}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {t('admin:importWarningDescription')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
