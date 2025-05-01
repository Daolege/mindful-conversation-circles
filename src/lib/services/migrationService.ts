
import { supabase } from "@/integrations/supabase/client";

// Define possible migration names
export type MigrationName = 
  | 'init' 
  | 'add_subscription_tables' 
  | 'add_course_materials'
  | 'homework_foreign_key_fix';

// Track migrations in the site settings table
export const recordMigration = async (name: MigrationName, description: string, success: boolean = true) => {
  try {
    // Try using direct SQL for migration recording to avoid type issues
    try {
      const migrationData = {
        name,
        description,
        executed_at: new Date().toISOString(),
        success
      };
      
      // Use SQL directly to insert the record
      const { error } = await supabase.rpc(
        'execute_sql',
        { 
          sql_statement: `
            INSERT INTO site_settings (key, value)
            VALUES ('migration_${name}', '${JSON.stringify(migrationData)}')
          `
        }
      );
      
      if (error) {
        console.error('Error recording migration:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (insertError) {
      console.error('Error in recordMigration:', insertError);
      return { success: false, error: insertError instanceof Error ? insertError.message : 'Unknown error' };
    }
  } catch (error) {
    console.error('Error in recordMigration:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get the current exchange rate from site settings
export const getExchangeRate = async (): Promise<number> => {
  try {
    // Use SQL query to avoid type issues
    const { data, error } = await supabase.rpc(
      'execute_sql',
      { sql_statement: `SELECT value FROM site_settings WHERE key = 'exchange_rate'` }
    );
      
    if (error) {
      console.error('Error fetching exchange rate:', error);
      return 7; // Default exchange rate
    }
    
    // Handle the result from SQL query
    if (Array.isArray(data) && data.length > 0 && data[0].value) {
      return parseFloat(data[0].value || '7');
    }
    
    return 7; // Default if no data
  } catch (error) {
    console.error('Error getting exchange rate:', error);
    return 7;
  }
};

// Update the exchange rate in site settings
export const updateExchangeRate = async (newRate: number): Promise<boolean> => {
  try {
    // Check if the exchange rate setting exists using SQL
    const { data: existingSettings, error: selectError } = await supabase.rpc(
      'execute_sql',
      { sql_statement: `SELECT id FROM site_settings WHERE key = 'exchange_rate'` }
    );
      
    if (selectError) {
      console.error('Error checking existing exchange rate setting:', selectError);
      return false;
    }
    
    const settingsExist = Array.isArray(existingSettings) && existingSettings.length > 0;
    
    if (settingsExist) {
      // Update existing setting using SQL
      const { error: updateError } = await supabase.rpc(
        'execute_sql',
        { 
          sql_statement: `
            UPDATE site_settings 
            SET value = '${newRate.toString()}' 
            WHERE key = 'exchange_rate'
          `
        }
      );
        
      if (updateError) {
        console.error('Error updating exchange rate:', updateError);
        return false;
      }
    } else {
      // Create new setting using SQL
      const { error: insertError } = await supabase.rpc(
        'execute_sql',
        { 
          sql_statement: `
            INSERT INTO site_settings (key, value)
            VALUES ('exchange_rate', '${newRate.toString()}')
          `
        }
      );
        
      if (insertError) {
        console.error('Error inserting exchange rate:', insertError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating exchange rate:', error);
    return false;
  }
};
