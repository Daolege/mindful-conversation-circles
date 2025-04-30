
import React, { useEffect, useState } from 'react';
import { executeHomeworkMigration } from '@/api/executeHomeworkMigration';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * This component automatically fixes database foreign key relationships
 * when the course learning page loads, ensuring homework functionality works properly.
 */
export const DatabaseFixInitializer: React.FC = () => {
  const [migrationExecuted, setMigrationExecuted] = useState(false);
  const storageKey = 'homework_migration_executed';
  
  useEffect(() => {
    const hasExecuted = localStorage.getItem(storageKey);
    
    const setupTemporaryTable = async () => {
      try {
        // Create a temporary table for migration operations if it doesn't exist
        const { data, error } = await supabase.rpc('create_migrations_temp_table');
        
        if (error) {
          console.log('[DatabaseFixInitializer] Error creating temporary table:', error);
        } else {
          console.log('[DatabaseFixInitializer] Temporary table created or already exists');
        }
      } catch (err) {
        console.error('[DatabaseFixInitializer] Error creating temp table:', err);
        // We'll continue with the migration anyway
      }
    };
    
    const runMigration = async () => {
      if (hasExecuted === 'true') {
        console.log('[DatabaseFixInitializer] Migration already executed, skipping');
        return;
      }
      
      // Setup temporary table first
      await setupTemporaryTable();
      
      console.log('[DatabaseFixInitializer] Executing database migration');
      
      try {
        const result = await executeHomeworkMigration();
        
        if (result.success) {
          console.log('[DatabaseFixInitializer] Migration successful:', result.message);
          localStorage.setItem(storageKey, 'true');
          setMigrationExecuted(true);
          toast.success('数据库关系已自动修复，作业功能现可正常使用');
        } else {
          console.error('[DatabaseFixInitializer] Migration failed:', result.message);
          // Don't show error toast here as it might confuse users - let the HomeworkModule handle errors
        }
      } catch (error: any) {
        console.error('[DatabaseFixInitializer] Migration error:', error);
      }
    };
    
    runMigration();
  }, []);
  
  // This component doesn't render anything
  return null;
};
