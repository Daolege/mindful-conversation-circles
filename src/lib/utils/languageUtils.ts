
/**
 * Map language codes to country codes for flag display
 * Some languages are represented by multiple countries, so we choose one representative
 */
export const languageToCountryCode: Record<string, string> = {
  en: 'us', // English - US flag (changed from 'gb')
  zh: 'cn', // Chinese - China flag
  fr: 'fr', // French - France flag
  de: 'de', // German - Germany flag
  ru: 'ru', // Russian - Russia flag
  ar: 'sa', // Arabic - Saudi Arabia flag
  es: 'es', // Spanish - Spain flag
  vi: 'vn', // Vietnamese - Vietnam flag
  th: 'th', // Thai - Thailand flag
  pt: 'pt', // Portuguese - Portugal flag
  ja: 'jp', // Japanese - Japan flag
  ko: 'kr'  // Korean - South Korea flag
};

/**
 * Get the country code for a language
 * @param languageCode ISO language code
 * @returns ISO country code for flag display
 */
export const getCountryCodeForLanguage = (languageCode: string): string => {
  return languageToCountryCode[languageCode] || languageCode;
};

/**
 * Get the display name for a language in the current UI language
 * @param languageCode ISO language code
 * @param currentUILanguage Current UI language code
 * @returns Localized language name
 */
export const getLanguageDisplayName = (languageCode: string, currentUILanguage: string): string => {
  // This would ideally use Intl.DisplayNames, but for now we'll return the native name
  // as this API isn't fully supported in all browsers
  const languageNames: Record<string, Record<string, string>> = {
    en: {
      en: 'English',
      zh: 'Chinese',
      fr: 'French',
      de: 'German',
      ru: 'Russian',
      ar: 'Arabic',
      es: 'Spanish',
      vi: 'Vietnamese',
      th: 'Thai',
      pt: 'Portuguese',
      ja: 'Japanese',
      ko: 'Korean'
    },
    zh: {
      en: '英语',
      zh: '中文',
      fr: '法语',
      de: '德语',
      ru: '俄语',
      ar: '阿拉伯语',
      es: '西班牙语',
      vi: '越南语',
      th: '泰国语',
      pt: '葡萄牙语',
      ja: '日语',
      ko: '韩语'
    }
  };
  
  // Return localized name if available, otherwise fall back to native name
  if (languageNames[currentUILanguage] && languageNames[currentUILanguage][languageCode]) {
    return languageNames[currentUILanguage][languageCode];
  }
  
  // Default to English names if the current UI language isn't supported
  if (languageNames.en[languageCode]) {
    return languageNames.en[languageCode];
  }
  
  // Fallback to language code if no name is found
  return languageCode.toUpperCase();
};
