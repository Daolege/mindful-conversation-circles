
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
    // Try using direct insert for migration recording
    try {
      // Add migration record using direct insert
      const { error } = await supabase
        .from('site_settings')
        .insert({
          key: `migration_${name}`,
          value: JSON.stringify({
            name,
            description,
            executed_at: new Date().toISOString(),
            success
          })
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
      .select('value')
      .eq('key', 'exchange_rate')
      .single();
      
    if (error) {
      console.error('Error fetching exchange rate:', error);
      return 7; // Default exchange rate
    }
    
    if (!data || !data.value) {
      return 7; // Default if no data
    }
    
    return parseFloat(data.value || '7');
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
      
    if (selectError && !selectError.message?.includes('No rows found')) {
      console.error('Error checking existing exchange rate setting:', selectError);
      return false;
    }
    
    if (existingSetting) {
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
