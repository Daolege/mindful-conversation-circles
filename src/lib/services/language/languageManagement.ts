
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
      const validLanguages = data.filter((item): item is NonNullable<typeof item> => {
        if (item === null) return false;
        
        // Check each required property
        if (typeof item !== 'object') return false;
        if (!('id' in item)) return false;
        if (!('code' in item)) return false;
        if (item.id === null) return false;
        if (item.code === null) return false;
        
        return true;
      });
      
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
      const validLanguages = data.filter((item): item is NonNullable<typeof item> => {
        if (item === null) return false;
        
        // Check each required property
        if (typeof item !== 'object') return false;
        if (!('id' in item)) return false;
        if (!('code' in item)) return false; 
        if (item.id === null) return false;
        if (item.code === null) return false;
        
        return true;
      });
      
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
    
    if (Array.isArray(data) && data.length > 0 && 
        data[0] !== null && typeof data[0] === 'object') {
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
    
    // Check if language data exists and has a code property
    if (Array.isArray(language) && language.length > 0) {
      const langData = language[0];
      
      if (langData === null) {
        return { success: false, error: new Error('Invalid language data received') };
      }
      
      if (typeof langData !== 'object') {
        return { success: false, error: new Error('Invalid language data type') };
      }
      
      if (!('code' in langData)) {
        return { success: false, error: new Error('Language data has no code property') };
      }
      
      if (typeof langData.code === 'string' && langData.code !== null) {
        const langCode = langData.code;
        
        if (langCode === 'en' || langCode === 'zh') {
          return { 
            success: false, 
            error: new Error('Cannot delete default languages (English or Chinese)')
          };
        }
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
