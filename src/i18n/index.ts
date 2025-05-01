
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { supabase } from '@/integrations/supabase/client';

// Import translations
import enCommon from './locales/en/common.json';
import enCourses from './locales/en/courses.json';
import enNavigation from './locales/en/navigation.json';
import enAuth from './locales/en/auth.json';
import enAdmin from './locales/en/admin.json';
import enCheckout from './locales/en/checkout.json';
import enDashboard from './locales/en/dashboard.json';
import enErrors from './locales/en/errors.json';
import enOrders from './locales/en/orders.json';

import zhCommon from './locales/zh/common.json';
import zhCourses from './locales/zh/courses.json';
import zhNavigation from './locales/zh/navigation.json';
import zhAuth from './locales/zh/auth.json';
import zhAdmin from './locales/zh/admin.json';
import zhCheckout from './locales/zh/checkout.json';
import zhDashboard from './locales/zh/dashboard.json';
import zhErrors from './locales/zh/errors.json';
import zhOrders from './locales/zh/orders.json';

// 动态加载翻译的 backend
i18n.use(Backend);

// 自定义后端，支持从数据库加载翻译
i18n.use({
  type: 'backend',
  init: () => {},
  read: async (language, namespace, callback) => {
    try {
      // 首先尝试从数据库加载翻译
      const { data, error } = await supabase.rpc('get_namespace_translations', {
        p_language_code: language,
        p_namespace: namespace
      });
      
      // 转换为键值对
      if (!error && data && data.length > 0) {
        const translations = data.reduce((acc: Record<string, string>, item: {key: string, value: string}) => {
          acc[item.key] = item.value;
          return acc;
        }, {});
        
        callback(null, translations);
        return;
      }
      
      // 如果数据库没有翻译，使用内置翻译
      let translationsObj = {};
      
      if (language === 'en') {
        switch (namespace) {
          case 'common': translationsObj = enCommon; break;
          case 'courses': translationsObj = enCourses; break;
          case 'navigation': translationsObj = enNavigation; break;
          case 'auth': translationsObj = enAuth; break;
          case 'admin': translationsObj = enAdmin; break;
          case 'checkout': translationsObj = enCheckout; break;
          case 'dashboard': translationsObj = enDashboard; break;
          case 'errors': translationsObj = enErrors; break;
          case 'orders': translationsObj = enOrders; break;
        }
      } else if (language === 'zh') {
        switch (namespace) {
          case 'common': translationsObj = zhCommon; break;
          case 'courses': translationsObj = zhCourses; break;
          case 'navigation': translationsObj = zhNavigation; break;
          case 'auth': translationsObj = zhAuth; break;
          case 'admin': translationsObj = zhAdmin; break;
          case 'checkout': translationsObj = zhCheckout; break;
          case 'dashboard': translationsObj = zhDashboard; break;
          case 'errors': translationsObj = zhErrors; break;
          case 'orders': translationsObj = zhOrders; break;
        }
      }
      
      callback(null, translationsObj);
    } catch (err) {
      callback(err as Error, null);
    }
  }
})
.use(LanguageDetector)
.use(initReactI18next)
.init({
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
