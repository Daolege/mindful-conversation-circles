
import { selectFromTable, insertIntoTable, updateTable, deleteFromTable } from "@/lib/services/typeSafeSupabase";
import { Language, defaultLanguages } from "./languageCore";

// Type guard for language item
const isValidLanguage = (item: any): item is Language => {
  if (item === null || typeof item !== 'object') {
    return false;
  }
  
  return (
    'id' in item && 
    typeof item.id === 'number' &&
    'code' in item && 
    typeof item.code === 'string'
  );
};

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
      const validLanguages = data.filter(item => isValidLanguage(item));
      
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
      const validLanguages = data.filter(item => isValidLanguage(item));
      
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
    // Prepare language data without 'updated_at' field which isn't in the type
    const languageData = {
      code: language.code,
      name: language.name,
      nativeName: language.nativeName,
      enabled: language.enabled,
      rtl: language.rtl
    };
    
    const { data, error } = await insertIntoTable(
      'languages', 
      languageData
    );
    
    if (error) {
      console.error('Error adding language:', error);
      return { success: false, error: error as unknown as Error };
    }
    
    // Completely rewritten type handling for the data response
    if (data) {
      // Ensure data is an array
      const dataArray = Array.isArray(data) ? data : [];
      
      // Check if array has items
      if (dataArray.length > 0) {
        const firstItem = dataArray[0];
        // Make sure first item exists before returning it
        if (firstItem && typeof firstItem === 'object') {
          return { success: true, data: firstItem as Language };
        }
      }
    }
    
    // If we couldn't extract the language data, just return success
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
    const { error } = await updateTable(
      'languages',
      {
        name: language.name,
        nativeName: language.nativeName,
        enabled: language.enabled,
        rtl: language.rtl,
        updated_at: new Date().toISOString()
      },
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
    const { error } = await updateTable(
      'languages',
      {
        enabled: enabled,
        updated_at: new Date().toISOString()
      },
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

// Type guard for language code
const isValidLanguageCode = (langData: any): langData is { code: string } => {
  return langData !== null && 
         typeof langData === 'object' && 
         'code' in langData && 
         typeof langData.code === 'string';
};

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
      
      if (langData && isValidLanguageCode(langData)) {
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
    const { error } = await deleteFromTable(
      'languages',
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
