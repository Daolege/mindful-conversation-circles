
import { callRpcFunction, selectFromTable } from "@/lib/services/typeSafeSupabase";
import i18n from "@/i18n";
import { TranslationItem, chunkArray } from "./languageCore";

// 导入翻译
export async function importTranslations(translations: TranslationItem[]): Promise<{ success: boolean; error?: Error }> {
  try {
    // Use batch inserts with replacements
    for (const batch of chunkArray(translations, 100)) {
      const { error } = await callRpcFunction(
        'upsert_translations_batch', 
        { translations_json: batch }
      );
      
      if (error) {
        console.error('Error importing translations batch:', error);
        return { success: false, error: error as unknown as Error };
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in importTranslations:', error);
    return { success: false, error: error as Error };
  }
}

// 导出翻译
export async function getTranslationsByLanguage(languageCode: string): Promise<TranslationItem[]> {
  try {
    const { data, error } = await selectFromTable(
      'translations',
      '*',
      { language_code: languageCode }
    );
    
    if (error) {
      console.error('Error fetching translations:', error);
      return [];
    }
    
    // Early return if data is not an array or empty
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    
    // Type guard function to check if item is a valid translation
    const isValidTranslation = (item: any): item is TranslationItem => {
      if (item === null || typeof item !== 'object') {
        return false;
      }
      
      return (
        'language_code' in item && 
        typeof item.language_code === 'string' && 
        'namespace' in item && 
        typeof item.namespace === 'string' && 
        'key' in item && 
        typeof item.key === 'string' && 
        'value' in item && 
        typeof item.value === 'string'
      );
    };
    
    // Filter and map valid translations
    const validTranslations = data.filter(isValidTranslation);
    
    return validTranslations;
  } catch (error) {
    console.error('Unexpected error in getTranslationsByLanguage:', error);
    return [];
  }
}

// 重新加载语言资源
export function reloadLanguageResources(callback?: () => void): void {
  try {
    i18n.reloadResources().then(() => {
      if (callback) callback();
    });
  } catch (error) {
    console.error('Error reloading language resources:', error);
  }
}
