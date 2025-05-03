
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
  const { t, i18n } = useTranslation(['common', 'navigation', 'courses', 'auth', 'admin', 'checkout', 'dashboard', 'errors', 'orders', 'actions', 'home']);
  const { isRTL } = useLanguage();
  
  // 更新或添加单个翻译项
  const updateTranslation = async (
    language: string, 
    namespace: string, 
    key: string, 
    value: string
  ) => {
    try {
      // 检查翻译是否存在
      const { data: existingTranslation, error: selectError } = await selectFromTable<{ id: number }>(
        'translations',
        'id',
        { language_code: language, namespace, key }
      );
      
      if (selectError) throw selectError;
      
      if (existingTranslation && existingTranslation.length > 0 && existingTranslation[0].id) {
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
      const { data, error } = await selectFromTable<TranslationItem>(
        'translations',
        'id, language_code, namespace, key, value',
        { language_code: language, namespace }
      );
        
      if (error) throw error;
      
      return { 
        success: true, 
        data: data || []
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
  
  // Helper function to translate with fallback
  const translate = (key: string, options?: any) => {
    const result = t(key, options);
    // If translation is missing (returns the key), try with a fallback 
    if (result === key && key.includes(':')) {
      const keyWithoutNamespace = key.split(':')[1];
      return t(keyWithoutNamespace, options) || key;
    }
    return result;
  };
  
  return {
    t: translate,
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
