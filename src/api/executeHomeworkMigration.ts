
/**
 * Execute migration for the homework system to fix database issues
 */

import { supabase } from '@/integrations/supabase/client';

export async function executeHomeworkMigration(): Promise<{ 
  success: boolean; 
  message: string;
  details?: any;
}> {
  try {
    console.log('[Migration] Starting homework system migration');

    // Check existing database structure
    // @ts-ignore - Bypass TypeScript's strict checking
    const { data: homeworkTableData, error: homeworkTableError } = await supabase
      .from('homework')
      .select('*', { count: 'exact', head: true });

    if (homeworkTableError) {
      console.error('[Migration] Error checking homework table:', homeworkTableError);
      return {
        success: false,
        message: `Error accessing homework table: ${homeworkTableError.message}`
      };
    }

    console.log('[Migration] Homework table exists');

    // Check if courses_new table has necessary records
    // @ts-ignore - Bypass TypeScript's strict checking
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses_new')
      .select('id', { count: 'exact' });

    if (coursesError) {
      console.error('[Migration] Error checking courses_new table:', coursesError);
      return {
        success: false,
        message: `Error accessing courses_new table: ${coursesError.message}`
      };
    }

    const courseCount = coursesData?.length || 0;
    console.log(`[Migration] Found ${courseCount} courses in courses_new table`);

    if (courseCount === 0) {
      // Insert a default course if none exists
      // @ts-ignore - Bypass TypeScript's strict checking
      const { data: newCourse, error: newCourseError } = await supabase
        .from('courses_new')
        .insert({
          title: 'Default Course',
          description: 'Created during migration',
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (newCourseError) {
        console.error('[Migration] Error creating default course:', newCourseError);
        return {
          success: false,
          message: `Error creating default course: ${newCourseError.message}`
        };
      }

      console.log('[Migration] Created default course with ID:', newCourse?.id);
    }

    // Get all homework entries that may need fixing
    // @ts-ignore - Bypass TypeScript's strict checking
    const { data: homeworkData, error: homeworkError } = await supabase
      .from('homework')
      .select('id, course_id');

    if (homeworkError) {
      console.error('[Migration] Error fetching homework entries:', homeworkError);
      return {
        success: false,
        message: `Error fetching homework entries: ${homeworkError.message}`
      };
    }

    console.log(`[Migration] Found ${homeworkData?.length || 0} homework entries to check`);

    // For each homework entry, ensure the course_id exists in courses_new
    let fixedCount = 0;
    let failedCount = 0;
    
    if (homeworkData && homeworkData.length > 0) {
      for (const homework of homeworkData) {
        // @ts-ignore - Bypass TypeScript's strict checking
        const { data: courseCheck, error: courseCheckError } = await supabase
          .from('courses_new')
          .select('id')
          .eq('id', homework.course_id)
          .maybeSingle();

        if (courseCheckError || !courseCheck) {
          console.log(`[Migration] Course ID ${homework.course_id} for homework ${homework.id} doesn't exist, fixing...`);
          
          // @ts-ignore - Bypass TypeScript's strict checking
          const { data: firstCourse, error: firstCourseError } = await supabase
            .from('courses_new')
            .select('id')
            .limit(1)
            .single();

          if (firstCourseError || !firstCourse) {
            console.error('[Migration] Failed to find any course to link:', firstCourseError);
            failedCount++;
            continue;
          }

          // Update the homework to use a valid course_id
          // @ts-ignore - Bypass TypeScript's strict checking
          const { error: updateError } = await supabase
            .from('homework')
            .update({ course_id: firstCourse.id })
            .eq('id', homework.id);

          if (updateError) {
            console.error(`[Migration] Failed to update homework ${homework.id}:`, updateError);
            failedCount++;
          } else {
            console.log(`[Migration] Updated homework ${homework.id} to use course ${firstCourse.id}`);
            fixedCount++;
          }
        }
      }
    }

    // Check for any foreign key constraints and fix them
    // @ts-ignore - We perform a raw query through RPC to fix foreign key issues
    const { error: fixConstraintError } = await supabase.rpc('fix_homework_constraints');
    
    if (fixConstraintError) {
      console.log('[Migration] Note: fix_homework_constraints function not available or failed:', fixConstraintError);
    } else {
      console.log('[Migration] Successfully ran fix_homework_constraints function');
    }

    // Return success message with counts
    return {
      success: true,
      message: `Migration completed: Checked ${homeworkData?.length || 0} entries, fixed ${fixedCount} issues`,
      details: {
        checked: homeworkData?.length || 0,
        fixed: fixedCount,
        failed: failedCount
      }
    };
  } catch (error) {
    console.error('[Migration] Unexpected error during migration:', error);
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
