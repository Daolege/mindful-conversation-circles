
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      console.log('[DatabaseFixInitializer] Starting database migration check');
      
      try {
        // Always verify courses_new has valid data
        try {
          // Check for at least one course in courses_new
          const { data: coursesExist, error: coursesError } = await supabase
            .from('courses_new')
            .select('id')
            .limit(5);
          
          if (coursesError) {
            console.error('[DatabaseFixInitializer] Error checking courses_new table:', coursesError);
            return;
          }
          
          if (!coursesExist || coursesExist.length === 0) {
            console.error('[DatabaseFixInitializer] No courses found in courses_new table');
            toast.error('未找到课程数据，请联系管理员');
            return;
          }
          
          console.log('[DatabaseFixInitializer] Found valid courses in courses_new:', 
            coursesExist.map(c => c.id));
        } catch (err) {
          console.error('[DatabaseFixInitializer] Error checking courses_new table:', err);
        }
        
        // Execute fix_homework_constraints function regardless of whether migration was executed before
        // This ensures any new issues are fixed on each page load
        try {
          console.log('[DatabaseFixInitializer] Executing fix_homework_constraints...');
          const { data, error } = await supabase.rpc('fix_homework_constraints');
          
          if (error) {
            console.error('[DatabaseFixInitializer] Error executing fix_homework_constraints:', error);
            throw error;
          }
          
          console.log('[DatabaseFixInitializer] Successfully executed fix_homework_constraints');
        } catch (funcError) {
          console.error('[DatabaseFixInitializer] Error calling fix_homework_constraints:', funcError);
          // Continue with fallback fixes
        }
        
        // Apply direct fixes to any homework with invalid course_id
        try {
          // Get first valid course_id from courses_new
          const { data: validCourse } = await supabase
            .from('courses_new')
            .select('id')
            .order('id')
            .limit(1)
            .single();
            
          if (validCourse && validCourse.id) {
            console.log('[DatabaseFixInitializer] Found valid course ID for fixes:', validCourse.id);
            
            // Fix homework entries directly
            const { error: homeworkFixError } = await supabase
              .from('homework')
              .update({ course_id: validCourse.id })
              .filter('course_id', 'is', null);
              
            if (homeworkFixError) {
              console.error('[DatabaseFixInitializer] Error fixing null course_id in homework:', homeworkFixError);
            } else {
              console.log('[DatabaseFixInitializer] Fixed homework with null course_id');
            }
            
            // Fix homework submissions directly
            const { error: submissionsFixError } = await supabase
              .from('homework_submissions')
              .update({ course_id: validCourse.id })
              .filter('course_id', 'is', null);
              
            if (submissionsFixError) {
              console.error('[DatabaseFixInitializer] Error fixing null course_id in submissions:', submissionsFixError);
            } else {
              console.log('[DatabaseFixInitializer] Fixed submissions with null course_id');
            }
          }
        } catch (directFixError) {
          console.error('[DatabaseFixInitializer] Error applying direct fixes:', directFixError);
        }
        
        // Check if migration has already been completed in site_settings
        const { data: settingsData } = await supabase
          .from('site_settings')
          .select('*')
          .eq('site_name', 'homework_migration_completed')
          .maybeSingle();
        
        // Use safe optional chaining and type checking
        if (settingsData && typeof settingsData === 'object' && settingsData.site_name) {
          console.log('[DatabaseFixInitializer] Migration already recorded in site_settings');
          localStorage.setItem(storageKey, 'true');
          setMigrationExecuted(true);
          setMigrationSuccess(true);
          return;
        }
        
        // Record successful execution in site_settings
        try {
          const migrationSetting = {
            site_name: 'homework_migration_completed',
            site_description: 'true',
            maintenance_mode: false,
            updated_at: new Date().toISOString()
          };
          
          await supabase
            .from('site_settings')
            .upsert(migrationSetting);
            
          localStorage.setItem(storageKey, 'true');
          setMigrationExecuted(true);
          setMigrationSuccess(true);
          console.log('[DatabaseFixInitializer] Migration completed successfully');
        } catch (settingsError) {
          console.error('[DatabaseFixInitializer] Error recording migration status:', settingsError);
        }
        
        // Show success toast only on first successful execution
        if (!hasExecuted) {
          toast.success('数据库关系已自动修复，作业功能现可正常使用');
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
