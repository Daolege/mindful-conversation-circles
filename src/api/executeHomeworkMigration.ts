
import { supabase } from '@/integrations/supabase/client';

/**
 * Executes a database migration to fix homework foreign key relationships.
 * This function handles the migration process for updating the course_id foreign key
 * to reference the courses_new table instead of the old courses table.
 */
export const executeHomeworkMigration = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('[executeHomeworkMigration] Starting migration...');
    
    // First create migrations table if it doesn't exist
    try {
      const { data: migTableResult, error: migTableError } = await supabase.rpc(
        'create_migrations_temp_table'
      );
      
      console.log('[executeHomeworkMigration] Migration table creation result:', 
        migTableError ? `Error: ${migTableError.message}` : migTableResult || 'Success');
      
      if (migTableError) {
        console.warn('[executeHomeworkMigration] Error creating migrations table:', migTableError);
        // Continue anyway as the table might already exist
      }
    } catch (err) {
      console.warn('[executeHomeworkMigration] Exception in migrations table creation:', err);
      // Continue anyway as the table might already exist
    }
    
    // Step 1: Drop any existing foreign key constraints
    console.log('[executeHomeworkMigration] Dropping existing foreign key constraints...');
    const { data: dropResult, error: dropError } = await supabase.rpc(
      'drop_homework_foreign_key'
    );
    
    if (dropError) {
      console.error('[executeHomeworkMigration] Error dropping foreign key:', dropError);
      return {
        success: false,
        message: `外键约束删除失败: ${dropError.message}`
      };
    }
    
    console.log('[executeHomeworkMigration] Drop result:', dropResult);
    
    // Step 2: Add the new foreign key constraint to courses_new
    console.log('[executeHomeworkMigration] Adding new foreign key constraint to courses_new...');
    const { data: addResult, error: addError } = await supabase.rpc(
      'add_homework_foreign_key'
    );
    
    if (addError) {
      console.error('[executeHomeworkMigration] Error adding foreign key:', addError);
      return {
        success: false,
        message: `新外键约束添加失败: ${addError.message}`
      };
    }
    
    console.log('[executeHomeworkMigration] Add result:', addResult);
    
    // Step 3: Record the migration in the migrations table
    console.log('[executeHomeworkMigration] Recording migration in _migrations table...');
    const migrationName = 'homework_course_id_fkey_' + new Date().toISOString();
    
    const { error: recordError } = await supabase
      .from('_migrations')
      .insert([{
        name: migrationName,
        sql: 'Update homework table foreign key to reference courses_new',
        success: true
      }]);
    
    if (recordError) {
      console.warn('[executeHomeworkMigration] Error recording migration:', recordError);
      // Not critical, continue
    }
    
    console.log('[executeHomeworkMigration] Migration completed successfully');
    return {
      success: true,
      message: '数据库关系修复成功: 作业表现已正确关联到courses_new表'
    };
  } catch (error: any) {
    console.error('[executeHomeworkMigration] Unexpected error during migration:', error);
    return {
      success: false,
      message: `迁移过程中出现意外错误: ${error?.message || '未知错误'}`
    };
  }
};
