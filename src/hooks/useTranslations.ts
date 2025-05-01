
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { TranslationItem } from '@/lib/services/languageService';

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
        .rpc('check_translation_exists', {
          p_language_code: language,
          p_namespace: namespace,
          p_key: key
        }) as { data: ExistingTranslation | null, error: any };
      
      if (selectError) throw selectError;
      
      if (existingTranslation && existingTranslation.id) {
        // 更新已有翻译
        const { error: updateError } = await supabase
          .rpc('update_translation', {
            p_id: existingTranslation.id,
            p_value: value
          });
          
        if (updateError) throw updateError;
      } else {
        // 添加新翻译
        const { error: insertError } = await supabase
          .rpc('insert_translation', {
            p_language_code: language,
            p_namespace: namespace,
            p_key: key,
            p_value: value
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
        .rpc('get_translations', {
          p_language_code: language,
          p_namespace: namespace
        }) as { data: TranslationItem[], error: any };
        
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
