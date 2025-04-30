
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const executeHomeworkMigration = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  console.log('[executeHomeworkMigration] Starting homework migration');
  
  try {
    // 1. Drop existing foreign key using direct RPC call
    console.log('[executeHomeworkMigration] Dropping foreign key constraint');
    const { data: dropResult, error: dropError } = await supabase
      .rpc('drop_homework_foreign_key');
    
    if (dropError) {
      console.error('[executeHomeworkMigration] Drop foreign key error:', dropError);
      throw new Error(`Unable to drop foreign key: ${dropError.message}`);
    }
    
    console.log('[executeHomeworkMigration] Foreign key constraint dropped:', dropResult);
    
    // 2. Add new foreign key pointing to courses_new
    console.log('[executeHomeworkMigration] Adding new foreign key constraint');
    const { data: addResult, error: addError } = await supabase
      .rpc('add_homework_foreign_key');
    
    if (addError) {
      console.error('[executeHomeworkMigration] Add foreign key error:', addError);
      throw new Error(`Unable to add foreign key: ${addError.message}`);
    }
    
    console.log('[executeHomeworkMigration] New foreign key constraint added:', addResult);
    
    // 3. Verify foreign keys
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
    if (Array.isArray(foreignKeys)) {
      isForeignKeyCorrect = foreignKeys.some((fk: any) => 
        fk && fk.foreign_table === 'courses_new' && fk.column_name === 'course_id'
      );
    }
    
    if (!isForeignKeyCorrect) {
      console.warn('[executeHomeworkMigration] Foreign key does not point to courses_new');
    } else {
      console.log('[executeHomeworkMigration] Foreign key correctly points to courses_new');
    }
    
    // Migration completed successfully
    return {
      success: true,
      message: 'Successfully updated homework foreign key constraints'
    };
  } catch (error: any) {
    console.error('[executeHomeworkMigration] Error:', error);
    return {
      success: false,
      message: `Migration failed: ${error.message || 'Unknown error'}`
    };
  }
};
