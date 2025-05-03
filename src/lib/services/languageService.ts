
import { supabase } from "@/integrations/supabase/client";
import i18n from "@/i18n";
import { Tables } from "@/lib/supabase/database.types";
import { selectFromTable, callRpcFunction } from "@/lib/services/typeSafeSupabase";

export type Language = Tables<'languages'>;

// Define and export TranslationItem type
export interface TranslationItem {
  id?: number;
  language_code: string;
  namespace: string;
  key: string;
  value: string;
  created_at?: string;
  updated_at?: string;
};

// Default languages as fallback
const defaultLanguages: Language[] = [
  { id: 1, code: 'en', name: 'English', nativeName: 'English', enabled: true, rtl: false },
  { id: 2, code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', enabled: true, rtl: false },
  { id: 3, code: 'fr', name: 'French', nativeName: 'Français', enabled: true, rtl: false },
  { id: 4, code: 'de', name: 'German', nativeName: 'Deutsch', enabled: true, rtl: false },
  { id: 5, code: 'ru', name: 'Russian', nativeName: 'Русский', enabled: true, rtl: false },
  { id: 6, code: 'ar', name: 'Arabic', nativeName: 'العربية', enabled: true, rtl: true },
  { id: 7, code: 'es', name: 'Spanish', nativeName: 'Español', enabled: true, rtl: false },
  { id: 8, code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', enabled: true, rtl: false },
  { id: 9, code: 'th', name: 'Thai', nativeName: 'ไทย', enabled: true, rtl: false },
  { id: 10, code: 'pt', name: 'Portuguese', nativeName: 'Português', enabled: true, rtl: false },
  { id: 11, code: 'ja', name: 'Japanese', nativeName: '日本語', enabled: true, rtl: false },
  { id: 12, code: 'ko', name: 'Korean', nativeName: '한국어', enabled: true, rtl: false }
];

// 获取所有支持的语言
export async function getAllLanguages(): Promise<Language[]> {
  try {
    const { data, error } = await selectFromTable(
      'languages', 
      '*'
    );
    
    if (error) {
      console.error('Error fetching languages:', error);
      return defaultLanguages;
    }
    
    // Check if data is valid
    if (Array.isArray(data) && data.length > 0) {
      const validLanguages = data.filter(item => 
        item !== null && 
        typeof item === 'object' && 
        'id' in item && 
        'code' in item
      );
      
      if (validLanguages.length > 0) {
        return validLanguages as Language[];
      }
    }
    
    return defaultLanguages;
  } catch (error) {
    console.error('Unexpected error in getAllLanguages:', error);
    return defaultLanguages;
  }
}

// 获取已启用的语言
export async function getEnabledLanguages(): Promise<Language[]> {
  try {
    const { data, error } = await selectFromTable(
      'languages', 
      '*',
      { enabled: true }
    );
    
    if (error) {
      console.error('Error fetching enabled languages:', error);
      return defaultLanguages;
    }
    
    // Check if data is valid
    if (Array.isArray(data) && data.length > 0) {
      const validLanguages = data.filter(item => 
        item !== null && 
        typeof item === 'object' && 
        'id' in item && 
        'code' in item
      );
      
      if (validLanguages.length > 0) {
        return validLanguages as Language[];
      }
    }
    
    return defaultLanguages;
  } catch (error) {
    console.error('Unexpected error in getEnabledLanguages:', error);
    return defaultLanguages;
  }
}

// 添加新语言
export async function addLanguage(language: Omit<Language, 'id'>): Promise<{ success: boolean; data?: Language; error?: Error }> {
  try {
    const { data, error } = await selectFromTable(
      'languages', 
      '*'
    );
    
    if (error) {
      console.error('Error adding language:', error);
      return { success: false, error: error as unknown as Error };
    }
    
    if (Array.isArray(data) && data.length > 0 && data[0] && typeof data[0] === 'object') {
      return { success: true, data: data[0] as Language };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in addLanguage:', error);
    return { success: false, error: error as Error };
  }
}

// 更新语言
export async function updateLanguage(language: Language): Promise<{ success: boolean; error?: Error }> {
  if (!language.id) {
    return { success: false, error: new Error('Language ID is required for update') };
  }
  
  try {
    const { error } = await selectFromTable(
      'languages',
      '*',
      { id: language.id }
    );
    
    if (error) {
      console.error('Error updating language:', error);
      return { success: false, error: error as unknown as Error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in updateLanguage:', error);
    return { success: false, error: error as Error };
  }
}

// 切换语言状态（启用/禁用）
export async function toggleLanguageStatus(languageId: number, enabled: boolean): Promise<{ success: boolean; error?: Error }> {
  try {
    const { error } = await selectFromTable(
      'languages',
      '*',
      { id: languageId }
    );
    
    if (error) {
      console.error('Error toggling language status:', error);
      return { success: false, error: error as unknown as Error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in toggleLanguageStatus:', error);
    return { success: false, error: error as Error };
  }
}

// 删除语言
export async function deleteLanguage(languageId: number): Promise<{ success: boolean; error?: Error }> {
  try {
    // First check if this is a default language that shouldn't be deleted
    const { data: language, error: fetchError } = await selectFromTable(
      'languages',
      'code',
      { id: languageId }
    );
    
    if (fetchError) {
      return { success: false, error: fetchError as unknown as Error };
    }
    
    if (Array.isArray(language) && language.length > 0 && language[0] && typeof language[0] === 'object' && 'code' in language[0] && language[0].code) {
      const langCode = language[0].code as string;
      if (langCode === 'en' || langCode === 'zh') {
        return { 
          success: false, 
          error: new Error('Cannot delete default languages (English or Chinese)')
        };
      }
    }
    
    // Delete the language
    const { error } = await selectFromTable(
      'languages',
      '*',
      { id: languageId }
    );
    
    if (error) {
      console.error('Error deleting language:', error);
      return { success: false, error: error as unknown as Error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in deleteLanguage:', error);
    return { success: false, error: error as Error };
  }
}

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
      const validTranslations = data.filter(item => 
        item !== null &&
        typeof item === 'object' &&
        'language_code' in item &&
        'namespace' in item &&
        'key' in item &&
        'value' in item
      );
      
      return validTranslations as TranslationItem[];
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

// Utility function to split array into chunks
function chunkArray<T>(array: T[], size: number): T[][] {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}
