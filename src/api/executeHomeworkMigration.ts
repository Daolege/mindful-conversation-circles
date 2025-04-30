
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const executeHomeworkMigration = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  console.log('[executeHomeworkMigration] Starting homework migration');
  
  try {
    // 1. Drop existing foreign key using direct SQL execution
    console.log('[executeHomeworkMigration] Dropping foreign key constraint');
    const { data: dropResult, error: dropError } = await supabase
      .rpc('execute_sql', { 
        sql_query: `DO $$ 
        BEGIN 
          IF EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conrelid = 'public.homework'::regclass 
            AND conname LIKE '%course_id%' 
            AND contype = 'f'
          ) THEN
            EXECUTE (
              SELECT 'ALTER TABLE public.homework DROP CONSTRAINT ' || conname
              FROM pg_constraint
              WHERE conrelid = 'public.homework'::regclass
              AND conname LIKE '%course_id%'
              AND contype = 'f'
              LIMIT 1
            );
          END IF;
        END $$;`
      });
    
    if (dropError) {
      console.error('[executeHomeworkMigration] Drop foreign key error:', dropError);
      throw new Error(`Unable to drop foreign key: ${dropError.message}`);
    }
    
    console.log('[executeHomeworkMigration] Foreign key constraint dropped');
    
    // 2. Add new foreign key pointing to courses_new
    console.log('[executeHomeworkMigration] Adding new foreign key constraint');
    const { data: addResult, error: addError } = await supabase
      .rpc('execute_sql', { 
        sql_query: `
        DO $$ 
        BEGIN 
          ALTER TABLE public.homework 
          ADD CONSTRAINT homework_course_id_fkey 
          FOREIGN KEY (course_id) 
          REFERENCES public.courses_new(id) 
          ON DELETE CASCADE;

          -- Create an index to improve query performance
          CREATE INDEX IF NOT EXISTS idx_homework_course_id 
          ON public.homework(course_id);
        EXCEPTION
          WHEN others THEN
            RAISE NOTICE 'Error adding constraint: %', SQLERRM;
        END $$;`
      });
    
    if (addError) {
      console.error('[executeHomeworkMigration] Add foreign key error:', addError);
      throw new Error(`Unable to add foreign key: ${addError.message}`);
    }
    
    console.log('[executeHomeworkMigration] New foreign key constraint added');
    
    // 3. Verify foreign keys
    console.log('[executeHomeworkMigration] Verifying foreign keys');
    const { data: verifyData, error: verifyError } = await supabase
      .rpc('execute_sql', { 
        sql_query: `
        SELECT json_agg(json_build_object(
          'constraint_name', conname,
          'table_name', relname,
          'column_name', a.attname,
          'foreign_table', confrelid::regclass::text,
          'foreign_column', af.attname
        ))
        FROM pg_constraint c
        JOIN pg_class r ON r.oid = c.conrelid
        JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
        JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
        WHERE contype = 'f'
        AND relname = 'homework';`
      });
    
    if (verifyError) {
      console.error('[executeHomeworkMigration] Verify foreign keys error:', verifyError);
      throw new Error(`Unable to verify foreign keys: ${verifyError.message}`);
    }
    
    const foreignKeys = verifyData?.result || [];
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
