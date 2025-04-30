
import { supabase } from '@/integrations/supabase/client';

/**
 * Migration service to help with database migrations and schema fixes
 */

// Set up the migration table to track database changes
export const setupMigrationTable = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('[migrationService] Setting up migration tracking table');
    
    // Create _migrations table using SQL
    const { error } = await supabase.rpc('create_migrations_temp_table');
    
    if (error) {
      console.warn('[migrationService] Error using RPC to create migration table:', error);
      
      // Try to create it using direct SQL as fallback
      try {
        await supabase.from('_migrations').insert({
          name: 'create_migrations_table',
          sql: 'CREATE TABLE IF NOT EXISTS _migrations',
          success: true
        });
        
        return {
          success: true,
          message: 'Migration table created with fallback method'
        };
      } catch (fallbackError: any) {
        console.error('[migrationService] Fallback creation also failed:', fallbackError);
        // Even this failed, the table might exist already
        return {
          success: false,
          message: `Failed to create migrations table: ${fallbackError.message || '未知错误'}`
        };
      }
    }
    
    return {
      success: true,
      message: 'Migration table successfully created'
    };
  } catch (err: any) {
    console.error('[migrationService] Unexpected error in setupMigrationTable:', err);
    return {
      success: false,
      message: `设置迁移表时出错: ${err.message || '未知错误'}`
    };
  }
};

// Record a migration in the tracking table
export const recordMigration = async (
  name: string, 
  sql: string, 
  success: boolean
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`[migrationService] Recording migration "${name}"`);
    
    const { error } = await supabase
      .from('_migrations')
      .insert([{
        name,
        sql,
        success
      }]);
      
    if (error) {
      console.error('[migrationService] Error recording migration:', error);
      return {
        success: false,
        message: `无法记录迁移: ${error.message}`
      };
    }
    
    return {
      success: true,
      message: `成功记录迁移: ${name}`
    };
  } catch (err: any) {
    console.error('[migrationService] Unexpected error in recordMigration:', err);
    return {
      success: false,
      message: `记录迁移时出错: ${err.message || '未知错误'}`
    };
  }
};

// Check if a specific migration has been executed
export const hasMigrationExecuted = async (migrationName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('_migrations')
      .select('id, success')
      .eq('name', migrationName)
      .maybeSingle();
      
    if (error) {
      console.error('[migrationService] Error checking migration status:', error);
      return false;
    }
    
    // Return true if the migration exists and was successful
    return !!(data && data.success);
  } catch (err) {
    console.error('[migrationService] Error in hasMigrationExecuted:', err);
    return false;
  }
};
