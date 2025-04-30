
import { supabase } from '@/integrations/supabase/client';

/**
 * Migration service to help with database migrations and schema fixes
 */

// Set up the migration table to track database changes
export const setupMigrationTable = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('[migrationService] Setting up migration tracking table');
    
    // Create _migrations table using direct SQL if it doesn't exist
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public._migrations (
        id serial primary key,
        name text,
        executed_at timestamptz default now(),
        sql text,
        success boolean default true
      );
    `;
    
    try {
      // Try to check if the table exists first
      const { data, error } = await supabase.from('_migrations').select('id').limit(1);
      
      if (error) {
        console.log('[migrationService] Migrations table does not exist, creating it now');
        const { error: createError } = await supabase.rpc('execute_sql', { sql_query: createTableSQL });
        
        if (createError) {
          console.error('[migrationService] Error creating migrations table with SQL:', createError);
          
          // Try to create it using a direct insert as fallback
          try {
            const { error: insertError } = await supabase.from('_migrations').insert({
              name: 'create_migrations_table',
              sql: 'CREATE TABLE IF NOT EXISTS _migrations',
              success: true
            });
            
            if (insertError) {
              console.error('[migrationService] Fallback creation also failed:', insertError);
              return {
                success: false,
                message: `Failed to create migrations table: ${insertError.message || '未知错误'}`
              };
            }
            
            return {
              success: true,
              message: 'Migration table created with fallback method'
            };
          } catch (insertError: any) {
            console.error('[migrationService] Error in fallback creation:', insertError);
            return {
              success: false,
              message: `Failed to create migrations table: ${insertError.message || '未知错误'}`
            };
          }
        }
      } else {
        console.log('[migrationService] Migrations table already exists');
      }
    } catch (err: any) {
      console.error('[migrationService] Error checking migrations table:', err);
      return {
        success: false,
        message: `Error checking migrations table: ${err.message || '未知错误'}`
      };
    }
    
    return {
      success: true,
      message: 'Migration table successfully created or confirmed'
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
    
    // Before inserting, ensure the table exists
    await setupMigrationTable();
    
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
    // First ensure the table exists
    const { success } = await setupMigrationTable();
    if (!success) {
      return false;
    }
    
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

// Execute SQL directly in the database
export const executeSql = async (sqlQuery: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('[migrationService] Executing SQL query');
    
    const { error } = await supabase.rpc('execute_sql', { sql_query: sqlQuery });
    
    if (error) {
      console.error('[migrationService] Error executing SQL:', error);
      return {
        success: false,
        message: `SQL执行失败: ${error.message}`
      };
    }
    
    return {
      success: true,
      message: 'SQL执行成功'
    };
  } catch (err: any) {
    console.error('[migrationService] Error in executeSql:', err);
    return {
      success: false,
      message: `SQL执行时出错: ${err.message || '未知错误'}`
    };
  }
};
