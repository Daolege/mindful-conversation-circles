import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getEnabledLanguages } from '@/lib/services/language/languageService';
import { useQuery } from '@tanstack/react-query';
import { Language, rtlLanguages, languageToCountryCode, defaultLanguages } from '@/lib/services/language/languageCore';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  supportedLanguages: Language[];
  isLoading: boolean;
  isRTL: boolean;
  reloadLanguages: () => void;
  getCountryCode: (languageCode: string) => string;
  isLanguageLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'zh',
  changeLanguage: () => {},
  supportedLanguages: defaultLanguages,
  isLoading: false,
  isRTL: false,
  reloadLanguages: () => {},
  getCountryCode: () => '',
  isLanguageLoading: false
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'zh');
  const [isRTL, setIsRTL] = useState(rtlLanguages.includes(currentLanguage));
  const [isLanguageLoading, setIsLanguageLoading] = useState(true); // Track language resources loading
  
  // Use React Query to get languages
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
    staleTime: 5 * 60 * 1000, // 5 minute cache
  });

  // Enhanced language changing function with loading state
  const changeLanguage = async (lang: string) => {
    setIsLanguageLoading(true);
    try {
      await i18n.changeLanguage(lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = rtlLanguages.includes(lang) ? 'rtl' : 'ltr';
    } catch (error) {
      console.error("Error changing language:", error);
    } finally {
      // Set a small timeout to ensure resources are loaded
      setTimeout(() => {
        setIsLanguageLoading(false);
      }, 500);
    }
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

    // Initial language load
    setIsLanguageLoading(true);
    
    // Pre-load current language resources
    i18n.loadNamespaces(['common', 'navigation', 'admin']).then(() => {
      setIsLanguageLoading(false);
    });

    // Subscribe to language change event
    i18n.on('languageChanged', handleLanguageChanged);

    // Clean up
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  // Set initial direction
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [isRTL, currentLanguage]);

  // Make sure the value object has the correct type for supportedLanguages
  const value: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    supportedLanguages: languages || defaultLanguages,
    isLoading,
    isRTL,
    reloadLanguages,
    getCountryCode,
    isLanguageLoading
  };

  // Show loading state or children based on language loading status
  return (
    <LanguageContext.Provider value={value}>
      {isLanguageLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        children
      )}
    </LanguageContext.Provider>
  );
};
