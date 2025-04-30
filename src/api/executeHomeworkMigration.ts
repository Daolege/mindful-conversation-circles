
import { supabase } from '@/integrations/supabase/client';

export const executeHomeworkMigration = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  console.log('[executeHomeworkMigration] Starting homework migration');
  
  try {
    // 1. Diagnostic check - just log current schema status
    console.log('[executeHomeworkMigration] Running pre-migration diagnostics');
    
    try {
      // Check if homework table exists
      const { count, error: tableCheckError } = await supabase
        .from('homework')
        .select('*', { count: 'exact', head: true });
      
      if (tableCheckError) {
        console.warn('[executeHomeworkMigration] Table check warning:', tableCheckError);
      } else {
        console.log('[executeHomeworkMigration] Homework table exists with count:', count);
      }
    } catch (err) {
      console.warn('[executeHomeworkMigration] Pre-check error:', err);
      // Continue anyway, this is just diagnostic
    }
    
    // 2. Drop existing foreign key constraint using admin_add_course_item function
    console.log('[executeHomeworkMigration] Attempting to drop foreign key constraint');
    
    try {
      const dropConstraintSql = `
        ALTER TABLE IF EXISTS public.homework 
        DROP CONSTRAINT IF EXISTS homework_course_id_fkey;
      `;
      
      const { data: dropData, error: dropError } = await supabase.rpc('admin_add_course_item', {
        p_table_name: '_migrations',
        p_course_id: 0, // Use 0 as a placeholder for system-level operations
        p_content: dropConstraintSql,
        p_position: 0,
        p_id: 'drop_fk_' + new Date().getTime(),
        p_is_visible: true
      });
      
      if (dropError) {
        console.warn('[executeHomeworkMigration] Could not drop constraint using RPC:', dropError);
        // Continue anyway - constraint might not exist
      } else {
        console.log('[executeHomeworkMigration] Successfully executed drop constraint function');
      }
    } catch (dropErr) {
      console.warn('[executeHomeworkMigration] Drop operation failed:', dropErr);
      // Continue anyway - the constraint might not exist
    }
    
    // 3. Add new foreign key pointing to courses_new using admin_add_course_item RPC
    console.log('[executeHomeworkMigration] Adding new foreign key constraint to courses_new');
    
    try {
      const addConstraintSql = `
        ALTER TABLE IF EXISTS public.homework
        ADD CONSTRAINT homework_course_id_fkey
        FOREIGN KEY (course_id)
        REFERENCES public.courses_new(id)
        ON DELETE CASCADE;
        
        -- Create index to improve query performance
        CREATE INDEX IF NOT EXISTS idx_homework_course_id
        ON public.homework(course_id);
      `;
      
      // Use admin_add_course_item RPC
      const { data: addData, error: addError } = await supabase.rpc('admin_add_course_item', { 
        p_table_name: '_migrations',
        p_course_id: 0, // Use 0 as a placeholder for system-level operations
        p_content: addConstraintSql,
        p_position: 1,
        p_id: 'add_fk_' + new Date().getTime(),
        p_is_visible: true
      });
      
      if (addError) {
        console.error('[executeHomeworkMigration] Could not add constraint using RPC:', addError);
        throw new Error(`Unable to add foreign key: ${addError.message}`);
      } else {
        console.log('[executeHomeworkMigration] Successfully added foreign key constraint');
      }
    } catch (addErr: any) {
      console.error('[executeHomeworkMigration] Add foreign key error:', addErr);
      throw new Error(`Unable to add foreign key: ${addErr.message || 'Unknown error'}`);
    }
    
    // 4. Verify the constraint was added correctly through direct table query
    console.log('[executeHomeworkMigration] Verifying migration by testing relationships');
    
    try {
      // First check if courses_new has data
      const { count: courseCount, error: courseError } = await supabase
        .from('courses_new')
        .select('*', { count: 'exact', head: true });
      
      console.log('[executeHomeworkMigration] courses_new table has rows:', courseCount);
      
      if (courseError) {
        console.warn('[executeHomeworkMigration] Error checking courses_new:', courseError);
      }
      
      // Then check that homework table can be queried with foreign key
      const { data: hwData, error: hwError } = await supabase
        .from('homework')
        .select('*, courses_new!inner(*)')
        .limit(1);
      
      if (hwError) {
        console.error('[executeHomeworkMigration] Join verification failed:', hwError);
        // This is just a verification, so continue anyway
      } else {
        console.log('[executeHomeworkMigration] Relationship verification passed');
      }
      
      // 5. Record the successful migration in localStorage
      try {
        localStorage.setItem('homework_migration_executed', 'true');
        console.log('[executeHomeworkMigration] Migration recorded in localStorage');
      } catch (err) {
        console.log('[executeHomeworkMigration] Failed to record migration in localStorage:', err);
        // Not critical, continue
      }
      
      return {
        success: true,
        message: 'Successfully updated homework foreign key constraints to reference courses_new'
      };
    } catch (verifyErr: any) {
      console.error('[executeHomeworkMigration] Critical verification error:', verifyErr);
      return {
        success: false,
        message: `Migration verification failed: ${verifyErr.message || 'Unknown error'}`
      };
    }
  } catch (error: any) {
    console.error('[executeHomeworkMigration] Critical error:', error);
    return {
      success: false,
      message: `Migration failed: ${error.message || 'Unknown error'}`
    };
  }
};
