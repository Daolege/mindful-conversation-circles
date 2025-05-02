
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { importTranslations } from '@/lib/services/languageService';
import { importTranslationsFromFile } from '@/lib/utils/translationUtils';
import { FileIcon, Upload } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export const TranslationImport = () => {
  const { t, refreshTranslations } = useTranslations();
  const { supportedLanguages } = useLanguage();
  
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (!file.name.endsWith('.json')) {
        toast.error(t('admin:onlyJsonAllowed'));
        return;
      }
      setUploadedFile(file);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.name.endsWith('.json')) {
        toast.error(t('admin:onlyJsonAllowed'));
        e.target.value = '';
        return;
      }
      setUploadedFile(file);
    }
  };
  
  const handleImport = async () => {
    if (!selectedLanguage) {
      toast.error(t('admin:selectLanguageFirst'));
      return;
    }
    
    if (!uploadedFile) {
      toast.error(t('admin:selectFileFirst'));
      return;
    }
    
    setIsImporting(true);
    setImportProgress(10);
    
    try {
      // Parse the file
      const result = await importTranslationsFromFile(uploadedFile, selectedLanguage);
      
      if (!result.success || !result.translations) {
        toast.error(result.error || t('errors:general'));
        return;
      }
      
      setImportProgress(40);
      
      // Import translations to database
      const importResult = await importTranslations(result.translations);
      
      if (!importResult.success) {
        toast.error(importResult.error?.message || t('errors:general'));
        return;
      }
      
      setImportProgress(80);
      
      // Refresh translations
      await refreshTranslations();
      setImportProgress(100);
      
      toast.success(t('admin:translationsImportSuccess', {
        count: result.translations.length
      }));
      
      // Reset state
      setUploadedFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error importing translations:', error);
      toast.error(t('errors:general'));
    } finally {
      setIsImporting(false);
      setTimeout(() => setImportProgress(0), 2000);
    }
  };
  
  const allowDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="import-language">{t('admin:selectLanguage')}</Label>
            <Select
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
            >
              <SelectTrigger id="import-language">
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
          
          <div
            className={`border-2 border-dashed rounded-lg p-10 text-center ${
              uploadedFile ? 'border-primary bg-primary/5' : 'border-gray-300'
            }`}
            onDragOver={allowDrag}
            onDragEnter={allowDrag}
            onDrop={handleFileDrop}
          >
            {uploadedFile ? (
              <div className="space-y-2">
                <FileIcon className="h-10 w-10 mx-auto text-primary" />
                <p className="font-medium">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {Math.round(uploadedFile.size / 1024)} KB
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadedFile(null)}
                >
                  {t('admin:removeFile')}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-medium">{t('admin:dragAndDropJson')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('admin:orBrowseFiles')}
                </p>
                <div>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="bg-primary text-primary-foreground rounded-md text-sm py-2 px-4 inline-block">
                      {t('admin:browseFiles')}
                    </span>
                    <input
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".json"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
          
          {importProgress > 0 && (
            <Progress value={importProgress} className="h-2" />
          )}
          
          <Button
            className="w-full"
            disabled={!uploadedFile || !selectedLanguage || isImporting}
            onClick={handleImport}
          >
            {isImporting 
              ? t('actions:importing') 
              : t('admin:importTranslations')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
