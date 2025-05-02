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

// Apply performance optimizations and fix color logging
const originalConsoleLog = console.log;
console.log = function(...args) {
  // Filter out unnecessary logs and keep important ones
  const shouldLog = import.meta.env.DEV && 
    (!args[0] || typeof args[0] !== 'string' || 
     (!args[0].includes('[CourseCard]') && 
      !args[0].includes('purple') && 
      !args[0].includes('violet')));
  
  if (shouldLog) {
    originalConsoleLog.apply(console, args);
  }
};

// Setup performance optimization
// Add loader to track when all components have been rendered
window.addEventListener('load', () => {
  const inactiveTimeout = setTimeout(() => {
    // Remove loader or any loading states after the app is fully loaded
    const loader = document.querySelector('.initial-loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => {
        loader.remove();
      }, 300);
    }
  }, 500);

  return () => clearTimeout(inactiveTimeout);
});

initializeApp();
