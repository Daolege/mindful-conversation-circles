
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
      // Instead of using RPC which may not be available, use direct SQL execution
      await supabase.from('_migrations').select('id').limit(1).then(async ({ error }) => {
        if (error) {
          // Table likely doesn't exist, create it
          const createTableSQL = `
            CREATE TABLE IF NOT EXISTS public._migrations (
              id serial primary key,
              name text,
              executed_at timestamptz default now(),
              sql text,
              success boolean default true
            );
          `;
          
          const { error: createError } = await supabase.rpc('execute_sql', { sql_query: createTableSQL });
          if (createError) {
            console.warn('[executeHomeworkMigration] Error creating migrations table:', createError);
          } else {
            console.log('[executeHomeworkMigration] Migration table created successfully');
          }
        } else {
          console.log('[executeHomeworkMigration] Migrations table already exists');
        }
      });
    } catch (err) {
      console.warn('[executeHomeworkMigration] Exception in migrations table creation:', err);
      // Continue anyway as the table might already exist
    }
    
    // Step 1: Drop any existing foreign key constraints using direct SQL
    console.log('[executeHomeworkMigration] Dropping existing foreign key constraints...');
    
    try {
      const dropForeignKeySQL = `
        DO $$
        DECLARE
          constraint_name text;
        BEGIN
          SELECT conname INTO constraint_name
          FROM pg_constraint
          WHERE conrelid = 'public.homework'::regclass
          AND conname LIKE '%course_id%'
          AND contype = 'f'
          LIMIT 1;
          
          IF constraint_name IS NOT NULL THEN
            EXECUTE 'ALTER TABLE public.homework DROP CONSTRAINT ' || constraint_name;
            RAISE NOTICE 'Dropped constraint: %', constraint_name;
          END IF;
        END $$;
      `;
      
      const { error: dropError } = await supabase.rpc('execute_sql', { sql_query: dropForeignKeySQL });
      
      if (dropError) {
        console.error('[executeHomeworkMigration] Error dropping foreign key:', dropError);
        return {
          success: false,
          message: `外键约束删除失败: ${dropError.message}`
        };
      }
      
      console.log('[executeHomeworkMigration] Foreign key constraint dropped successfully');
    } catch (error: any) {
      console.error('[executeHomeworkMigration] Error in drop foreign key operation:', error);
      return {
        success: false,
        message: `外键约束删除时出错: ${error.message}`
      };
    }
    
    // Step 2: Add the new foreign key constraint to courses_new
    console.log('[executeHomeworkMigration] Adding new foreign key constraint to courses_new...');
    
    try {
      const addForeignKeySQL = `
        ALTER TABLE public.homework 
        ADD CONSTRAINT homework_course_id_fkey 
        FOREIGN KEY (course_id) 
        REFERENCES public.courses_new(id) 
        ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS idx_homework_course_id 
        ON public.homework(course_id);
      `;
      
      const { error: addError } = await supabase.rpc('execute_sql', { sql_query: addForeignKeySQL });
      
      if (addError) {
        console.error('[executeHomeworkMigration] Error adding foreign key:', addError);
        return {
          success: false,
          message: `新外键约束添加失败: ${addError.message}`
        };
      }
      
      console.log('[executeHomeworkMigration] Foreign key constraint added successfully');
    } catch (error: any) {
      console.error('[executeHomeworkMigration] Error in add foreign key operation:', error);
      return {
        success: false,
        message: `添加外键约束时出错: ${error.message}`
      };
    }
    
    // Step 3: Record the migration in the migrations table using direct SQL
    console.log('[executeHomeworkMigration] Recording migration in _migrations table...');
    const migrationName = 'homework_course_id_fkey_' + new Date().toISOString();
    
    try {
      const recordMigrationSQL = `
        INSERT INTO public._migrations (name, sql, success)
        VALUES ('${migrationName}', 'Update homework table foreign key to reference courses_new', true);
      `;
      
      const { error: recordError } = await supabase.rpc('execute_sql', { sql_query: recordMigrationSQL });
      
      if (recordError) {
        console.warn('[executeHomeworkMigration] Error recording migration:', recordError);
        // Not critical, continue
      } else {
        console.log('[executeHomeworkMigration] Migration recorded successfully');
      }
    } catch (error: any) {
      console.warn('[executeHomeworkMigration] Error in recording migration:', error);
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
