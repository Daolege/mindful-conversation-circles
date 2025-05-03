
import React, { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Search, Save, RefreshCw, FileText, BarChart2, Check, X, FileUp, FileDown, History, Type } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImportExportTranslations } from './ImportExportTranslations';
import { TranslationItem } from '@/lib/services/languageService';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { TranslationStats } from './TranslationStats';

const NAMESPACES = ['common', 'navigation', 'courses', 'auth', 'admin', 'checkout', 'dashboard', 'errors', 'orders', 'actions', 'home'];

export const TranslationEditor = () => {
  const { t, updateTranslation, getTranslations, refreshTranslations } = useTranslations();
  const { supportedLanguages } = useLanguage();
  
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedNamespace, setSelectedNamespace] = useState<string>('common');
  const [translations, setTranslations] = useState<TranslationItem[]>([]);
  const [filteredTranslations, setFilteredTranslations] = useState<TranslationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingTranslation, setEditingTranslation] = useState<TranslationItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTranslations, setSelectedTranslations] = useState<string[]>([]);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const [rtlPreview, setRtlPreview] = useState(false);
  
  // Translation stats
  const [stats, setStats] = useState({
    total: 0,
    translated: 0,
    missing: 0,
    completion: 0
  });
  
  useEffect(() => {
    if (supportedLanguages.length > 0 && !selectedLanguage) {
      setSelectedLanguage(supportedLanguages[0].code);
    }
  }, [supportedLanguages, selectedLanguage]);
  
  useEffect(() => {
    if (selectedLanguage && selectedNamespace) {
      loadTranslations();
    }
  }, [selectedLanguage, selectedNamespace]);
  
  useEffect(() => {
    if (searchQuery) {
      setFilteredTranslations(
        translations.filter(t => 
          t.key.toLowerCase().includes(searchQuery.toLowerCase()) || 
          t.value.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else if (showMissingOnly) {
      setFilteredTranslations(
        translations.filter(t => !t.value || t.value.trim() === '')
      );
    } else {
      setFilteredTranslations(translations);
    }
  }, [searchQuery, translations, showMissingOnly]);
  
  useEffect(() => {
    // Calculate statistics
    if (translations.length > 0) {
      const total = translations.length;
      const missing = translations.filter(t => !t.value || t.value.trim() === '').length;
      const translated = total - missing;
      const completion = Math.round((translated / total) * 100);
      
      setStats({
        total,
        translated,
        missing,
        completion
      });
    }
  }, [translations]);
  
  const loadTranslations = async () => {
    if (!selectedLanguage || !selectedNamespace) return;
    
    setIsLoading(true);
    
    try {
      const result = await getTranslations(selectedLanguage, selectedNamespace);
      
      if (result.success && Array.isArray(result.data)) {
        setTranslations(result.data);
        setFilteredTranslations(result.data);
        setSelectedTranslations([]);
      } else {
        toast.error(t('errors:general'), { description: result.error });
      }
    } catch (error) {
      console.error('Error loading translations:', error);
      toast.error(t('errors:general'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditTranslation = (translation: TranslationItem) => {
    setEditingTranslation({...translation});
    setRtlPreview(false);
  };
  
  const handleSaveTranslation = async () => {
    if (!editingTranslation) return;
    
    setIsSaving(true);
    
    try {
      const result = await updateTranslation(
        editingTranslation.language_code,
        editingTranslation.namespace,
        editingTranslation.key,
        editingTranslation.value
      );
      
      if (result.success) {
        toast.success(t('admin:translationSaved'));
        loadTranslations();
        setEditingTranslation(null);
      } else {
        toast.error(t('errors:general'), { description: result.error });
      }
    } catch (error) {
      console.error('Error saving translation:', error);
      toast.error(t('errors:general'));
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleRefreshTranslations = async () => {
    setIsLoading(true);
    
    try {
      const result = await refreshTranslations();
      
      if (result.success) {
        toast.success(t('admin:translationsRefreshed'));
        loadTranslations();
      } else {
        toast.error(t('errors:general'), { description: result.error });
      }
    } catch (error) {
      console.error('Error refreshing translations:', error);
      toast.error(t('errors:general'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleTranslationSelection = (key: string) => {
    setSelectedTranslations(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };
  
  const handleToggleMissingOnly = () => {
    setShowMissingOnly(!showMissingOnly);
  };
  
  const toggleRtlPreview = () => {
    setRtlPreview(!rtlPreview);
  };
  
  const isLanguageRtl = (code: string) => {
    const lang = supportedLanguages.find(l => l.code === code);
    return lang?.rtl || false;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('admin:translationEditor')}</CardTitle>
        <CardDescription>
          {t('admin:translationEditorDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="edit">
          <TabsList className="mb-4">
            <TabsTrigger value="edit">{t('admin:editTranslations')}</TabsTrigger>
            <TabsTrigger value="stats">{t('admin:translationStats')}</TabsTrigger>
            <TabsTrigger value="import">{t('admin:importExport')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit">
            <div className="space-y-4">
              {/* Control panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="language-select">{t('admin:language')}</Label>
                  <Select
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                  >
                    <SelectTrigger id="language-select">
                      <SelectValue placeholder={t('admin:selectLanguage')} />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedLanguages.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.nativeName} ({lang.code})
                          {lang.rtl && <span className="ml-2">(RTL)</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="namespace-select">{t('admin:namespace')}</Label>
                  <Select
                    value={selectedNamespace}
                    onValueChange={setSelectedNamespace}
                  >
                    <SelectTrigger id="namespace-select">
                      <SelectValue placeholder={t('admin:selectNamespace')} />
                    </SelectTrigger>
                    <SelectContent>
                      {NAMESPACES.map(namespace => (
                        <SelectItem key={namespace} value={namespace}>
                          {namespace}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="translation-search">{t('admin:search')}</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="translation-search"
                      placeholder={t('admin:searchTranslations')}
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t('admin:translationProgress')}</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.completion}% ({stats.translated}/{stats.total})
                  </span>
                </div>
                <Progress value={stats.completion} className="h-2" />
              </div>
              
              {/* Action buttons */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRefreshTranslations}
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t('admin:refreshTranslations')}
                  </Button>
                  
                  <Button 
                    variant={showMissingOnly ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleMissingOnly}
                  >
                    {showMissingOnly ? <Check className="h-4 w-4 mr-2" /> : <X className="h-4 w-4 mr-2" />}
                    {t('admin:showMissingOnly')}
                  </Button>
                  
                  {isLanguageRtl(selectedLanguage) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                    >
                      <Type className="h-4 w-4 mr-2 rtl-mirror" />
                      {t('admin:rtlPreview')}
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={`${stats.missing > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                    {stats.missing > 0 ? t('admin:missingTranslations', { count: stats.missing }) : t('admin:allTranslated')}
                  </Badge>
                  
                  <span className="text-sm text-muted-foreground">
                    {filteredTranslations.length} {t('admin:translationsFound')}
                  </span>
                </div>
              </div>
              
              {/* Translation list */}
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="border rounded-md p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-8 bg-gray-100 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {filteredTranslations.length > 0 ? (
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4 pr-4">
                        {filteredTranslations.map((translation) => (
                          <div 
                            key={translation.key} 
                            className={`border rounded-md p-4 ${
                              !translation.value || translation.value.trim() === '' 
                                ? 'border-amber-200 bg-amber-50' 
                                : 'border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center">
                                {bulkEditMode && (
                                  <Checkbox 
                                    className="mr-2"
                                    checked={selectedTranslations.includes(translation.key)}
                                    onCheckedChange={() => toggleTranslationSelection(translation.key)}
                                  />
                                )}
                                <Label className="font-mono text-xs">{translation.key}</Label>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditTranslation(translation)}
                              >
                                {t('admin:edit')}
                              </Button>
                            </div>
                            <div className={`${
                              !translation.value || translation.value.trim() === '' 
                                ? 'bg-amber-100' 
                                : 'bg-gray-50'
                            } p-3 rounded-md break-all whitespace-pre-wrap`}>
                              {translation.value || <span className="text-gray-400">({t('admin:emptyTranslation')})</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12 border rounded-lg">
                      <p className="text-muted-foreground">{t('admin:noTranslationsFound')}</p>
                    </div>
                  )}
                </>
              )}
              
              {/* Edit dialog */}
              {editingTranslation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
                    <h3 className="text-lg font-medium mb-4">{t('admin:editTranslation')}</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label className="font-mono text-xs">{editingTranslation.key}</Label>
                          {isLanguageRtl(editingTranslation.language_code) && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={toggleRtlPreview}
                            >
                              <Type className="h-4 w-4 mr-2 rtl-mirror" />
                              {rtlPreview ? t('admin:editMode') : t('admin:rtlPreview')}
                            </Button>
                          )}
                        </div>
                        
                        {rtlPreview ? (
                          <div 
                            dir="rtl" 
                            className="border rounded-md p-4 min-h-[150px] bg-gray-50 text-right font-mono"
                          >
                            {editingTranslation.value}
                          </div>
                        ) : (
                          <Textarea
                            rows={6}
                            value={editingTranslation.value}
                            onChange={(e) => setEditingTranslation({
                              ...editingTranslation,
                              value: e.target.value
                            })}
                            className="font-mono mt-1"
                            dir={isLanguageRtl(editingTranslation.language_code) ? "rtl" : "ltr"}
                          />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 mt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => setEditingTranslation(null)}
                      >
                        {t('actions:cancel')}
                      </Button>
                      <Button 
                        onClick={handleSaveTranslation}
                        disabled={isSaving || rtlPreview}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? t('actions:saving') : t('actions:save')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="stats">
            <TranslationStats />
          </TabsContent>
          
          <TabsContent value="import">
            <ImportExportTranslations />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
