
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
        // First ensure we have the migrations table using RPC
        try {
          // Try to create the _migrations table first
          const { data: migTableResult, error: migTableError } = await supabase.rpc(
            'create_migrations_temp_table'
          );
          
          if (migTableError) {
            console.warn('[DatabaseFixInitializer] Error creating migrations table:', migTableError);
            // We'll try direct INSERT as fallback
            
            // Try creating with direct SQL
            await supabase.from('_migrations').insert({
              name: 'setup_migrations_table',
              sql: 'CREATE TABLE IF NOT EXISTS public._migrations',
              success: true
            }).select();
          } else {
            console.log('[DatabaseFixInitializer] Migration table ready');
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
