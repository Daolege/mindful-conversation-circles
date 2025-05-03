
import { Tables } from "@/lib/supabase/database.types";

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
}

// Default languages as fallback
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
  { id: 12, code: 'ko', name: 'Korean', nativeName: '한国語', enabled: true, rtl: false }
];

// Utility function to split array into chunks
export function chunkArray<T>(array: T[], size: number): T[][] {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}
