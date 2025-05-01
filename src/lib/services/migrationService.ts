import { supabase } from "@/integrations/supabase/client";

// Define possible migration names
export type MigrationName = 
  | 'init' 
  | 'add_subscription_tables' 
  | 'add_course_materials'
  | 'homework_foreign_key_fix';

// Track migrations in a migrations table
export const recordMigration = async (name: MigrationName, description: string, success: boolean = true) => {
  try {
    // Try using direct insert for migration recording
    try {
      // Add migration record using direct insert
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: `migration_${name}`,
          setting_value: JSON.stringify({
            name,
            description,
            executed_at: new Date().toISOString(),
            success
          }),
          updated_at: new Date().toISOString()
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
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('key', 'exchange_rate')
      .single();
      
    if (error) {
      console.error('Error fetching exchange rate:', error);
      return 7; // Default exchange rate
    }
    
    return parseFloat(data.setting_value || '7');
  } catch (error) {
    console.error('Error getting exchange rate:', error);
    return 7;
  }
};

// Update the exchange rate in site settings
export const updateExchangeRate = async (newRate: number): Promise<boolean> => {
  try {
    // Check if the exchange rate setting exists
    const { data: existingSetting, error: selectError } = await supabase
      .from('site_settings')
      .select('id')
      .eq('key', 'exchange_rate')
      .single();
      
    if (selectError && !selectError.message.includes('No rows found')) {
      console.error('Error checking existing exchange rate setting:', selectError);
      return false;
    }
    
    if (existingSetting) {
      // Update existing setting
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({ setting_value: newRate.toString() })
        .eq('key', 'exchange_rate');
        
      if (updateError) {
        console.error('Error updating exchange rate:', updateError);
        return false;
      }
    } else {
      // Insert new setting
      const { error: insertError } = await supabase
        .from('site_settings')
        .insert({ key: 'exchange_rate', setting_value: newRate.toString() });
        
      if (insertError) {
        console.error('Error inserting exchange rate:', insertError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateExchangeRate:', error);
    return false;
  }
};

// Get site settings
export const getSiteSetting = async (key: string, defaultValue: string = ''): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .single();
    
    if (error || !data) {
      console.log(`Setting ${key} not found, using default: ${defaultValue}`);
      return defaultValue;
    }
    
    return data.setting_value || defaultValue;
  } catch (error) {
    console.error('Error getting site setting:', error);
    return defaultValue;
  }
};

// Update site settings
export const updateSiteSettings = async (settings: { [key: string]: string }): Promise<boolean> => {
  try {
    for (const key in settings) {
      if (settings.hasOwnProperty(key)) {
        const value = settings[key];
        
        // Check if the setting exists
        const { data: existingSetting, error: selectError } = await supabase
          .from('site_settings')
          .select('id')
          .eq('setting_key', key)
          .single();
          
        if (selectError && !selectError.message.includes('No rows found')) {
          console.error(`Error checking existing setting ${key}:`, selectError);
          return false;
        }
        
        if (existingSetting) {
          // Update existing setting
          const { error: updateError } = await supabase
            .from('site_settings')
            .update({ setting_value: value })
            .eq('setting_key', key);
            
          if (updateError) {
            console.error(`Error updating setting ${key}:`, updateError);
            return false;
          }
        } else {
          // Insert new setting
          const { error: insertError } = await supabase
            .from('site_settings')
            .insert({ setting_key: key, setting_value: value });
            
          if (insertError) {
            console.error(`Error inserting setting ${key}:`, insertError);
            return false;
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateSiteSettings:', error);
    return false;
  }
};
