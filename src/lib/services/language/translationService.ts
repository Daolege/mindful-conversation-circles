
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
    
    if (Array.isArray(data)) {
      const validTranslations = data.filter((item): item is NonNullable<typeof item> => {
        // First check if item is null
        if (!item) {
          return false;
        }
        
        // Now that we know item is not null, check its properties
        // Check object type
        if (typeof item !== 'object') {
          return false;
        }
        
        // Check all required properties exist and are not null
        if (!('language_code' in item) || !item.language_code) {
          return false;
        }
        
        if (!('namespace' in item) || !item.namespace) {
          return false;
        }
        
        if (!('key' in item) || !item.key) {
          return false;
        }
        
        if (!('value' in item) || !item.value) {
          return false;
        }
        
        return true;
      });
      
      return validTranslations as unknown as TranslationItem[];
    }
    
    return [];
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
