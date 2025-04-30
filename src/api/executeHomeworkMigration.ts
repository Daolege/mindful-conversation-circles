
import { supabase } from '@/integrations/supabase/client';
import { recordMigration } from '@/lib/services/migrationService';

/**
 * Executes migration to fix homework foreign key constraints
 * Ensures homework records correctly reference courses_new table
 */
export const executeHomeworkMigration = async () => {
  console.log('[executeHomeworkMigration] Starting homework migration');
  
  try {
    // 1. Check if the migration has already been executed
    const migrationName = 'homework_foreign_key_fix';
    const { data: migrationData } = await supabase
      .from('_migrations')
      .select('*')
      .eq('name', migrationName)
      .maybeSingle();
    
    if (migrationData?.success) {
      console.log('[executeHomeworkMigration] Migration already executed successfully');
      return { 
        success: true, 
        message: '数据库关系修复已经完成' 
      };
    }
    
    console.log('[executeHomeworkMigration] Executing migration');
    
    // 2. Check for orphaned homework records (reference non-existent courses)
    const { data: orphanedHomework, error: orphanCheck } = await supabase
      .rpc('get_orphaned_homework');
    
    if (orphanCheck) {
      console.error('[executeHomeworkMigration] Error checking orphaned homework:', orphanCheck);
      // Continue with migration even if this check fails
    } else if (orphanedHomework && orphanedHomework.length > 0) {
      console.log(`[executeHomeworkMigration] Found ${orphanedHomework.length} orphaned homework records`);
      
      // Delete orphaned records
      const { error: deleteError } = await supabase
        .from('homework')
        .delete()
        .in('id', orphanedHomework.map(h => h.id));
      
      if (deleteError) {
        console.error('[executeHomeworkMigration] Error deleting orphaned homework:', deleteError);
      } else {
        console.log(`[executeHomeworkMigration] Deleted ${orphanedHomework.length} orphaned homework records`);
      }
    } else {
      console.log('[executeHomeworkMigration] No orphaned homework records found');
    }
    
    // 3. Execute the migration script using a SQL statement
    const migrationSQL = `
      DO $$
      DECLARE
        constraint_name text;
      BEGIN
        -- Find if there's an existing foreign key constraint on homework.course_id
        SELECT conname INTO constraint_name
        FROM pg_constraint
        WHERE conrelid = 'public.homework'::regclass
        AND conname LIKE '%course_id%'
        AND contype = 'f'
        LIMIT 1;
        
        -- If constraint exists, drop it
        IF constraint_name IS NOT NULL THEN
          EXECUTE 'ALTER TABLE public.homework DROP CONSTRAINT ' || constraint_name;
          RAISE NOTICE 'Dropped constraint: %', constraint_name;
        END IF;
        
        -- Add the correct foreign key constraint to courses_new
        ALTER TABLE public.homework 
          ADD CONSTRAINT homework_course_id_fkey 
          FOREIGN KEY (course_id) 
          REFERENCES public.courses_new(id) 
          ON DELETE CASCADE;
          
        -- Create an index to improve query performance
        CREATE INDEX IF NOT EXISTS idx_homework_course_id 
          ON public.homework(course_id);
      END $$;
    `;
    
    const { error: migrationError } = await supabase.rpc('execute_sql', {
      sql_query: migrationSQL
    });
    
    if (migrationError) {
      console.error('[executeHomeworkMigration] Migration error:', migrationError);
      
      // Record failed migration attempt
      await recordMigration(
        migrationName,
        migrationSQL,
        false
      );
      
      return {
        success: false,
        message: `数据库关系修复失败: ${migrationError.message || '未知错误'}`
      };
    }
    
    // 4. Record successful migration
    await recordMigration(
      migrationName,
      migrationSQL,
      true
    );
    
    // 5. Update site settings to remember migration was completed
    await supabase
      .from('site_settings')
      .upsert({
        key: 'homework_migration_completed',
        value: 'true',
        updated_at: new Date().toISOString()
      });
    
    console.log('[executeHomeworkMigration] Migration completed successfully');
    
    return {
      success: true,
      message: '数据库关系修复成功，作业数据现可正常访问'
    };
  } catch (error: any) {
    console.error('[executeHomeworkMigration] Unexpected error:', error);
    
    return {
      success: false,
      message: `数据库关系修复出错: ${error.message || '未知错误'}`
    };
  }
};
