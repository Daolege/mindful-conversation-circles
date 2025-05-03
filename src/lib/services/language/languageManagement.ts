
import { selectFromTable } from "@/lib/services/typeSafeSupabase";
import { Language, defaultLanguages } from "./languageCore";

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
      const validLanguages = data.filter((item): item is NonNullable<typeof item> => 
        item !== null && 
        typeof item === 'object' && 
        'id' in item && 
        'code' in item
      );
      
      if (validLanguages.length > 0) {
        return validLanguages as unknown as Language[];
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
      const validLanguages = data.filter((item): item is NonNullable<typeof item> => 
        item !== null && 
        typeof item === 'object' && 
        'id' in item && 
        'code' in item
      );
      
      if (validLanguages.length > 0) {
        return validLanguages as unknown as Language[];
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
    
    if (Array.isArray(language) && language.length > 0 && language[0] !== null && 
        typeof language[0] === 'object' && 'code' in language[0] && language[0]?.code !== null) {
      const langCode = language[0]?.code as string | null;
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
