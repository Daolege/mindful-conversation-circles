
import React, { useState, useRef } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FileUp, FileDown, FileType, AlertCircle, CheckCircle, X, ArrowRight, Globe } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  exportTranslationsToJson, 
  importTranslationsFromFile, 
  validateTranslationJson 
} from '@/lib/utils/translationUtils';
import { getTranslationsByLanguage } from '@/lib/services/language/translationService';
import { TranslationItem } from '@/lib/services/languageService';
import { Checkbox } from '@/components/ui/checkbox';

// Define supported file formats
const FILE_FORMATS = ['json'];

export const ImportExportTranslations = () => {
  const { t, importTranslations } = useTranslations();
  const { supportedLanguages } = useLanguage();
  
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [showImportDetails, setShowImportDetails] = useState(false);
  const [importPreview, setImportPreview] = useState<TranslationItem[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [allNamespaces, setAllNamespaces] = useState<string[]>([]);
  const [selectAllNamespaces, setSelectAllNamespaces] = useState(true);
  const [fileFormat, setFileFormat] = useState('json');
  const [exportPartial, setExportPartial] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Set default language when languages are loaded
  React.useEffect(() => {
    if (supportedLanguages.length > 0 && !selectedLanguage) {
      setSelectedLanguage(supportedLanguages[0].code);
    }
  }, [supportedLanguages, selectedLanguage]);
  
  // Reset selected namespaces when language changes
  React.useEffect(() => {
    if (selectedLanguage) {
      // This would typically fetch available namespaces for the selected language
      const namespaces = ['common', 'navigation', 'courses', 'auth', 'admin', 'checkout', 'dashboard', 'errors', 'orders', 'actions', 'home'];
      setAllNamespaces(namespaces);
      
      if (selectAllNamespaces) {
        setSelectedNamespaces(namespaces);
      } else {
        setSelectedNamespaces([]);
      }
    }
  }, [selectedLanguage, selectAllNamespaces]);

  const handleSelectAllNamespaces = (checked: boolean) => {
    setSelectAllNamespaces(checked);
    setSelectedNamespaces(checked ? [...allNamespaces] : []);
  };

  const handleNamespaceToggle = (namespace: string, checked: boolean) => {
    if (checked) {
      setSelectedNamespaces(prev => [...prev, namespace]);
      if (selectedNamespaces.length + 1 === allNamespaces.length) {
        setSelectAllNamespaces(true);
      }
    } else {
      setSelectedNamespaces(prev => prev.filter(ns => ns !== namespace));
      setSelectAllNamespaces(false);
    }
  };
  
  const handleExport = async () => {
    if (!selectedLanguage) {
      toast.error(t('errors:selectLanguage'));
      return;
    }
    
    setIsExporting(true);
    
    try {
      // Get all translations for selected language
      const result = await getTranslationsByLanguage(selectedLanguage);
      
      if (!result || result.length === 0) {
        toast.error(t('errors:noTranslationsToExport'));
        setIsExporting(false);
        return;
      }
      
      // Filter by selected namespaces if partial export
      let translationsToExport = result;
      if (exportPartial && selectedNamespaces.length > 0) {
        translationsToExport = result.filter(item => 
          selectedNamespaces.includes(item.namespace)
        );
      }
      
      if (translationsToExport.length === 0) {
        toast.error(t('errors:noMatchingTranslations'));
        setIsExporting(false);
        return;
      }
      
      // Export to JSON
      exportTranslationsToJson(translationsToExport, selectedLanguage);
      
      toast.success(t('admin:exportSuccess'));
    } catch (error) {
      console.error('Error exporting translations:', error);
      toast.error(t('errors:exportFailed'));
    } finally {
      setIsExporting(false);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    if (!selectedLanguage) {
      toast.error(t('errors:selectLanguage'));
      return;
    }
    
    // Check file extension
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !FILE_FORMATS.includes(fileExt)) {
      toast.error(t('errors:invalidFileFormat'));
      return;
    }
    
    setIsLoading(true);
    setImportProgress(10);
    
    try {
      // Parse file and validate format
      const result = await importTranslationsFromFile(file, selectedLanguage);
      setImportProgress(40);
      
      if (!result.success || !result.translations) {
        toast.error(t('errors:importFailed'), { description: result.error });
        setIsLoading(false);
        return;
      }
      
      // Show preview
      setImportPreview(result.translations);
      setShowImportDetails(true);
      setImportProgress(70);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error importing file:', error);
      toast.error(t('errors:importFailed'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const confirmImport = async () => {
    if (importPreview.length === 0) {
      toast.error(t('errors:noTranslationsToImport'));
      return;
    }
    
    setIsLoading(true);
    setImportProgress(80);
    
    try {
      // Import translations to the database
      const result = await importTranslations(importPreview);
      
      if (result.success) {
        toast.success(t('admin:importSuccess'), { 
          description: t('admin:translationsImported', { count: importPreview.length }) 
        });
        
        // Reset state
        setImportPreview([]);
        setShowImportDetails(false);
      } else {
        toast.error(t('errors:importFailed'), { description: result.error });
      }
      
      setImportProgress(100);
    } catch (error) {
      console.error('Error confirming import:', error);
      toast.error(t('errors:importFailed'));
    } finally {
      setIsLoading(false);
      
      // Reset progress after a delay
      setTimeout(() => {
        setImportProgress(0);
      }, 1000);
    }
  };
  
  const cancelImport = () => {
    setImportPreview([]);
    setShowImportDetails(false);
    setImportProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Language selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <Globe className="h-8 w-8 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium">{t('admin:selectLanguageForTranslations')}</h3>
              <p className="text-sm text-gray-500">{t('admin:selectLanguageDescription')}</p>
            </div>
          </div>
          
          <Select
            value={selectedLanguage}
            onValueChange={setSelectedLanguage}
          >
            <SelectTrigger>
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
        </CardContent>
      </Card>
      
      {/* Export section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <FileDown className="h-8 w-8 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium">{t('admin:exportTranslations')}</h3>
              <p className="text-sm text-gray-500">{t('admin:exportTranslationsDescription')}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="export-partial" 
                checked={exportPartial}
                onCheckedChange={setExportPartial}
              />
              <Label htmlFor="export-partial">{t('admin:exportSelectedNamespacesOnly')}</Label>
            </div>
            
            {exportPartial && (
              <div className="border rounded-md p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox 
                    id="select-all-namespaces"
                    checked={selectAllNamespaces}
                    onCheckedChange={handleSelectAllNamespaces}
                  />
                  <Label htmlFor="select-all-namespaces" className="font-medium">
                    {t('admin:selectAllNamespaces')}
                  </Label>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {allNamespaces.map(namespace => (
                    <div key={namespace} className="flex items-center space-x-2">
                      <Checkbox
                        id={`namespace-${namespace}`}
                        checked={selectedNamespaces.includes(namespace)}
                        onCheckedChange={(checked) => handleNamespaceToggle(namespace, !!checked)}
                      />
                      <Label htmlFor={`namespace-${namespace}`} className="text-sm">
                        {namespace}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="space-x-2">
                <Label htmlFor="format-select">{t('admin:fileFormat')}</Label>
                <Select
                  value={fileFormat}
                  onValueChange={setFileFormat}
                >
                  <SelectTrigger id="format-select" className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleExport}
                disabled={isExporting || !selectedLanguage || (exportPartial && selectedNamespaces.length === 0)}
              >
                <FileDown className="h-4 w-4 mr-2" />
                {isExporting ? t('admin:exporting') : t('admin:exportNow')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Import section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <FileUp className="h-8 w-8 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium">{t('admin:importTranslations')}</h3>
              <p className="text-sm text-gray-500">{t('admin:importTranslationsDescription')}</p>
            </div>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".json"
            onChange={handleFileChange}
          />
          
          {importProgress > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span>{t('admin:importProgress')}</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="h-2" />
            </div>
          )}
          
          {showImportDetails ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-100 p-4 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-700">
                    {t('admin:fileReadyForImport')}
                  </span>
                </div>
                <p className="text-sm text-green-700">
                  {t('admin:foundTranslations', { count: importPreview.length })}
                </p>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="preview">
                  <AccordionTrigger>{t('admin:previewTranslations')}</AccordionTrigger>
                  <AccordionContent>
                    <div className="max-h-40 overflow-y-auto border p-2 rounded-md bg-gray-50">
                      <pre className="text-xs">{JSON.stringify(importPreview.slice(0, 5), null, 2)}</pre>
                      {importPreview.length > 5 && (
                        <p className="text-xs text-gray-500 mt-2 italic">
                          {t('admin:moreTranslationsNotShown', { count: importPreview.length - 5 })}
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={cancelImport}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  {t('actions:cancel')}
                </Button>
                <Button 
                  onClick={confirmImport}
                  disabled={isLoading}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {isLoading ? t('admin:importing') : t('admin:confirmImport')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center">
              <FileType className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="font-medium mb-2">{t('admin:dropOrSelectFile')}</h4>
              <p className="text-sm text-gray-500 mb-4">
                {t('admin:supportedFormats')}: {FILE_FORMATS.join(', ')}
              </p>
              
              <Button onClick={triggerFileInput}>
                <FileUp className="h-4 w-4 mr-2" />
                {t('admin:selectFile')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
