
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
      
      // Use direct database insert instead of RPC calls
      const { error } = await supabase
        .from('site_settings')
        .insert({
          key: `migration_${name}`,
          value: JSON.stringify(migrationData)
        });
      
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
    // Use direct query instead of RPC calls
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'exchange_rate')
      .single();
      
    if (error) {
      console.error('Error fetching exchange rate:', error);
      return 7; // Default exchange rate
    }
    
    // Handle the result
    if (data && data.value) {
      return parseFloat(data.value || '7');
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
    // Check if the exchange rate setting exists
    const { data: existingSettings, error: selectError } = await supabase
      .from('site_settings')
      .select('id')
      .eq('key', 'exchange_rate');
      
    if (selectError) {
      console.error('Error checking existing exchange rate setting:', selectError);
      return false;
    }
    
    const settingsExist = Array.isArray(existingSettings) && existingSettings.length > 0;
    
    if (settingsExist) {
      // Update existing setting
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({ value: newRate.toString() })
        .eq('key', 'exchange_rate');
        
      if (updateError) {
        console.error('Error updating exchange rate:', updateError);
        return false;
      }
    } else {
      // Create new setting
      const { error: insertError } = await supabase
        .from('site_settings')
        .insert({
          key: 'exchange_rate',
          value: newRate.toString()
        });
        
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
