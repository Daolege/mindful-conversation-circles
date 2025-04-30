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
    
    // 2. Drop existing foreign key constraint using direct SQL
    console.log('[executeHomeworkMigration] Attempting to drop foreign key constraint');
    
    try {
      const dropConstraintSql = `
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
        END $$;
      `;
      
      const { error: dropError } = await supabase.rpc('execute_sql', { sql_query: dropConstraintSql });
      
      if (dropError) {
        // If execute_sql isn't available, try another approach with direct REST API
        console.warn('[executeHomeworkMigration] Could not use execute_sql RPC, trying alternative approach:', dropError);
        
        // Try a simpler approach - just drop if exists
        const simpleDrop = `
          ALTER TABLE IF EXISTS public.homework 
          DROP CONSTRAINT IF EXISTS homework_course_id_fkey;
        `;
        
        // Use fetch to directly call the SQL endpoint
        const response = await fetch(`${supabase.restUrl}/sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`
          },
          body: JSON.stringify({ query: simpleDrop })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('[executeHomeworkMigration] Direct SQL drop error:', errorData);
          // Continue anyway - constraint might not exist
        } else {
          console.log('[executeHomeworkMigration] Direct SQL drop successful');
        }
      } else {
        console.log('[executeHomeworkMigration] Successfully executed drop constraint function');
      }
    } catch (dropErr) {
      console.warn('[executeHomeworkMigration] Drop operation failed:', dropErr);
      // Continue anyway - the constraint might not exist
    }
    
    // 3. Add new foreign key pointing to courses_new using direct SQL
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
      
      // First try with RPC
      const { error: addError } = await supabase.rpc('execute_sql', { sql_query: addConstraintSql });
      
      if (addError) {
        console.warn('[executeHomeworkMigration] Could not use execute_sql RPC, trying direct SQL:', addError);
        
        // Use fetch to directly call the SQL endpoint
        const response = await fetch(`${supabase.restUrl}/sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`
          },
          body: JSON.stringify({ query: addConstraintSql })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('[executeHomeworkMigration] Direct SQL add error:', errorData);
          throw new Error(`Unable to add foreign key via direct SQL: ${JSON.stringify(errorData)}`);
        } else {
          console.log('[executeHomeworkMigration] Direct SQL add constraint successful');
        }
      } else {
        console.log('[executeHomeworkMigration] Successfully executed add constraint function');
      }
    } catch (addErr: any) {
      console.error('[executeHomeworkMigration] Add foreign key error:', addErr);
      throw new Error(`Unable to add foreign key: ${addErr.message || 'Unknown error'}`);
    }
    
    // 4. Verify the constraint was added correctly by checking foreign keys
    console.log('[executeHomeworkMigration] Verifying foreign key was added');
    
    try {
      const verifySql = `
        SELECT 
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name = 'homework'
          AND kcu.column_name = 'course_id';
      `;
      
      // Use fetch to directly call the SQL endpoint
      const response = await fetch(`${supabase.restUrl}/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({ query: verifySql })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[executeHomeworkMigration] Verify SQL error:', errorData);
        throw new Error(`Unable to verify foreign key: ${JSON.stringify(errorData)}`);
      }
      
      const verifyData = await response.json();
      console.log('[executeHomeworkMigration] Verification result:', verifyData);
      
      // Check if the constraint points to courses_new
      let isForeignKeyCorrect = false;
      let foreignKeyTarget = "unknown";
      
      if (verifyData && verifyData.length > 0) {
        const foreignKey = verifyData[0];
        if (foreignKey) {
          foreignKeyTarget = foreignKey.foreign_table_name;
          isForeignKeyCorrect = foreignKey.foreign_table_name === 'courses_new';
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
      
      // 5. Record the successful migration in localStorage instead of temp table
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
