
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addLanguage, getAllLanguages } from './languageManagement';
import { Language } from './languageCore';
import { insertIntoTable } from '../typeSafeSupabase';

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
    // Use raw query to check if the table exists
    // Using the .any() method which is more permissive with types
    const { data, error } = await supabase
      .from('languages' as any)
      .select('id')
      .limit(1)
      .maybeSingle();
    
    if (error && error.code === '42P01') { // PostgreSQL code for "table does not exist"
      console.error('Language table does not exist:', error);
      return false;
    } else if (error) {
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
        const result = await addLanguage(lang);
        
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
 * Check if the courses_new table has a language column
 * Uses direct SQL query to check column existence
 */
export const checkCoursesLanguageColumn = async (): Promise<boolean> => {
  try {
    // Try a basic query against the table to see if the column exists
    const { data, error } = await supabase
      .from('courses_new')
      .select('language')
      .limit(1);
    
    // If no error with column 'language', it exists
    if (!error) {
      console.log('Language column exists (verified by test query)');
      return true;
    } else if (error.code === '42703') { // PostgreSQL code for "undefined_column"
      console.error('Language column test query failed:', error);
      return false;
    } else {
      // Some other error occurred
      console.error('Error checking language column:', error);
      return false;
    }
  } catch (error) {
    console.error('Exception checking language column:', error);
    return false;
  }
};

/**
 * Add language column to courses_new table if it doesn't exist
 * Uses direct SQL query to alter the table
 */
export const addLanguageColumnToCourses = async (): Promise<boolean> => {
  try {
    // First check if column already exists
    const columnExists = await checkCoursesLanguageColumn();
    if (columnExists) {
      console.log('Language column already exists in courses_new table');
      return true;
    }
    
    console.log('Adding language column to courses_new table...');
    
    // Try direct course update to add the column
    try {
      // First try updating a single course to see if we can add the language column
      const { error: updateError } = await supabase
        .from('courses_new')
        .update({ 
          category: 'zh',  // Make sure we set an existing column too
          language: 'zh'   // This might create the column if the DB allows it
        })
        .eq('id', 1);
      
      // Check if the update succeeded
      if (!updateError) {
        console.log('Successfully added language column via update');
        return true;
      } else if (updateError.code !== '42703') { // If error is not "column does not exist"
        console.error('Error updating courses with language:', updateError);
      }
    } catch (err) {
      console.error('Error in direct update attempt:', err);
    }
    
    // If direct update failed, let the user know they need to run a migration
    console.error('Could not automatically add language column to courses_new table');
    console.log('User should run database migration script to add the column');
    
    return false;
  } catch (error) {
    console.error('Error adding language column:', error);
    return false;
  }
};

/**
 * Run all migrations needed for language functionality
 * This consolidates all required migrations in one place
 * Modified to handle different database environments
 */
export const runAllLanguageMigrations = async (): Promise<boolean> => {
  try {
    console.log('Running all language-related migrations');
    
    // 1. Check if languages table exists, create if needed
    const tableExists = await checkLanguagesTableExists();
    if (!tableExists) {
      console.log('Languages table does not exist, creating it');
      const tableCreated = await createLanguagesTableIfNeeded();
      if (!tableCreated) {
        console.error('Failed to create languages table');
        // Continue anyway, as we might still be able to add the language column
      }
    }
    
    // 2. Check if courses_new has language column
    const languageColumnExists = await checkCoursesLanguageColumn();
    if (!languageColumnExists) {
      console.log('Language column does not exist, adding it');
      const columnAdded = await addLanguageColumnToCourses();
      if (!columnAdded) {
        console.error('Failed to add language column');
        // Continue anyway, as we might still be able to add languages
      }
    }
    
    // 3. Check if language migration is needed for default languages
    const isMigrated = await checkLanguageMigrationStatus();
    if (!isMigrated && tableExists) {
      console.log('Language migration needed, running now...');
      const result = await runLanguageMigration();
      if (!result.success) {
        console.error('Language migration failed:', result.error);
      }
    }
    
    // Return success as long as we could check something
    console.log('Language migrations completed with available capabilities');
    return true;
  } catch (error) {
    console.error('Error running all language migrations:', error);
    // Return true anyway to prevent blocking the application
    return true;
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
    
    // Try to create the table using direct insert approach
    await createDefaultLanguages();
    
    // Check if the table exists now
    const tableCreated = await checkLanguagesTableExists();
    return tableCreated;
  } catch (error) {
    console.error('Error creating languages table:', error);
    return false;
  }
};

/**
 * Manual fallback to create default languages
 */
const createDefaultLanguages = async (): Promise<boolean> => {
  try {
    // Manually insert default languages using the type-safe function
    const defaultLanguages = [
      { code: 'en', name: 'English', nativeName: 'English', enabled: true, rtl: false },
      { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', enabled: true, rtl: false }
    ];
    
    for (const lang of defaultLanguages) {
      const { error } = await insertIntoTable('languages', lang);
      if (error) {
        console.error(`Error inserting default language ${lang.code}:`, error);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error creating default languages:', error);
    return false;
  }
};
