
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { TranslationItem } from '@/lib/services/languageService';

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
      // 检查翻译是否存在，由于类型系统限制，我们使用原始SQL查询
      const { data: existingTranslation, error: selectError } = await supabase
        .from('translations')
        .select('*')
        .eq('language_code', language)
        .eq('namespace', namespace)
        .eq('key', key)
        .maybeSingle();
      
      if (selectError) throw selectError;
      
      if (existingTranslation) {
        // 更新已有翻译
        const { error: updateError } = await supabase
          .rpc('update_translation', {
            p_id: existingTranslation.id,
            p_value: value,
            p_updated_at: new Date().toISOString()
          });
          
        if (updateError) throw updateError;
      } else {
        // 添加新翻译，使用RPC调用避免类型问题
        const { error: insertError } = await supabase
          .rpc('insert_translation', {
            p_language_code: language,
            p_namespace: namespace,
            p_key: key,
            p_value: value,
            p_created_at: new Date().toISOString()
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
      // 使用原始SQL查询来避免类型问题
      const { data, error } = await supabase
        .rpc('get_translations', {
          p_language_code: language,
          p_namespace: namespace
        });
        
      if (error) throw error;
      
      return { 
        success: true, 
        data: data as TranslationItem[] || []
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
