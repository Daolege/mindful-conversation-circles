
import { Language, defaultLanguages } from './languageCore';

// Get enabled languages only
export async function getEnabledLanguages(): Promise<Language[]> {
  try {
    // In a real app, this would fetch from an API or database
    // For now we'll use the default languages
    return defaultLanguages.filter(lang => lang.enabled);
  } catch (error) {
    console.error("Error fetching languages:", error);
    return defaultLanguages;
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
