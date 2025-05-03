
// Re-export from the modular structure
export * from './language';

// Add Language type export for backward compatibility
export type { Language } from './language/languageCore';

// Re-export specific functions for backwards compatibility
export { getEnabledLanguages } from './language/languageService';

