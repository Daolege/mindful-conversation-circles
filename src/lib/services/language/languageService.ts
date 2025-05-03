
export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  direction?: 'ltr' | 'rtl';
  enabled?: boolean;
}

// List of available languages in the application
export const availableLanguages: LanguageOption[] = [
  { code: "zh", name: "Chinese", nativeName: "中文", direction: "ltr", enabled: true },
  { code: "en", name: "English", nativeName: "English", direction: "ltr", enabled: true },
  { code: "fr", name: "French", nativeName: "Français", direction: "ltr", enabled: true },
  { code: "de", name: "German", nativeName: "Deutsch", direction: "ltr", enabled: true },
  { code: "es", name: "Spanish", nativeName: "Español", direction: "ltr", enabled: true },
  { code: "ja", name: "Japanese", nativeName: "日本語", direction: "ltr", enabled: true },
  { code: "ko", name: "Korean", nativeName: "한국어", direction: "ltr", enabled: true },
  { code: "ru", name: "Russian", nativeName: "Русский", direction: "ltr", enabled: true },
  { code: "ar", name: "Arabic", nativeName: "العربية", direction: "rtl", enabled: true },
  { code: "pt", name: "Portuguese", nativeName: "Português", direction: "ltr", enabled: true },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", direction: "ltr", enabled: true },
  { code: "th", name: "Thai", nativeName: "ไทย", direction: "ltr", enabled: true },
];

// Get enabled languages only
export function getEnabledLanguages(): LanguageOption[] {
  return availableLanguages.filter(lang => lang.enabled);
}

// Get language by code
export function getLanguageByCode(code: string): LanguageOption | undefined {
  return availableLanguages.find(lang => lang.code === code);
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
  availableLanguages,
  getEnabledLanguages,
  getLanguageByCode,
  getLanguageNativeName,
  getLanguageStandardName,
  getLanguageFullName
};
