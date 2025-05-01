
import { supabase } from "@/integrations/supabase/client";

// Define possible migration names
export type MigrationName = 
  | 'init' 
  | 'add_subscription_tables' 
  | 'add_course_materials'
  | 'homework_foreign_key_fix';

// Updated SiteSetting interface to match the database schema
export interface SiteSetting {
  id?: string;
  key: string;  
  value: string;
  updated_at?: string;
  created_at?: string;
}

// Track migrations in the site settings table
export const recordMigration = async (name: MigrationName, description: string, success: boolean = true) => {
  try {
    const migrationData = {
      name,
      description,
      executed_at: new Date().toISOString(),
      success
    };
    
    // Use a SiteSetting-compatible object when inserting
    const siteSettingData: SiteSetting = {
      key: `migration_${name}`,
      value: JSON.stringify(migrationData)
    };
    
    // Insert using the proper structure
    const { error } = await supabase
      .from('site_settings')
      .upsert(siteSettingData);
    
    if (error) {
      console.error('Error recording migration:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in recordMigration:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get the current exchange rate from site settings
export const getExchangeRate = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'exchange_rate')
      .single();
      
    if (error) {
      console.error('Error fetching exchange rate:', error);
      return 7; // Default exchange rate
    }
    
    // Access value property from the data (which should be a SiteSetting)
    const siteSettingData = data as SiteSetting;
    if (siteSettingData && siteSettingData.value) {
      return parseFloat(siteSettingData.value);
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
        .update({ value: newRate.toString() } as SiteSetting)
        .eq('key', 'exchange_rate');
        
      if (updateError) {
        console.error('Error updating exchange rate:', updateError);
        return false;
      }
    } else {
      // Create new setting with correct structure
      const newSetting: SiteSetting = {
        key: 'exchange_rate',
        value: newRate.toString()
      };
      
      const { error: insertError } = await supabase
        .from('site_settings')
        .insert(newSetting);
        
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
