
import { Language, defaultLanguages } from './languageCore';
import { selectFromTable } from '@/lib/services/typeSafeSupabase';
import { getAllLanguages } from './languageManagement';

// Get enabled languages only
export async function getEnabledLanguages(): Promise<Language[]> {
  try {
    // Try to fetch enabled languages from the database first
    const { data, error } = await selectFromTable(
      'languages', 
      '*',
      { enabled: true }
    );
    
    if (error) {
      console.error("Error fetching enabled languages:", error);
      return defaultLanguages.filter(lang => lang.enabled);
    }
    
    // Check if we got data from the database and fix the type issue
    if (data && Array.isArray(data) && data.length > 0) {
      // Use type assertion to handle the conversion correctly
      const languagesData = data as unknown as Language[];
      console.log("Fetched enabled languages from DB:", languagesData.length);
      return languagesData;
    }
    
    // If no data from DB, try getting from getAllLanguages function
    const allLanguages = await getAllLanguages();
    const enabledLanguages = allLanguages.filter(lang => lang.enabled);
    
    if (enabledLanguages.length > 0) {
      console.log("Using enabled languages from getAllLanguages:", enabledLanguages.length);
      return enabledLanguages;
    }
    
    // Fallback to default languages as last resort
    console.log("Falling back to default languages");
    return defaultLanguages.filter(lang => lang.enabled);
  } catch (error) {
    console.error("Error in getEnabledLanguages:", error);
    return defaultLanguages.filter(lang => lang.enabled);
  }
}

// Get language by code
export function getLanguageByCode(code: string): Language | undefined {
  return defaultLanguages.find(lang => lang.code === code);
}

// Get language name in its native form
export function getLanguageNativeName(code: string): string {
  const language = getLanguageByCode(code);
  return language ? language.nativeName : code;
}

// Get standard language name in English
export function getLanguageStandardName(code: string): string {
  const language = getLanguageByCode(code);
  return language ? language.name : code;
}

// Get both native and English name
export function getLanguageFullName(code: string): string {
  const language = getLanguageByCode(code);
  if (!language) return code;
  
  return language.name === language.nativeName 
    ? language.name 
    : `${language.nativeName} (${language.name})`;
}

// Update export to include the languageService
export const languageService = {
  getEnabledLanguages,
  getLanguageByCode,
  getLanguageNativeName,
  getLanguageStandardName,
  getLanguageFullName
};
