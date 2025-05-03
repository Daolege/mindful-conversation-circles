
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TranslationItem } from '@/lib/services/language/languageCore';
import { Badge } from "@/components/ui/badge";
import { useTranslations } from '@/hooks/useTranslations';
import { Lightbulb, Check, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TranslationSuggestionsProps {
  currentKey: string;
  currentValue: string;
  languageCode: string;
  namespace: string;
  allTranslations: TranslationItem[];
  onApplySuggestion: (suggestion: string) => void;
}

export function TranslationSuggestions({
  currentKey,
  currentValue,
  languageCode,
  namespace,
  allTranslations,
  onApplySuggestion
}: TranslationSuggestionsProps) {
  const { t } = useTranslations();
  const [suggestions, setSuggestions] = useState<{text: string, confidence: number, source: string}[]>([]);
  
  // Get suggestions based on available translations
  useEffect(() => {
    const findSuggestions = () => {
      // Reset suggestions
      const newSuggestions: {text: string, confidence: number, source: string}[] = [];
      
      // Skip generating suggestions if we already have a value
      if (currentValue && currentValue.trim() !== '') return;
      
      // Find similar keys
      const keyParts = currentKey.split('.');
      const lastKeyPart = keyParts[keyParts.length - 1];
      
      // 1. Look for exact same key in other namespaces
      const exactKeyMatches = allTranslations.filter(t => 
        t.key === currentKey && 
        t.namespace !== namespace && 
        t.language_code === languageCode && 
        t.value && t.value.trim() !== ''
      );
      
      exactKeyMatches.forEach(match => {
        newSuggestions.push({
          text: match.value,
          confidence: 0.9,
          source: `${match.namespace}:${match.key}`
        });
      });
      
      // 2. Look for keys ending with same word/phrase
      const similarKeyMatches = allTranslations.filter(t => 
        t.key !== currentKey &&
        t.key.endsWith(lastKeyPart) && 
        t.language_code === languageCode && 
        t.value && t.value.trim() !== ''
      );
      
      similarKeyMatches.forEach(match => {
        newSuggestions.push({
          text: match.value,
          confidence: 0.7,
          source: `${match.namespace}:${match.key}`
        });
      });
      
      // 3. Look for translations with partial key matches
      if (lastKeyPart.length > 3) {
        const partialKeyMatches = allTranslations.filter(t =>
          t.key !== currentKey &&
          t.key.includes(lastKeyPart) &&
          t.language_code === languageCode &&
          t.value && t.value.trim() !== ''
        );
        
        partialKeyMatches.forEach(match => {
          newSuggestions.push({
            text: match.value,
            confidence: 0.5,
            source: `${match.namespace}:${match.key}`
          });
        });
      }
      
      // Remove duplicates and sort by confidence
      const uniqueSuggestions = newSuggestions
        .filter((suggestion, index, self) =>
          index === self.findIndex((s) => s.text === suggestion.text)
        )
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3); // Get top 3 suggestions
      
      setSuggestions(uniqueSuggestions);
    };
    
    findSuggestions();
  }, [currentKey, currentValue, namespace, languageCode, allTranslations]);
  
  if (suggestions.length === 0) return null;
  
  return (
    <Card className="p-3 mt-3 bg-blue-50 border-blue-200">
      <div className="flex items-center mb-2">
        <Lightbulb className="h-4 w-4 text-blue-600 mr-2" />
        <h4 className="text-sm font-medium text-blue-800">{t('admin:translationSuggestions')}</h4>
      </div>
      
      <ScrollArea className="h-[120px]">
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <div 
              key={index} 
              className="bg-white rounded-md p-2 border border-blue-100 flex flex-col"
            >
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="mb-1 bg-blue-50">
                  {Math.round(suggestion.confidence * 100)}% {t('admin:match')}
                </Badge>
                <div className="text-xs text-gray-500">{suggestion.source}</div>
              </div>
              <p className="text-sm mb-2 overflow-hidden text-ellipsis">{suggestion.text}</p>
              <div className="flex justify-end space-x-2 mt-auto">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onApplySuggestion(suggestion.text)}
                  className="h-7 px-2"
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  {t('admin:applySuggestion')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
