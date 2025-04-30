
import React, { useEffect, useState } from 'react';
import { executeHomeworkMigration } from '@/api/executeHomeworkMigration';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * This component automatically fixes database foreign key relationships
 * when the course learning page loads, ensuring homework functionality works properly.
 */
export const DatabaseFixInitializer: React.FC = () => {
  const [migrationExecuted, setMigrationExecuted] = useState(false);
  const [migrationSuccess, setMigrationSuccess] = useState(false);
  const storageKey = 'homework_migration_executed';
  
  useEffect(() => {
    const hasExecuted = localStorage.getItem(storageKey) === 'true';
    
    const runMigration = async () => {
      if (hasExecuted) {
        console.log('[DatabaseFixInitializer] Migration already executed, skipping');
        setMigrationExecuted(true);
        setMigrationSuccess(true);
        return;
      }
      
      console.log('[DatabaseFixInitializer] Executing database migration');
      
      try {
        // First ensure we have the migrations table
        try {
          // Check if the _migrations table exists using SQL query
          const { data, error } = await supabase.from('_migrations').select('id').limit(1);
          
          if (error) {
            console.log('[DatabaseFixInitializer] _migrations table doesn\'t exist, trying to create it');
            // Execute SQL to create the table
            const createTableSQL = `
              CREATE TABLE IF NOT EXISTS public._migrations (
                id serial primary key,
                name text,
                executed_at timestamptz default now(),
                sql text,
                success boolean default true
              );
            `;
            
            await supabase.rpc('execute_sql', { sql_query: createTableSQL });
            console.log('[DatabaseFixInitializer] Migration table created');
          } else {
            console.log('[DatabaseFixInitializer] Migration table already exists');
          }
        } catch (err) {
          console.warn('[DatabaseFixInitializer] Exception in migrations table setup:', err);
          // Continue anyway, table might already exist
        }
        
        // Execute the actual migration
        console.log('[DatabaseFixInitializer] Calling executeHomeworkMigration()');
        const result = await executeHomeworkMigration();
        
        setMigrationExecuted(true);
        
        if (result.success) {
          console.log('[DatabaseFixInitializer] Migration successful:', result.message);
          localStorage.setItem(storageKey, 'true');
          setMigrationSuccess(true);
          
          // Show success toast only once
          if (!hasExecuted) {
            toast.success('数据库关系已自动修复，作业功能现可正常使用');
          }
        } else {
          console.error('[DatabaseFixInitializer] Migration failed:', result.message);
          // Only show error toast for non-already-executed migrations
          if (!hasExecuted) {
            toast.error('数据库关系修复失败，部分功能可能无法正常工作');
          }
          // Don't set localStorage flag when migration fails
        }
      } catch (error: any) {
        console.error('[DatabaseFixInitializer] Migration error:', error);
        setMigrationExecuted(true);
        setMigrationSuccess(false);
        
        if (!hasExecuted) {
          toast.error('数据库关系修复过程中出错，请刷新页面重试');
        }
      }
    };
    
    // Run migration with a slight delay to ensure page loads first
    const timer = setTimeout(() => {
      runMigration();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Log migration status for debugging
  useEffect(() => {
    if (migrationExecuted) {
      console.log('[DatabaseFixInitializer] Migration status:', migrationSuccess ? 'SUCCESS' : 'FAILED');
    }
  }, [migrationExecuted, migrationSuccess]);
  
  // This component doesn't render anything
  return null;
};
