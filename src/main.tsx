
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n' // Import the i18n configuration
import { loadMockCourses } from './integrations/supabase/client'

async function initializeApp() {
  try {
    // Load mock courses in development mode
    if (import.meta.env.DEV) {
      await loadMockCourses();
    }
    
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  } catch (error) {
    console.error('Error initializing application:', error);
    // Render app anyway, even if mock data loading fails
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  }
}

// 减少不必要的日志输出
console.log = (function(originalLog) {
  return function(...args) {
    // 只在开发环境显示日志，且限制特定关键日志
    if (import.meta.env.DEV && args[0] && 
        (typeof args[0] === 'string' && 
         !args[0].includes('[CourseCard]'))) { // 过滤掉高频CourseCard日志
      originalLog.apply(console, args);
    }
  };
})(console.log);

initializeApp();
