
import React, { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, PieChart, Grid } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TranslationItem } from '@/lib/services/language/languageCore';

// Define namespaces
const NAMESPACES = ['common', 'navigation', 'courses', 'auth', 'admin', 'checkout', 'dashboard', 'errors', 'orders', 'actions', 'home'];

type NamespaceStats = {
  namespace: string;
  total: number;
  translated: number;
  missing: number;
  completion: number;
};

type LanguageStats = {
  code: string;
  name: string;
  nativeName: string;
  total: number;
  translated: number;
  missing: number;
  completion: number;
};

export const TranslationStats = () => {
  const { t, getTranslations } = useTranslations();
  const { supportedLanguages, currentLanguage } = useLanguage();
  
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'languages' | 'namespaces'>('languages');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentLanguage);
  const [namespaceStats, setNamespaceStats] = useState<NamespaceStats[]>([]);
  const [languageStats, setLanguageStats] = useState<LanguageStats[]>([]);
  const [overallCompletion, setOverallCompletion] = useState(0);
  
  // Load translation statistics
  useEffect(() => {
    loadStats();
  }, []);

  // Load stats when language changes in namespace view
  useEffect(() => {
    if (viewMode === 'namespaces') {
      loadNamespaceStats(selectedLanguage);
    }
  }, [selectedLanguage]);
  
  const loadStats = async () => {
    setIsLoading(true);
    
    try {
      // Load language stats first (for all languages)
      await loadLanguageStats();
      
      // Load namespace stats for current language
      await loadNamespaceStats(currentLanguage);
      
      setSelectedLanguage(currentLanguage);
    } catch (error) {
      console.error('Error loading translation stats:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadLanguageStats = async () => {
    const languageStatsResults: LanguageStats[] = [];
    let totalTranslated = 0;
    let totalCount = 0;

    // For each language, check all namespaces
    for (const language of supportedLanguages) {
      let langTotal = 0;
      let langTranslated = 0;
      
      // For each namespace, get translations
      for (const namespace of NAMESPACES) {
        const result = await getTranslations(language.code, namespace);
        
        if (result.success && Array.isArray(result.data)) {
          const translations = result.data;
          const total = translations.length;
          const translated = translations.filter(t => t.value && t.value.trim() !== '').length;

          langTotal += total;
          langTranslated += translated;
          
          totalCount += total;
          totalTranslated += translated;
        }
      }
      
      const langMissing = langTotal - langTranslated;
      const langCompletion = langTotal > 0 ? Math.round((langTranslated / langTotal) * 100) : 0;
      
      languageStatsResults.push({
        code: language.code,
        name: language.name,
        nativeName: language.nativeName,
        total: langTotal,
        translated: langTranslated,
        missing: langMissing,
        completion: langCompletion
      });
    }
    
    // Sort by completion (descending)
    languageStatsResults.sort((a, b) => b.completion - a.completion);
    
    // Calculate overall completion
    const overallCompletionValue = totalCount > 0 ? Math.round((totalTranslated / totalCount) * 100) : 0;
    
    setLanguageStats(languageStatsResults);
    setOverallCompletion(overallCompletionValue);
  };
  
  const loadNamespaceStats = async (languageCode: string) => {
    const namespaceStatsResults: NamespaceStats[] = [];
    
    // For each namespace, get translations for the selected language
    for (const namespace of NAMESPACES) {
      const result = await getTranslations(languageCode, namespace);
      
      if (result.success && Array.isArray(result.data)) {
        const translations = result.data;
        const total = translations.length;
        const translated = translations.filter(t => t.value && t.value.trim() !== '').length;
        const missing = total - translated;
        const completion = total > 0 ? Math.round((translated / total) * 100) : 0;
        
        namespaceStatsResults.push({
          namespace,
          total,
          translated,
          missing,
          completion
        });
      }
    }
    
    // Sort by completion (descending)
    namespaceStatsResults.sort((a, b) => b.completion - a.completion);
    
    setNamespaceStats(namespaceStatsResults);
  };
  
  // Color generator based on completion percentage
  const getCompletionColor = (completion: number) => {
    if (completion >= 90) return 'bg-green-500';
    if (completion >= 70) return 'bg-green-400';
    if (completion >= 50) return 'bg-yellow-400';
    if (completion >= 30) return 'bg-orange-400';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Overall stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-medium">{t('admin:translationCompletionOverall')}</h3>
            <div className="flex justify-center items-center mt-2">
              <div className="text-3xl font-bold">{overallCompletion}%</div>
            </div>
          </div>
          
          <Progress value={overallCompletion} className="h-3" />
          
          <div className="flex justify-between text-sm mt-2">
            <span>{t('admin:notStarted')}</span>
            <span>{t('admin:complete')}</span>
          </div>
        </CardContent>
      </Card>
      
      {/* View selection tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'languages' | 'namespaces')}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="languages" className="flex items-center gap-1">
              <Grid className="h-4 w-4" />
              {t('admin:byLanguage')}
            </TabsTrigger>
            <TabsTrigger value="namespaces" className="flex items-center gap-1">
              <BarChart className="h-4 w-4" />
              {t('admin:byNamespace')}
            </TabsTrigger>
          </TabsList>
          
          {viewMode === 'namespaces' && (
            <div className="flex items-center gap-2">
              <Label htmlFor="lang-select" className="text-sm">
                {t('admin:selectLanguage')}:
              </Label>
              <Select 
                value={selectedLanguage} 
                onValueChange={setSelectedLanguage}
              >
                <SelectTrigger id="lang-select" className="w-[180px]">
                  <SelectValue />
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
          )}
        </div>
        
        {/* Language stats view */}
        <TabsContent value="languages" className="mt-0">
          <div className="grid gap-4">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-gray-100 h-12 animate-pulse rounded"></div>
                ))}
              </div>
            ) : (
              languageStats.map(stat => (
                <div key={stat.code} className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {stat.nativeName} 
                      </span>
                      <span className="text-sm text-gray-500">
                        ({stat.code})
                      </span>
                    </div>
                    <span className="text-sm">
                      {stat.translated}/{stat.total} ({stat.completion}%)
                    </span>
                  </div>
                  
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <div 
                        style={{ width: `${stat.completion}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getCompletionColor(stat.completion)}`}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
        
        {/* Namespace stats view */}
        <TabsContent value="namespaces" className="mt-0">
          <div className="grid gap-4">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-gray-100 h-12 animate-pulse rounded"></div>
                ))}
              </div>
            ) : (
              namespaceStats.map(stat => (
                <div key={stat.namespace} className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {stat.namespace}
                      </span>
                    </div>
                    <span className="text-sm">
                      {stat.translated}/{stat.total} ({stat.completion}%)
                    </span>
                  </div>
                  
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <div 
                        style={{ width: `${stat.completion}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getCompletionColor(stat.completion)}`}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
