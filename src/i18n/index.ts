
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enCommon from './locales/en/common.json';
import enCourses from './locales/en/courses.json';
import enNavigation from './locales/en/navigation.json';
import enAuth from './locales/en/auth.json';
import enAdmin from './locales/en/admin.json';
import enCheckout from './locales/en/checkout.json';

import zhCommon from './locales/zh/common.json';
import zhCourses from './locales/zh/courses.json';
import zhNavigation from './locales/zh/navigation.json';
import zhAuth from './locales/zh/auth.json';
import zhAdmin from './locales/zh/admin.json';
import zhCheckout from './locales/zh/checkout.json';

// Configure i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        courses: enCourses,
        navigation: enNavigation,
        auth: enAuth,
        admin: enAdmin,
        checkout: enCheckout,
      },
      zh: {
        common: zhCommon,
        courses: zhCourses,
        navigation: zhNavigation,
        auth: zhAuth,
        admin: zhAdmin,
        checkout: zhCheckout,
      },
    },
    supportedLngs: ['en', 'zh'],
    fallbackLng: 'zh',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
