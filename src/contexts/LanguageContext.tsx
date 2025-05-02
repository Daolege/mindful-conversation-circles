
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getEnabledLanguages, Language } from '@/lib/services/languageService';
import { useQuery } from '@tanstack/react-query';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  supportedLanguages: Language[];
  isLoading: boolean;
  reloadLanguages: () => void;
}

// 默认支持的语言
const defaultLanguages: Language[] = [
  { id: 1, code: 'en', name: 'English', nativeName: 'English', enabled: true },
  { id: 2, code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', enabled: true },
];

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'zh',
  changeLanguage: () => {},
  supportedLanguages: defaultLanguages,
  isLoading: false,
  reloadLanguages: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'zh');
  
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

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  useEffect(() => {
    const handleLanguageChanged = () => {
      setCurrentLanguage(i18n.language);
    };

    // 订阅语言变更事件
    i18n.on('languageChanged', handleLanguageChanged);

    // 清理
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const value = {
    currentLanguage,
    changeLanguage,
    supportedLanguages: languages || defaultLanguages,
    isLoading,
    reloadLanguages,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
