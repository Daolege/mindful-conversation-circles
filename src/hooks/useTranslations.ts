
import { useTranslation } from 'react-i18next';

export const useTranslations = () => {
  const { t, i18n } = useTranslation(['common', 'navigation', 'courses', 'auth', 'admin', 'checkout']);
  
  return {
    t,
    i18n,
    currentLanguage: i18n.language,
    changeLanguage: (lang: string) => i18n.changeLanguage(lang),
    isRTL: i18n.dir() === 'rtl',
  };
};
