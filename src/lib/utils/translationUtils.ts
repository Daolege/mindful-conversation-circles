
import { TranslationItem } from '@/lib/services/language/languageCore';
import { saveAs } from 'file-saver';

/**
 * Export translations to a JSON file
 */
export const exportTranslationsToJson = (
  translations: TranslationItem[], 
  language: string
) => {
  // Group translations by namespace
  const groupedByNamespace: Record<string, Record<string, string>> = {};
  
  translations.forEach(item => {
    if (!groupedByNamespace[item.namespace]) {
      groupedByNamespace[item.namespace] = {};
    }
    
    groupedByNamespace[item.namespace][item.key] = item.value;
  });
  
  const jsonStr = JSON.stringify(groupedByNamespace, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  
  const filename = `translations_${language}_${new Date().toISOString().slice(0, 10)}.json`;
  saveAs(blob, filename);
};

/**
 * Import translations from a file
 */
export const importTranslationsFromFile = async (
  file: File,
  language: string
): Promise<{ 
  success: boolean; 
  translations?: TranslationItem[]; 
  error?: string 
}> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          resolve({
            success: false,
            error: 'Failed to read file'
          });
          return;
        }
        
        const content = event.target.result as string;
        const parsed = JSON.parse(content);
        
        if (typeof parsed !== 'object' || parsed === null) {
          resolve({
            success: false,
            error: 'Invalid JSON format: expected an object'
          });
          return;
        }
        
        const translations: TranslationItem[] = [];
        
        // Format: { namespace: { key: "value" } }
        Object.keys(parsed).forEach(namespace => {
          const nsContent = parsed[namespace];
          
          if (typeof nsContent === 'object' && nsContent !== null) {
            Object.keys(nsContent).forEach(key => {
              const value = nsContent[key];
              
              if (typeof value === 'string') {
                translations.push({
                  language_code: language,
                  namespace,
                  key,
                  value
                });
              }
            });
          }
        });
        
        if (translations.length === 0) {
          resolve({
            success: false,
            error: 'No valid translations found in the file'
          });
          return;
        }
        
        resolve({
          success: true,
          translations
        });
        
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to parse JSON file'
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Failed to read file'
      });
    };
    
    reader.readAsText(file);
  });
};
