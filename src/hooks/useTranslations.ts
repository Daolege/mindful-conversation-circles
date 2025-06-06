
import { useTranslation } from 'react-i18next';
import { 
  selectFromTable, 
  insertIntoTable, 
  callRpcFunction,
  updateTable
} from '@/lib/services/typeSafeSupabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationItem } from '@/lib/services/language/languageCore';
import { batchUpdateTranslations } from '@/lib/services/language/translationBatchService';

export const useTranslations = () => {
  const { t: originalT, i18n } = useTranslation(['common', 'navigation', 'courses', 'auth', 'admin', 'checkout', 'dashboard', 'errors', 'orders', 'actions', 'home']);
  const { isRTL } = useLanguage();
  
  // Wrapper for t function to ensure string return type
  const t = (key: string, options?: any): string => {
    const translated = originalT(key, options);
    
    // Ensure we always return a string
    if (typeof translated === 'string') {
      return translated;
    }
    
    // If it's not a string (e.g., it's an object), return the key as fallback
    if (key.includes(':')) {
      const keyWithoutNamespace = key.split(':')[1];
      return keyWithoutNamespace || key;
    }
    
    return key;
  };
  
  // Helper function to check if an object is a valid translation record
  const isValidTranslationRecord = (item: any): item is { id: number } => {
    return item !== null && 
           typeof item === 'object' && 
           'id' in item && 
           typeof item.id === 'number';
  };
  
  // 更新或添加单个翻译项
  const updateTranslation = async (
    language: string, 
    namespace: string, 
    key: string, 
    value: string
  ) => {
    try {
      // 检查翻译是否存在
      const { data: existingTranslation, error: selectError } = await selectFromTable(
        'translations',
        'id',
        { language_code: language, namespace, key }
      );
      
      if (selectError) throw selectError;

      // Early return pattern for better readability
      // If no data returned or empty array, insert new translation
      if (!existingTranslation || 
          !Array.isArray(existingTranslation) || 
          existingTranslation.length === 0) {
        
        return await insertNewTranslation(language, namespace, key, value);
      }
      
      // Get the first item from the array
      const translationData = existingTranslation[0];
      
      // If the translation data is invalid or null, insert new translation
      if (!translationData || !isValidTranslationRecord(translationData)) {
        return await insertNewTranslation(language, namespace, key, value);
      }
      
      // At this point, we know translationData is valid and has an ID
      const translationId = translationData.id;
      
      // Update the existing translation
      const { error: updateError } = await updateTable(
        'translations',
        { value, updated_at: new Date().toISOString() },
        { id: translationId }
      );
      
      if (updateError) throw updateError;
      
      // Reload the translations for this namespace
      await i18n.reloadResources([language], [namespace]);
      
      return { success: true };
      
    } catch (error) {
      console.error('Error updating translation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };
  
  // Helper function to insert a new translation
  const insertNewTranslation = async (
    language: string,
    namespace: string,
    key: string,
    value: string
  ) => {
    try {
      const { error: insertError } = await insertIntoTable(
        'translations',
        {
          language_code: language,
          namespace,
          key,
          value,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
      
      if (insertError) throw insertError;
      
      // Reload the translations for this namespace
      await i18n.reloadResources([language], [namespace]);
      
      return { success: true };
    } catch (error) {
      console.error('Error inserting translation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  // Type guard for translation item
  const isValidTranslation = (item: any): item is TranslationItem => {
    if (item === null) {
      return false;
    }
    
    if (typeof item !== 'object') {
      return false;
    }
    
    return (
      'language_code' in item && 
      item.language_code !== null &&
      'namespace' in item && 
      item.namespace !== null &&
      'key' in item && 
      item.key !== null &&
      'value' in item && 
      item.value !== null
    );
  };

  // 获取指定语言和命名空间的所有翻译
  const getTranslations = async (language: string, namespace: string) => {
    try {
      const { data, error } = await selectFromTable(
        'translations',
        'id, language_code, namespace, key, value',
        { language_code: language, namespace }
      );
        
      if (error) throw error;
      
      // Ensure we return a valid array of TranslationItem objects
      const validItems = Array.isArray(data) 
        ? data.filter(item => isValidTranslation(item))
        : [];
      
      // We've filtered out null items, safe to type assert now
      const translations = validItems as TranslationItem[];
      
      return { 
        success: true, 
        data: translations
      };
    } catch (error) {
      console.error('Error fetching translations:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [] as TranslationItem[]
      };
    }
  };
  
  // 刷新当前语言的所有翻译
  const refreshTranslations = async () => {
    try {
      const currentLang = i18n.language;
      const namespaces = i18n.options.ns as string[];
      
      await i18n.reloadResources([currentLang], namespaces);
      
      return { success: true };
    } catch (error) {
      console.error('Error refreshing translations:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };
  
  // 批量导入翻译
  const importTranslations = async (translations: TranslationItem[]) => {
    try {
      // Use our type-safe RPC function call
      const { error } = await callRpcFunction(
        'upsert_translations_batch', 
        { translations_json: translations }
      );
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error importing translations:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };
  
  // 批量更新翻译
  const batchUpdate = async (translations: TranslationItem[]) => {
    try {
      const result = await batchUpdateTranslations(translations);
      return result;
    } catch (error) {
      console.error('Error batch updating translations:', error);
      return {
        success: false,
        count: 0,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  };
  
  return {
    t,
    i18n,
    currentLanguage: i18n.language,
    changeLanguage: (lang: string) => i18n.changeLanguage(lang),
    isRTL,
    updateTranslation,
    getTranslations,
    refreshTranslations,
    importTranslations,
    batchUpdate
  };
};
