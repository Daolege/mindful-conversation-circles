
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from '@/hooks/useTranslations';
import { TranslationItem } from '@/lib/services/language/languageCore';
import { AlertTriangle, Check, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { batchUpdateTranslations } from '@/lib/services/language/translationBatchService';

interface TranslationConsistencyCheckerProps {
  languageCode: string;
  translations: TranslationItem[];
  onFixApplied: () => void;
}

interface ConsistencyIssue {
  type: 'inconsistency' | 'emptyTranslation' | 'formatError' | 'lengthWarning';
  sourceKey: string;
  sourceValue: string;
  targetKeys: {key: string, value: string, id: number}[];
  severity: 'low' | 'medium' | 'high';
  suggestedFix?: string;
}

export function TranslationConsistencyChecker({
  languageCode,
  translations,
  onFixApplied
}: TranslationConsistencyCheckerProps) {
  const { t } = useTranslations();
  const [issues, setIssues] = useState<ConsistencyIssue[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter issues based on active tab
  const filteredIssues = issues.filter(issue => {
    if (activeTab === 'all') return true;
    return issue.type === activeTab;
  });
  
  const runConsistencyCheck = () => {
    setAnalyzing(true);
    setTimeout(() => {
      try {
        // Find translation inconsistencies
        const sourceValues = new Map<string, {key: string, value: string}[]>();
        
        // Group translations by their values (normalized)
        translations.forEach(translation => {
          if (!translation.value || translation.value.trim() === '') return;
          
          // Normalize value for comparison (trim, lowercase)
          const normalizedValue = translation.value.trim().toLowerCase();
          
          if (!sourceValues.has(normalizedValue)) {
            sourceValues.set(normalizedValue, []);
          }
          
          sourceValues.get(normalizedValue)?.push({
            key: translation.key,
            value: translation.value
          });
        });
        
        // Find source keys that appear in multiple places with different translations
        const sourceKeyMap = new Map<string, {value: string, keys: string[]}[]>();
        
        translations.forEach(translation => {
          const keyParts = translation.key.split('.');
          const baseKey = keyParts[keyParts.length - 1]; // Last part of the key
          
          if (!sourceKeyMap.has(baseKey)) {
            sourceKeyMap.set(baseKey, []);
          }
          
          const existingGroup = sourceKeyMap.get(baseKey)?.find(g => 
            g.value.toLowerCase() === translation.value.toLowerCase()
          );
          
          if (existingGroup) {
            existingGroup.keys.push(translation.key);
          } else {
            sourceKeyMap.get(baseKey)?.push({
              value: translation.value || '',
              keys: [translation.key]
            });
          }
        });
        
        // Build inconsistency issues
        const detectedIssues: ConsistencyIssue[] = [];
        
        // Check for source key inconsistencies
        sourceKeyMap.forEach((valueGroups, baseKey) => {
          // If a base key has multiple different translations, flag as inconsistency
          if (valueGroups.length > 1) {
            // More than one distinct translation for the same base key
            const mainGroup = valueGroups.reduce((prev, curr) => 
              prev.keys.length > curr.keys.length ? prev : curr
            );
            
            const otherGroups = valueGroups.filter(g => g !== mainGroup);
            
            otherGroups.forEach(group => {
              detectedIssues.push({
                type: 'inconsistency',
                sourceKey: baseKey,
                sourceValue: mainGroup.value,
                targetKeys: group.keys.map(key => {
                  const translation = translations.find(t => t.key === key);
                  return {
                    key,
                    value: translation?.value || '',
                    id: translation?.id || 0
                  }
                }),
                severity: 'medium',
                suggestedFix: mainGroup.value
              });
            });
          }
        });
        
        // Check for empty translations
        const emptyTranslations = translations.filter(t => !t.value || t.value.trim() === '');
        
        if (emptyTranslations.length > 0) {
          // Group by namespace for better organization
          const emptyByNamespace = new Map<string, TranslationItem[]>();
          
          emptyTranslations.forEach(translation => {
            if (!emptyByNamespace.has(translation.namespace)) {
              emptyByNamespace.set(translation.namespace, []);
            }
            emptyByNamespace.get(translation.namespace)?.push(translation);
          });
          
          emptyByNamespace.forEach((items, namespace) => {
            detectedIssues.push({
              type: 'emptyTranslation',
              sourceKey: namespace,
              sourceValue: '',
              targetKeys: items.map(item => ({
                key: item.key,
                value: '',
                id: item.id || 0
              })),
              severity: 'high'
            });
          });
        }
        
        // Check for format errors (e.g., missing variables)
        const formatIssues = translations.filter(t => {
          if (!t.value) return false;
          
          // Check for mismatched variable patterns like {{variable}}
          const sourceVarMatches = t.key.match(/\{\{(\w+)\}\}/g);
          const targetVarMatches = t.value.match(/\{\{(\w+)\}\}/g);
          
          if (sourceVarMatches && (!targetVarMatches || sourceVarMatches.length !== targetVarMatches.length)) {
            return true;
          }
          
          return false;
        });
        
        if (formatIssues.length > 0) {
          formatIssues.forEach(translation => {
            detectedIssues.push({
              type: 'formatError',
              sourceKey: translation.key,
              sourceValue: translation.value,
              targetKeys: [{
                key: translation.key,
                value: translation.value,
                id: translation.id || 0
              }],
              severity: 'high'
            });
          });
        }
        
        setIssues(detectedIssues);
      } catch (error) {
        console.error('Error during consistency check:', error);
        toast.error(t('admin:consistencyCheckError'));
      } finally {
        setAnalyzing(false);
      }
    }, 500);
  };
  
  const applyFix = async (issue: ConsistencyIssue) => {
    if (!issue.suggestedFix) return;
    
    try {
      const updatedTranslations = issue.targetKeys.map(target => ({
        id: target.id,
        language_code: languageCode,
        namespace: target.key.includes(':') ? target.key.split(':')[0] : '',
        key: target.key.includes(':') ? target.key.split(':')[1] : target.key,
        value: issue.suggestedFix || ''
      }));
      
      const result = await batchUpdateTranslations(updatedTranslations);
      
      if (result.success) {
        toast.success(t('admin:consistencyFixApplied'));
        // Remove fixed issue from list
        setIssues(prev => prev.filter(i => i !== issue));
        onFixApplied();
      } else {
        throw new Error(result.error?.message);
      }
    } catch (error) {
      console.error('Error applying fix:', error);
      toast.error(t('admin:consistencyFixError'));
    }
  };
  
  useEffect(() => {
    // Run consistency check when translations change
    if (translations.length > 0) {
      runConsistencyCheck();
    }
  }, [translations]);
  
  if (translations.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6 text-center text-muted-foreground">
          {t('admin:noTranslationsToCheck')}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
          {t('admin:consistencyChecker')}
          {issues.length > 0 && (
            <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700">
              {issues.length} {t('admin:issuesFound')}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {t('admin:consistencyCheckerDescription')}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <Button 
            onClick={runConsistencyCheck}
            disabled={analyzing}
            variant="outline"
            size="sm"
          >
            {analyzing ? t('admin:analyzing') : t('admin:runConsistencyCheck')}
          </Button>
        </div>
        
        {issues.length > 0 ? (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">
                  {t('admin:allIssues')} ({issues.length})
                </TabsTrigger>
                <TabsTrigger value="inconsistency">
                  {t('admin:inconsistencies')} ({issues.filter(i => i.type === 'inconsistency').length})
                </TabsTrigger>
                <TabsTrigger value="emptyTranslation">
                  {t('admin:missing')} ({issues.filter(i => i.type === 'emptyTranslation').length})
                </TabsTrigger>
                <TabsTrigger value="formatError">
                  {t('admin:formatErrors')} ({issues.filter(i => i.type === 'formatError').length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab}>
                <ScrollArea className="h-[300px] mt-2">
                  <div className="space-y-3">
                    {filteredIssues.map((issue, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex justify-between mb-2">
                          <Badge variant={
                            issue.severity === 'high' ? 'destructive' : 
                            issue.severity === 'medium' ? 'default' : 
                            'outline'
                          }>
                            {issue.type === 'inconsistency' && t('admin:inconsistentTranslation')}
                            {issue.type === 'emptyTranslation' && t('admin:missingTranslations')}
                            {issue.type === 'formatError' && t('admin:formatError')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {t('admin:affectedKeys', { count: issue.targetKeys.length })}
                          </span>
                        </div>
                        
                        {issue.type !== 'emptyTranslation' && (
                          <>
                            <div className="mb-2">
                              <div className="text-xs font-medium mb-1 text-gray-500">
                                {t('admin:sourceKey')}: <span className="font-mono">{issue.sourceKey}</span>
                              </div>
                              {issue.sourceValue && (
                                <div className="text-xs font-medium mb-1 text-gray-500">
                                  {t('admin:correctValue')}: <span className="font-mono bg-green-50 px-1 py-0.5 rounded">{issue.sourceValue}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-1 mb-2">
                              {issue.targetKeys.slice(0, 3).map((target, i) => (
                                <div key={i} className="p-1 bg-gray-50 rounded text-xs">
                                  <span className="font-mono">{target.key}</span>: 
                                  <span className="font-mono ml-1 bg-red-50 px-1 py-0.5 rounded">{target.value || '(empty)'}</span>
                                </div>
                              ))}
                              {issue.targetKeys.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  {t('admin:moreItems', { count: issue.targetKeys.length - 3 })}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                        
                        <div className="flex justify-end">
                          {issue.type === 'inconsistency' && issue.suggestedFix && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-xs" 
                              onClick={() => applyFix(issue)}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              {t('admin:fixInconsistency')}
                            </Button>
                          )}
                          
                          {issue.type === 'emptyTranslation' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => {
                                // Filter translations for this namespace and scroll to them
                                setActiveTab('all');
                              }}
                            >
                              <Lightbulb className="h-3 w-3 mr-1" />
                              {t('admin:viewMissing')}
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                    
                    {filteredIssues.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        {t('admin:noMatchingIssues')}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </>
        ) : analyzing ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-r-transparent mx-auto mb-2"></div>
            <p className="text-muted-foreground">{t('admin:analyzingTranslations')}</p>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-muted-foreground">{t('admin:noIssuesFound')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
