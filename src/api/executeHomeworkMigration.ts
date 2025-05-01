
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
    
    // Check if migration was already executed by looking at site_settings
    const { data: settingsResult, error: settingsError } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'homework_migration_completed');
    
    if (settingsError) {
      console.error('[executeHomeworkMigration] Error checking migration status:', settingsError);
    }
    
    if (Array.isArray(settingsResult) && settingsResult.length > 0) {
      console.log('[executeHomeworkMigration] Migration already executed successfully');
      return { 
        success: true, 
        message: '数据库关系修复已经完成' 
      };
    }
    
    console.log('[executeHomeworkMigration] Executing migration');
    
    // 2. Check for orphaned homework records using direct DB query
    const { data: homeworkResult, error: homeworkError } = await supabase
      .from('homework')
      .select('*');
      
    if (homeworkError) {
      console.error('[executeHomeworkMigration] Error querying homework:', homeworkError);
    }
    
    // Safely handle the homework data
    const homeworks = Array.isArray(homeworkResult) ? homeworkResult : [];
    
    if (homeworks.length > 0) {
      console.log(`[executeHomeworkMigration] Found ${homeworks.length} homework records`);
      
      // Extract course IDs safely
      const courseIds = homeworks
        .filter(hw => hw && hw.course_id)
        .map(hw => hw.course_id);
      
      const uniqueCourseIds = [...new Set(courseIds)];
      
      if (uniqueCourseIds.length > 0) {
        // Check which ones are orphaned by checking course existence
        const { data: coursesResult, error: coursesError } = await supabase
          .from('courses_new')
          .select('id')
          .in('id', uniqueCourseIds);
          
        if (coursesError) {
          console.error('[executeHomeworkMigration] Error checking courses:', coursesError);
        }
        
        const courses = Array.isArray(coursesResult) ? coursesResult : [];
        
        if (courses) {
          const validCourseIds = courses.map(c => c.id);
          const orphanedHomeworks = homeworks.filter(hw => hw.course_id && !validCourseIds.includes(hw.course_id));
          
          if (orphanedHomeworks.length > 0) {
            console.log(`[executeHomeworkMigration] Found ${orphanedHomeworks.length} orphaned homework records`);
            
            // Delete orphaned records
            for (const hw of orphanedHomeworks) {
              if (hw && hw.id) {
                const { error: deleteError } = await supabase
                  .from('homework')
                  .delete()
                  .eq('id', hw.id);
                  
                if (deleteError) {
                  console.error(`[executeHomeworkMigration] Error deleting homework ${hw.id}:`, deleteError);
                }
              }
            }
            
            console.log(`[executeHomeworkMigration] Deleted ${orphanedHomeworks.length} orphaned homework records`);
          } else {
            console.log('[executeHomeworkMigration] No orphaned homework records found');
          }
        }
      }
    } else {
      console.log('[executeHomeworkMigration] No homework records found');
    }
    
    // 3. Record successful migration
    await recordMigration(
      migrationName,
      "Fixed homework foreign key constraints",
      true
    );
    
    // 4. Update site settings to remember migration was completed
    await supabase
      .from('site_settings')
      .insert({
        key: 'homework_migration_completed',
        value: 'true'
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
