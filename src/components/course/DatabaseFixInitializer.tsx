
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
        // First check if specific courses exist in courses_new
        try {
          // Check for at least one course in courses_new
          const { data: coursesExist, error: coursesError } = await supabase
            .from('courses_new')
            .select('id')
            .limit(5);
          
          if (coursesError || !coursesExist || coursesExist.length === 0) {
            console.error('[DatabaseFixInitializer] No courses found in courses_new table:', coursesError);
            toast.error('未找到课程数据，请联系管理员');
            return;
          }
          
          console.log('[DatabaseFixInitializer] Found courses in courses_new:', 
            coursesExist.map(c => c.id));
        } catch (err) {
          console.error('[DatabaseFixInitializer] Error checking courses_new table:', err);
        }
        
        // Execute the actual migration
        console.log('[DatabaseFixInitializer] Calling executeHomeworkMigration()');
        const result = await executeHomeworkMigration();
        
        setMigrationExecuted(true);
        
        if (result.success) {
          console.log('[DatabaseFixInitializer] Migration successful:', result.message);
          localStorage.setItem(storageKey, 'true');
          setMigrationSuccess(true);
          
          // Also store in site_settings for server-side checks
          await supabase
            .from('site_settings')
            .upsert({
              key: 'homework_migration_completed',
              value: 'true',
              updated_at: new Date().toISOString()
            });
          
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
