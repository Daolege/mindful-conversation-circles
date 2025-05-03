
/**
 * Core language types and defaults
 */

// Language definition
export interface Language {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  enabled: boolean;
  rtl: boolean;
  created_at?: string;
  updated_at?: string;
}

// Translation item structure
export interface TranslationItem {
  id?: number;
  language_code: string;
  namespace: string;
  key: string;
  value: string;
  created_at?: string;
  updated_at?: string;
}

// 默认支持的语言
export const defaultLanguages: Language[] = [
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

// List of RTL languages
export const rtlLanguages = ['ar'];

// Get a map of language codes to country codes for flag display
export const languageToCountryCode: Record<string, string> = {
  'en': 'us',  // English -> USA
  'zh': 'cn',  // Chinese -> China
  'fr': 'fr',  // French -> France
  'de': 'de',  // German -> Germany
  'ru': 'ru',  // Russian -> Russia
  'ar': 'sa',  // Arabic -> Saudi Arabia
  'es': 'es',  // Spanish -> Spain
  'vi': 'vn',  // Vietnamese -> Vietnam
  'th': 'th',  // Thai -> Thailand
  'pt': 'pt',  // Portuguese -> Portugal
  'ja': 'jp',  // Japanese -> Japan
  'ko': 'kr',  // Korean -> South Korea
};

/**
 * Utility function to divide an array into chunks of specified size
 * @param array The array to be chunked
 * @param chunkSize Size of each chunk
 * @returns Array of arrays (chunks)
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  if (!array.length) {
    return [];
  }
  
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  
  return chunks;
}
