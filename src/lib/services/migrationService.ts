
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Records a migration in the database
 */
export async function recordMigration(name: string, description: string, success: boolean): Promise<boolean> {
  try {
    console.log(`[MigrationService] Recording migration: ${name}`);
    
    const timestamp = new Date().toISOString();
    
    // Try to use an RPC call first (preferred)
    try {
      // Note: This assumes you have a stored procedure for this
      // If not, it will fall back to direct insertion
      const { data, error } = await supabase.rpc('record_migration', {
        _name: name,
        _description: description,
        _success: success,
        _executed_at: timestamp
      });
      
      if (!error) {
        return true;
      }
      
      // If RPC fails (likely because the function doesn't exist), fall back to direct insertion
      console.log(`[MigrationService] RPC call failed, falling back to direct insertion: ${error.message}`);
    } catch (err) {
      console.log(`[MigrationService] RPC method not available, using direct insert`);
    }
    
    // Use a direct insert as fallback
    // This requires permissions to insert into the _migrations table
    const { error: insertError } = await supabase
      .from('migrations')
      .insert({
        name: name,
        description: description,
        success: success,
        executed_at: timestamp
      });
    
    if (insertError) {
      console.error(`[MigrationService] Failed to record migration: ${insertError.message}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[MigrationService] Error recording migration:', error);
    return false;
  }
}

/**
 * Checks if a migration has already been executed
 */
export async function checkMigrationStatus(name: string): Promise<boolean> {
  try {
    // First try site_settings table, which is more accessible
    const { data: settingsData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', `migration_${name}_completed`)
      .single();
      
    if (settingsData && settingsData.value === 'true') {
      return true;
    }
    
    // If not found in site_settings, try migrations table
    // Note: This might not have appropriate permissions for all users
    const { data: migrationData, error: migrationError } = await supabase
      .from('migrations')
      .select('success')
      .eq('name', name)
      .order('executed_at', { ascending: false })
      .limit(1);
      
    if (migrationError) {
      console.log(`[MigrationService] Could not check migration table: ${migrationError.message}`);
      return false;
    }
    
    return migrationData && migrationData.length > 0 && migrationData[0].success;
  } catch (error) {
    console.error('[MigrationService] Error checking migration status:', error);
    return false;
  }
}

/**
 * Run a safe migration that handles any database schema changes
 */
export async function runMigration(
  name: string,
  description: string,
  migrationFn: () => Promise<boolean>
): Promise<boolean> {
  try {
    console.log(`[MigrationService] Running migration: ${name}`);
    
    // Check if migration already completed
    const alreadyMigrated = await checkMigrationStatus(name);
    if (alreadyMigrated) {
      console.log(`[MigrationService] Migration ${name} already completed, skipping.`);
      return true;
    }
    
    // Run the migration function
    console.log(`[MigrationService] Executing migration ${name}...`);
    const success = await migrationFn();
    
    // Record the result
    await recordMigration(name, description, success);
    
    // Record in site_settings for easier access
    await supabase
      .from('site_settings')
      .upsert({
        key: `migration_${name}_completed`,
        value: success ? 'true' : 'false',
        updated_at: new Date().toISOString()
      });
      
    if (success) {
      console.log(`[MigrationService] Migration ${name} completed successfully.`);
      toast.success(`Migration ${name} completed successfully`);
    } else {
      console.error(`[MigrationService] Migration ${name} failed.`);
      toast.error(`Migration ${name} failed`);
    }
    
    return success;
  } catch (error) {
    console.error(`[MigrationService] Error running migration ${name}:`, error);
    toast.error(`Migration ${name} failed with an error`);
    return false;
  }
}
