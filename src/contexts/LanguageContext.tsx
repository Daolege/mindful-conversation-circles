
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getEnabledLanguages } from '@/lib/services/language/languageService';
import { useQuery } from '@tanstack/react-query';
import { Language, rtlLanguages, languageToCountryCode, defaultLanguages } from '@/lib/services/language/languageCore';
import { initializeLanguageMigration, checkLanguageMigrationStatus, runLanguageMigration, createLanguagesTableIfNeeded } from '@/lib/services/language/migrationService';
import { toast } from 'sonner';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  supportedLanguages: Language[];
  isLoading: boolean;
  isRTL: boolean;
  reloadLanguages: () => void;
  getCountryCode: (languageCode: string) => string;
  isLanguageLoading: boolean;
  forceMigration: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'zh',
  changeLanguage: () => {},
  supportedLanguages: defaultLanguages,
  isLoading: false,
  isRTL: false,
  reloadLanguages: () => {},
  getCountryCode: () => '',
  isLanguageLoading: false,
  forceMigration: async () => {}
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'zh');
  const [isRTL, setIsRTL] = useState(rtlLanguages.includes(currentLanguage));
  const [isLanguageLoading, setIsLanguageLoading] = useState(true); // Track language resources loading
  const [migrationAttempted, setMigrationAttempted] = useState(false);
  
  // Use React Query to get languages
  const { 
    data: languages, 
    isLoading, 
    refetch: reloadLanguages,
    error: languageError
  } = useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      try {
        console.log('Fetching enabled languages');
        
        // Check if the migration has been run at least once
        if (!migrationAttempted) {
          setMigrationAttempted(true);
          console.log('Running initial language migration check');
          
          // Create table if needed (last resort)
          await createLanguagesTableIfNeeded();
          
          // Run the migration check
          await initializeLanguageMigration();
        }
        
        const enabledLanguages = await getEnabledLanguages();
        console.log('Fetched languages:', enabledLanguages);
        
        if (enabledLanguages.length <= 2) {
          console.warn('Only found default languages, you may need to manually restore additional languages');
        }
        
        return enabledLanguages.length > 0 ? enabledLanguages : defaultLanguages;
      } catch (error) {
        console.error("Error loading languages:", error);
        toast.error("Error loading languages. Using defaults.");
        return defaultLanguages;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minute cache
    retry: 2  // Retry failed requests twice
  });

  // Force migration manually
  const forceMigration = async () => {
    try {
      setIsLanguageLoading(true);
      toast.info("Restoring all languages...");
      
      // Run table creation if needed
      await createLanguagesTableIfNeeded();
      
      // Run the migration (force it)
      const result = await runLanguageMigration();
      
      if (result.success) {
        toast.success(`Successfully restored ${result.added} languages`);
        if (result.error) {
          toast.warning("Some languages failed to restore", { 
            description: result.error
          });
        }
      } else {
        toast.error("Failed to restore languages", { 
          description: result.error 
        });
      }
      
      // Refresh data
      await reloadLanguages();
    } catch (error) {
      console.error("Error in forceMigration:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLanguageLoading(false);
    }
  };

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

  // Debug log for languages
  useEffect(() => {
    if (languages) {
      console.log('LanguageContext - Available languages:', languages.length);
      console.log('LanguageContext - Languages:', languages.map(l => l.code).join(', '));
    }
  }, [languages]);

  // Make sure the value object has the correct type for supportedLanguages
  const value: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    supportedLanguages: languages || defaultLanguages,
    isLoading,
    isRTL,
    reloadLanguages,
    getCountryCode,
    isLanguageLoading,
    forceMigration
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
