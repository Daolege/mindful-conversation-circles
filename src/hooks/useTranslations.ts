
import { useTranslation } from 'react-i18next';
import { 
  selectFromTable, 
  insertIntoTable, 
  callRpcFunction,
  updateTable
} from '@/lib/services/typeSafeSupabase';
import { useLanguage } from '@/contexts/LanguageContext';

// Define TranslationItem type directly here to avoid circular dependencies
export type TranslationItem = {
  id?: number;
  language_code: string;
  namespace: string;
  key: string;
  value: string;
  created_at?: string;
  updated_at?: string;
};

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
      
      // Check if existingTranslation is array and has valid data
      if (existingTranslation && 
          Array.isArray(existingTranslation) && 
          existingTranslation.length > 0 && 
          typeof existingTranslation[0] === 'object' &&
          existingTranslation[0] !== null &&
          'id' in existingTranslation[0]) {
        
        // 更新已有翻译
        const { error: updateError } = await updateTable(
          'translations',
          { value, updated_at: new Date().toISOString() },
          { id: existingTranslation[0].id }
        );
        
        if (updateError) throw updateError;
      } else {
        // 添加新翻译
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
      }
      
      // 重新加载该命名空间的翻译
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
      const translations: TranslationItem[] = Array.isArray(data) ? 
        data.filter(item => 
          typeof item === 'object' &&
          item !== null &&
          'language_code' in item &&
          'namespace' in item &&
          'key' in item &&
          'value' in item
        ) as TranslationItem[] : [];
      
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
  
  return {
    t,
    i18n,
    currentLanguage: i18n.language,
    changeLanguage: (lang: string) => i18n.changeLanguage(lang),
    isRTL,
    updateTranslation,
    getTranslations,
    refreshTranslations,
    importTranslations
  };
};
