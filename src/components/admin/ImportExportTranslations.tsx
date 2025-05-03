
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from '@/hooks/useTranslations';
import { TranslationImport } from './TranslationImport';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Label } from '@/components/ui/label';
import { Check, FileDown, AlertTriangle, FileType } from 'lucide-react';
import { toast } from 'sonner';
import { TranslationItem } from '@/lib/services/language/languageCore';
import { exportTranslationsToJson } from '@/lib/utils/translationUtils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

const NAMESPACES = [
  'common', 'navigation', 'courses', 'auth', 'admin', 
  'checkout', 'dashboard', 'errors', 'orders', 'actions', 'home'
];

export const ImportExportTranslations = () => {
  const { t, getTranslations } = useTranslations();
  const { supportedLanguages } = useLanguage();
  
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>(['common']);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<string>('json');
  
  const toggleNamespace = (namespace: string) => {
    setSelectedNamespaces(prev => {
      if (prev.includes(namespace)) {
        return prev.filter(n => n !== namespace);
      } else {
        return [...prev, namespace];
      }
    });
  };
  
  const selectAllNamespaces = () => {
    setSelectedNamespaces([...NAMESPACES]);
  };
  
  const clearNamespaceSelection = () => {
    setSelectedNamespaces([]);
  };
  
  const handleExport = async () => {
    if (!selectedLanguage) {
      toast.error(t('admin:selectLanguageFirst'));
      return;
    }
    
    if (selectedNamespaces.length === 0) {
      toast.error(t('admin:selectNamespaceFirst'));
      return;
    }
    
    setIsExporting(true);
    
    try {
      // Collect translations from all selected namespaces
      const allTranslations: TranslationItem[] = [];
      
      for (const namespace of selectedNamespaces) {
        const result = await getTranslations(selectedLanguage, namespace);
        
        if (result.success && Array.isArray(result.data)) {
          allTranslations.push(...result.data);
        } else {
          console.error(`Error fetching translations for ${namespace}:`, result.error);
        }
      }
      
      if (allTranslations.length === 0) {
        toast.error(t('admin:noTranslationsToExport'));
        return;
      }
      
      // Currently only JSON export is fully implemented
      exportTranslationsToJson(allTranslations, selectedLanguage);
      toast.success(t('admin:translationsExported', { count: allTranslations.length }));
      
    } catch (error) {
      console.error('Error exporting translations:', error);
      toast.error(t('errors:general'));
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle>{t('admin:importExportTranslations')}</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Tabs defaultValue="import">
          <TabsList>
            <TabsTrigger value="import">{t('admin:import')}</TabsTrigger>
            <TabsTrigger value="export">{t('admin:export')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="import" className="pt-4">
            <TranslationImport />
          </TabsContent>
          
          <TabsContent value="export" className="pt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    
                    <div className="space-y-2">
                      <Label>{t('admin:exportFormat')}</Label>
                      <Select
                        value={exportFormat}
                        onValueChange={setExportFormat}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem disabled value="csv">CSV</SelectItem>
                          <SelectItem disabled value="excel">Excel</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {t('admin:onlyJsonSupported')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <Label>{t('admin:selectNamespaces')}</Label>
                      <div className="space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={selectAllNamespaces}
                        >
                          {t('admin:selectAll')}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={clearNamespaceSelection}
                        >
                          {t('admin:clear')}
                        </Button>
                      </div>
                    </div>
                    
                    <ScrollArea className="h-[180px] border rounded-md p-4">
                      <div className="space-y-2">
                        {NAMESPACES.map(namespace => (
                          <div key={namespace} className="flex items-center space-x-2">
                            <Checkbox
                              id={`ns-${namespace}`}
                              checked={selectedNamespaces.includes(namespace)}
                              onCheckedChange={() => toggleNamespace(namespace)}
                            />
                            <Label 
                              htmlFor={`ns-${namespace}`}
                              className="cursor-pointer flex-1"
                            >
                              {namespace}
                              {namespace === 'common' && (
                                <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">
                                  {t('admin:coreNamespace')}
                                </Badge>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  
                  <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <AlertTriangle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">{t('admin:exportInfo')}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('admin:currentlyOnlyJsonSupported')}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full"
                    disabled={isExporting || !selectedLanguage || selectedNamespaces.length === 0}
                    onClick={handleExport}
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    {isExporting 
                      ? t('actions:exporting') 
                      : t('admin:exportTranslations')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
