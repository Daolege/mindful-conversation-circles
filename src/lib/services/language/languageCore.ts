
// Define common language interfaces and helpers

export interface Language {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  enabled?: boolean;
  rtl: boolean;
}

// Mapping of language codes to country codes for flag display
export const languageToCountryCode: Record<string, string> = {
  en: 'us',
  zh: 'cn',
  fr: 'fr',
  de: 'de',
  es: 'es',
  ja: 'jp',
  ko: 'kr',
  ru: 'ru',
  ar: 'sa',
  pt: 'pt',
  vi: 'vn',
  th: 'th',
};

// Languages that use RTL (right-to-left) text direction
export const rtlLanguages = ['ar', 'he', 'fa', 'ur'];

// Export the default languages array - we'll use this in other files
export const defaultLanguages: Language[] = [
  { id: 1, code: 'en', name: 'English', nativeName: 'English', enabled: true, rtl: false },
  { id: 2, code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', enabled: true, rtl: false }
];
