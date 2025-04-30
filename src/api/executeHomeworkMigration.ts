
import { supabase } from '@/integrations/supabase/client';

export const executeHomeworkMigration = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  console.log('[executeHomeworkMigration] Starting homework migration');
  
  try {
    // 1. Diagnostic check before starting migration
    console.log('[executeHomeworkMigration] Running pre-migration diagnostics');
    const { data: preMigrationData, error: preMigrationError } = await supabase
      .rpc('get_foreign_keys', { table_name: 'homework' });
    
    if (preMigrationError) {
      console.warn('[executeHomeworkMigration] Pre-migration check warning:', preMigrationError);
      // Continue with migration despite error - this is just diagnostic
    } else {
      console.log('[executeHomeworkMigration] Pre-migration foreign keys:', preMigrationData);
    }
    
    // 2. Drop existing foreign key using RPC - with detailed logging
    console.log('[executeHomeworkMigration] Dropping foreign key constraint');
    const { data: dropResult, error: dropError } = await supabase
      .rpc('drop_homework_foreign_key');
    
    if (dropError) {
      // If there's an error, we'll try to work through it - log but continue
      console.error('[executeHomeworkMigration] Drop foreign key error:', dropError);
      console.log('[executeHomeworkMigration] Continuing despite error - constraint may not exist');
    } else {
      console.log('[executeHomeworkMigration] Foreign key constraint dropped:', dropResult);
    }
    
    // 3. Add new foreign key pointing to courses_new - with detailed logging
    console.log('[executeHomeworkMigration] Adding new foreign key constraint');
    const { data: addResult, error: addError } = await supabase
      .rpc('add_homework_foreign_key');
    
    if (addError) {
      console.error('[executeHomeworkMigration] Add foreign key error:', addError);
      throw new Error(`Unable to add foreign key: ${addError.message}`);
    }
    
    console.log('[executeHomeworkMigration] New foreign key constraint added:', addResult);
    
    // 4. Verify foreign keys - to confirm success
    console.log('[executeHomeworkMigration] Verifying foreign keys');
    const { data: verifyData, error: verifyError } = await supabase
      .rpc('get_foreign_keys', { table_name: 'homework' });
    
    if (verifyError) {
      console.error('[executeHomeworkMigration] Verify foreign keys error:', verifyError);
      throw new Error(`Unable to verify foreign keys: ${verifyError.message}`);
    }
    
    const foreignKeys = verifyData || [];
    console.log('[executeHomeworkMigration] Foreign key verification result:', foreignKeys);
    
    // Check if the foreign key points to courses_new
    let isForeignKeyCorrect = false;
    let foreignKeyTarget = "unknown";
    
    if (Array.isArray(foreignKeys)) {
      const foreignKey = foreignKeys.find((fk: any) => 
        fk && fk.column_name === 'course_id'
      );
      
      if (foreignKey) {
        foreignKeyTarget = foreignKey.foreign_table;
        isForeignKeyCorrect = foreignKey.foreign_table === 'courses_new';
      }
    }
    
    if (!isForeignKeyCorrect) {
      console.warn('[executeHomeworkMigration] Foreign key does not point to courses_new, current target:', foreignKeyTarget);
      return {
        success: false,
        message: `Migration incomplete: Foreign key points to ${foreignKeyTarget} instead of courses_new`
      };
    } else {
      console.log('[executeHomeworkMigration] Foreign key correctly points to courses_new');
    }
    
    // 5. Record the successful migration in the temp table for tracking
    try {
      await supabase.rpc('create_migrations_temp_table');
      await supabase.from('_migrations_temp').insert({
        name: 'homework_foreign_key_migration',
        executed_at: new Date().toISOString()
      });
      console.log('[executeHomeworkMigration] Migration recorded in tracking table');
    } catch(err) {
      console.log('[executeHomeworkMigration] Failed to record migration in tracking table:', err);
      // This is not critical, so we can continue
    }
    
    return {
      success: true,
      message: 'Successfully updated homework foreign key constraints to reference courses_new'
    };
  } catch (error: any) {
    console.error('[executeHomeworkMigration] Critical error:', error);
    return {
      success: false,
      message: `Migration failed: ${error.message || 'Unknown error'}`
    };
  }
};
