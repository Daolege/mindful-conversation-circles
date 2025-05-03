
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getEnabledLanguages, Language } from '@/lib/services/languageService';
import { useQuery } from '@tanstack/react-query';
import { languageToCountryCode } from '@/lib/utils/languageUtils';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  supportedLanguages: Language[];
  isLoading: boolean;
  isRTL: boolean;
  reloadLanguages: () => void;
  getCountryCode: (languageCode: string) => string;
}

// 默认支持的语言
const defaultLanguages: Language[] = [
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

// RTL languages list
const rtlLanguages = ['ar'];

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'zh',
  changeLanguage: () => {},
  supportedLanguages: defaultLanguages,
  isLoading: false,
  isRTL: false,
  reloadLanguages: () => {},
  getCountryCode: () => ''
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'zh');
  const [isRTL, setIsRTL] = useState(rtlLanguages.includes(currentLanguage));
  
  // 使用 React Query 获取语言
  const { 
    data: languages, 
    isLoading, 
    refetch: reloadLanguages 
  } = useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      try {
        const enabledLanguages = await getEnabledLanguages();
        return enabledLanguages.length > 0 ? enabledLanguages : defaultLanguages;
      } catch (error) {
        console.error("Error loading languages:", error);
        return defaultLanguages;
      }
    },
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });

  // Change language and handle RTL
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  // Get country code for flag display
  const getCountryCode = (languageCode: string): string => {
    return languageToCountryCode[languageCode] || languageCode;
  };

  useEffect(() => {
    const handleLanguageChanged = () => {
      const newLanguage = i18n.language;
      setCurrentLanguage(newLanguage);
      setIsRTL(rtlLanguages.includes(newLanguage));
      
      // Set direction attribute on HTML element
      document.documentElement.dir = rtlLanguages.includes(newLanguage) ? 'rtl' : 'ltr';
      document.documentElement.lang = newLanguage;
    };

    // 订阅语言变更事件
    i18n.on('languageChanged', handleLanguageChanged);

    // 清理
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  // Set initial direction
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [isRTL, currentLanguage]);

  const value = {
    currentLanguage,
    changeLanguage,
    supportedLanguages: languages || defaultLanguages,
    isLoading,
    isRTL,
    reloadLanguages,
    getCountryCode
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
