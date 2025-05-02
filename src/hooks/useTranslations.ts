
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { TranslationItem } from '@/lib/services/languageService';
import { Database } from '@/lib/supabase/types';

// Define type for the result of a translation check
interface ExistingTranslation {
  id: number;
}

export const useTranslations = () => {
  const { t, i18n } = useTranslation(['common', 'navigation', 'courses', 'auth', 'admin', 'checkout', 'dashboard', 'errors', 'orders']);
  
  // 更新或添加单个翻译项
  const updateTranslation = async (
    language: string, 
    namespace: string, 
    key: string, 
    value: string
  ) => {
    try {
      // 检查翻译是否存在
      const { data: existingTranslation, error: selectError } = await supabase
        .from('translations')
        .select('id')
        .eq('language_code', language)
        .eq('namespace', namespace)
        .eq('key', key)
        .maybeSingle() as { 
          data: ExistingTranslation | null; 
          error: any;
        };
      
      if (selectError) throw selectError;
      
      if (existingTranslation && existingTranslation.id) {
        // 更新已有翻译
        const { error: updateError } = await supabase
          .from('translations')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('id', existingTranslation.id);
          
        if (updateError) throw updateError;
      } else {
        // 添加新翻译
        const { error: insertError } = await supabase
          .from('translations')
          .insert({
            language_code: language,
            namespace,
            key,
            value
          });
          
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
      const { data, error } = await supabase
        .from('translations')
        .select('id, language_code, namespace, key, value')
        .eq('language_code', language)
        .eq('namespace', namespace) as {
          data: TranslationItem[];
          error: any;
        };
        
      if (error) throw error;
      
      // Convert the data to match TranslationItem format
      const translations: TranslationItem[] = data || [];
      
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
  
  return {
    t,
    i18n,
    currentLanguage: i18n.language,
    changeLanguage: (lang: string) => i18n.changeLanguage(lang),
    isRTL: i18n.dir() === 'rtl',
    updateTranslation,
    getTranslations,
    refreshTranslations
  };
};
