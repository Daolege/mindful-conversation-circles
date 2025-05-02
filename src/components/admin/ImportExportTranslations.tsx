
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Download, Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { exportTranslationsToJson, importTranslationsFromFile } from '@/lib/utils/translationUtils';
import { getTranslationsByLanguage } from '@/lib/services/languageService';

export const ImportExportTranslations = () => {
  const { t, importTranslations } = useTranslations();
  const { supportedLanguages } = useLanguage();
  
  const [exportLanguage, setExportLanguage] = useState<string>('');
  const [importLanguage, setImportLanguage] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const handleExport = async () => {
    if (!exportLanguage) {
      toast.error(t('errors:validation'), {
        description: t('admin:selectLanguageToExport')
      });
      return;
    }
    
    setIsExporting(true);
    
    try {
      // 获取所有翻译
      const translations = await getTranslationsByLanguage(exportLanguage);
      
      // 导出为JSON文件
      exportTranslationsToJson(translations, exportLanguage);
      
      toast.success(t('admin:exportSuccess'));
    } catch (error) {
      console.error('Error exporting translations:', error);
      toast.error(t('errors:general'), {
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!importLanguage) {
      toast.error(t('errors:validation'), {
        description: t('admin:selectLanguageToImport')
      });
      return;
    }
    
    setIsImporting(true);
    
    try {
      const result = await importTranslationsFromFile(file, importLanguage);
      
      if (result.success && result.translations) {
        // 导入到数据库
        const importResult = await importTranslations(result.translations);
        
        if (importResult.success) {
          toast.success(t('admin:importSuccess'));
          // 重置文件输入
          event.target.value = '';
        } else {
          throw new Error(importResult.error);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error importing translations:', error);
      toast.error(t('errors:general'), {
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsImporting(false);
    }
  };
  
  return (
    <Card className="p-6">
      <Tabs defaultValue="export">
        <TabsList className="mb-4">
          <TabsTrigger value="export">{t('admin:exportTranslations')}</TabsTrigger>
          <TabsTrigger value="import">{t('admin:importTranslations')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="export" className="space-y-4">
          <div>
            <Label htmlFor="export-language">{t('admin:language')}</Label>
            <Select
              value={exportLanguage}
              onValueChange={setExportLanguage}
            >
              <SelectTrigger id="export-language">
                <SelectValue placeholder={t('admin:selectLanguageToExport')} />
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
          
          <Button 
            onClick={handleExport} 
            disabled={isExporting || !exportLanguage}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? t('common:processing') : t('admin:exportTranslations')}
          </Button>
        </TabsContent>
        
        <TabsContent value="import" className="space-y-4">
          <div>
            <Label htmlFor="import-language">{t('admin:language')}</Label>
            <Select
              value={importLanguage}
              onValueChange={setImportLanguage}
            >
              <SelectTrigger id="import-language">
                <SelectValue placeholder={t('admin:selectLanguageToImport')} />
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
          
          <div className="space-y-2">
            <Label htmlFor="import-file">{t('admin:selectJsonFile')}</Label>
            <input
              id="import-file"
              type="file"
              accept=".json"
              disabled={isImporting || !importLanguage}
              onChange={handleImportFileChange}
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>
          
          <Button 
            disabled={true}
            className="w-full opacity-50 cursor-not-allowed"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isImporting ? t('common:processing') : t('admin:importTranslations')}
          </Button>
          <p className="text-xs text-muted-foreground">
            {t('admin:importTranslationsTip')}
          </p>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
