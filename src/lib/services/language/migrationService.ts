
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addLanguage, getAllLanguages } from './languageManagement';
import { Language } from './languageCore';

// List of all supported languages
const supportedLanguages: Omit<Language, 'id'>[] = [
  { code: 'fr', name: 'French', nativeName: 'Français', enabled: true, rtl: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', enabled: true, rtl: false },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', enabled: true, rtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', enabled: true, rtl: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', enabled: true, rtl: false },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', enabled: true, rtl: false },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', enabled: true, rtl: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', enabled: true, rtl: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', enabled: true, rtl: false },
  { code: 'ko', name: 'Korean', nativeName: '한국어', enabled: true, rtl: false }
];

/**
 * Check if the languages table exists in the database
 */
export const checkLanguagesTableExists = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('languages')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error checking languages table:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception checking languages table:', error);
    return false;
  }
};

/**
 * Check if the migration has already been applied
 */
export const checkLanguageMigrationStatus = async (): Promise<boolean> => {
  try {
    // First check if the languages table exists
    const tableExists = await checkLanguagesTableExists();
    if (!tableExists) {
      console.error('Languages table does not exist');
      return false;
    }
    
    // Get all languages from the database
    const languages = await getAllLanguages();
    
    // Debug log
    console.log('Migration check - found languages:', languages.length, 'languages');
    if (languages.length > 0) {
      console.log('Language codes:', languages.map(l => l.code).join(', '));
    }
    
    // If we have more than just English and Chinese, assume migration is done
    if (languages.length > 2) {
      console.log('Migration seems to be already applied, found', languages.length, 'languages');
      return true;
    }
    
    // Check if we have both our default languages
    const hasEnglish = languages.some(lang => lang.code === 'en');
    const hasChinese = languages.some(lang => lang.code === 'zh');
    
    // If we're missing even the defaults, that's an issue
    if (!hasEnglish || !hasChinese) {
      console.warn('Missing default languages, need to run migration');
      return false;
    }
    
    // We have both defaults but nothing more
    console.log('Only default languages found, migration needed');
    return false;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
};

/**
 * Manually run the language migration to add all supported languages
 */
export const runLanguageMigration = async (): Promise<{ 
  success: boolean; 
  added: number; 
  error?: string 
}> => {
  try {
    // First check if table exists
    const tableExists = await checkLanguagesTableExists();
    if (!tableExists) {
      console.error('Languages table does not exist, cannot run migration');
      return { 
        success: false, 
        added: 0, 
        error: 'Languages table does not exist in the database.' 
      };
    }
    
    // Get current languages to avoid duplicates
    const currentLanguages = await getAllLanguages();
    const existingLanguageCodes = new Set(currentLanguages.map(lang => lang.code));
    
    console.log('Current languages before migration:', existingLanguageCodes);
    
    let addedCount = 0;
    const failedLanguages: string[] = [];
    
    // Try to add each language that doesn't already exist
    for (const lang of supportedLanguages) {
      // Skip if language already exists
      if (existingLanguageCodes.has(lang.code)) {
        console.log(`Language ${lang.code} already exists, skipping.`);
        continue;
      }
      
      try {
        console.log(`Adding language: ${lang.code}`);
        const result = await addLanguage({
          ...lang,
          updated_at: new Date().toISOString()
        });
        
        if (result.success) {
          addedCount++;
          console.log(`Successfully added language: ${lang.code}`);
        } else {
          failedLanguages.push(lang.code);
          console.error(`Failed to add language ${lang.code}:`, result.error);
        }
      } catch (err) {
        failedLanguages.push(lang.code);
        console.error(`Error adding language ${lang.code}:`, err);
      }
    }
    
    // Record migration status to prevent running it multiple times
    await recordMigration(addedCount, failedLanguages);
    
    console.log(`Migration completed. Added ${addedCount} languages. Failed: ${failedLanguages.length}`);
    
    return { 
      success: true, 
      added: addedCount,
      error: failedLanguages.length > 0 
        ? `Failed to add languages: ${failedLanguages.join(', ')}`
        : undefined
    };
  } catch (error) {
    console.error('Error running language migration:', error);
    return { 
      success: false, 
      added: 0, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Records that the language migration has been run
 */
const recordMigration = async (addedCount: number, failedLanguages: string[]): Promise<void> => {
  try {
    // Create a migration record using site_settings table
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        site_name: 'language_migration_status',
        site_description: JSON.stringify({
          timestamp: new Date().toISOString(),
          addedCount,
          failedLanguages
        }),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error recording migration status:', error);
    } else {
      console.log('Successfully recorded migration status');
    }
  } catch (err) {
    console.error('Failed to record migration status:', err);
  }
};

/**
 * Run the migration during application initialization
 * This should be called from a central initialization point
 */
export const initializeLanguageMigration = async (): Promise<void> => {
  try {
    // First check if languages table exists
    const tableExists = await checkLanguagesTableExists();
    if (!tableExists) {
      console.warn('Languages table does not exist, skipping migration');
      return;
    }
    
    const isMigrated = await checkLanguageMigrationStatus();
    
    // If not migrated yet, run the migration
    if (!isMigrated) {
      console.log('Language migration needed, running now...');
      const result = await runLanguageMigration();
      
      if (result.success) {
        console.log(`Language migration completed. Added ${result.added} languages.`);
        if (result.error) {
          console.warn('Some languages failed:', result.error);
        }
      } else {
        console.error('Language migration failed:', result.error);
      }
    } else {
      console.log('Language migration already completed');
    }
  } catch (error) {
    console.error('Error initializing language migration:', error);
  }
};

/**
 * Execute SQL to create the languages table if it doesn't exist
 * This is a last resort if the table doesn't exist
 */
export const createLanguagesTableIfNeeded = async (): Promise<boolean> => {
  try {
    // Check if table exists first
    const tableExists = await checkLanguagesTableExists();
    if (tableExists) {
      console.log('Languages table already exists');
      return true;
    }
    
    // Execute SQL to create table (using RPC for security)
    const { error } = await supabase.rpc('create_languages_table_if_not_exists');
    
    if (error) {
      console.error('Error creating languages table:', error);
      return false;
    }
    
    console.log('Successfully created languages table');
    
    // Insert default languages
    await supabase.rpc('insert_default_languages');
    
    return true;
  } catch (error) {
    console.error('Error creating languages table:', error);
    return false;
  }
};
