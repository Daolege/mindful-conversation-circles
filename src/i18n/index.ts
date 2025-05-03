
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { supabase } from '@/integrations/supabase/client';
import { selectFromTable } from '@/lib/services/typeSafeSupabase';

// Default namespaces
const namespaces = [
  'common', 
  'navigation', 
  'courses', 
  'auth', 
  'admin', 
  'checkout', 
  'dashboard', 
  'errors', 
  'orders', 
  'actions', 
  'home'
];

// Supported languages
const supportedLanguages = [
  'en', 'zh', 'fr', 'de', 'ru', 
  'ar', 'es', 'vi', 'th', 'pt', 
  'ja', 'ko'
];

// Define RTL languages
const rtlLanguages = ['ar'];

// Import base translations for English and Chinese
// Note: Other languages will be loaded from the database
import enCommon from './locales/en/common.json';
import enNavigation from './locales/en/navigation.json';
import enCourses from './locales/en/courses.json';
import enAuth from './locales/en/auth.json';
import enAdmin from './locales/en/admin.json';
import enCheckout from './locales/en/checkout.json';
import enDashboard from './locales/en/dashboard.json';
import enErrors from './locales/en/errors.json';
import enOrders from './locales/en/orders.json';
import enActions from './locales/en/actions.json';
import enHome from './locales/en/home.json';

import zhCommon from './locales/zh/common.json';
import zhCourses from './locales/zh/courses.json';
import zhNavigation from './locales/zh/navigation.json';
import zhAuth from './locales/zh/auth.json';
import zhAdmin from './locales/zh/admin.json';
import zhCheckout from './locales/zh/checkout.json';
import zhDashboard from './locales/zh/dashboard.json';
import zhErrors from './locales/zh/errors.json';
import zhOrders from './locales/zh/orders.json';
import zhActions from './locales/zh/actions.json';
import zhHome from './locales/zh/home.json';

// 动态加载翻译的 backend
i18n.use(Backend);

// Type for item with key and value
interface TranslationEntry {
  key: string; 
  value: string;
}

// 自定义后端，支持从数据库加载翻译
i18n.use({
  type: 'backend',
  init: () => {},
  read: async (language, namespace, callback) => {
    try {
      // 首先尝试从数据库加载翻译
      const { data, error } = await selectFromTable(
        'translations',
        'key, value',
        { language_code: language, namespace: namespace }
      );
      
      // 转换为键值对
      if (!error && data && Array.isArray(data) && data.length > 0) {
        const translations = data.reduce((acc, item) => {
          // Only proceed if item is an object with key and value properties
          if (item && typeof item === 'object' && 'key' in item && 'value' in item && item.key && item.value) {
            acc[item.key] = item.value;
          }
          return acc;
        }, {} as Record<string, string>);
        
        // If we have database translations, use them
        if (Object.keys(translations).length > 0) {
          callback(null, translations);
          return;
        }
      }
      
      // If database has no translations or there was an error, use built-in translations
      let translationsObj = {};
      
      // Only English and Chinese have built-in translations
      if (language === 'en') {
        switch (namespace) {
          case 'common': translationsObj = enCommon; break;
          case 'navigation': translationsObj = enNavigation; break;
          case 'courses': translationsObj = enCourses; break;
          case 'auth': translationsObj = enAuth; break;
          case 'admin': translationsObj = enAdmin; break;
          case 'checkout': translationsObj = enCheckout; break;
          case 'dashboard': translationsObj = enDashboard; break;
          case 'errors': translationsObj = enErrors; break;
          case 'orders': translationsObj = enOrders; break;
          case 'actions': translationsObj = enActions; break;
          case 'home': translationsObj = enHome; break;
        }
      } else if (language === 'zh') {
        switch (namespace) {
          case 'common': translationsObj = zhCommon; break;
          case 'navigation': translationsObj = zhNavigation; break;
          case 'courses': translationsObj = zhCourses; break;
          case 'auth': translationsObj = zhAuth; break;
          case 'admin': translationsObj = zhAdmin; break;
          case 'checkout': translationsObj = zhCheckout; break;
          case 'dashboard': translationsObj = zhDashboard; break;
          case 'errors': translationsObj = zhErrors; break;
          case 'orders': translationsObj = zhOrders; break;
          case 'actions': translationsObj = zhActions; break;
          case 'home': translationsObj = zhHome; break;
        }
      }
      
      callback(null, translationsObj);
    } catch (err) {
      console.error('Error loading translations:', err);
      callback(err instanceof Error ? err : new Error('Unknown error loading translations'), null);
    }
  }
})
.use(LanguageDetector)
.use(initReactI18next)
.init({
  supportedLngs: supportedLanguages,
  fallbackLng: ['zh', 'en'],
  defaultNS: 'common',
  ns: namespaces,
  interpolation: {
    escapeValue: false,
  },
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
  },
  react: {
    useSuspense: false, // Disable suspense to prevent loading flickers
  },
  load: 'languageOnly'
});

// Set the correct document direction based on language
const setDocumentDirection = (language: string) => {
  const dir = rtlLanguages.includes(language) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = language;
  // Add a data attribute for easier styling
  document.documentElement.setAttribute('data-language', language);
};

// Set initial direction
setDocumentDirection(i18n.language);

// Update direction when language changes
i18n.on('languageChanged', setDocumentDirection);

export default i18n;
