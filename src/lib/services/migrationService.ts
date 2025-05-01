
import { supabase } from '@/integrations/supabase/client';
import { saveCourse } from './courseService';

// Define the return type for table existence check
interface TableExistsResponse {
  exists: boolean;
  error: Error | null;
}

/**
 * Check if a table exists in the database
 */
export const tableExists = async (tableName: string): Promise<TableExistsResponse> => {
  try {
    // Use a query that will return rows only if the table exists
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('tablename', tableName)
      .eq('schemaname', 'public')
      .single();

    if (error) {
      console.error(`[migrationService] Error checking if table ${tableName} exists:`, error);
      return { exists: false, error };
    }

    return { exists: !!data, error: null };
  } catch (err) {
    console.error(`[migrationService] Unexpected error checking if table ${tableName} exists:`, err);
    return { exists: false, error: err as Error };
  }
};

/**
 * Migrates courses from the old format to the new format
 */
export const migrateCourses = async (): Promise<{
  success: boolean;
  migratedCount: number;
  error: Error | null;
}> => {
  try {
    // Check if both tables exist
    const oldTableExists = await tableExists('courses');
    const newTableExists = await tableExists('courses_new');

    if (oldTableExists.error || !oldTableExists.exists) {
      console.error('[migrationService] Old courses table does not exist');
      return { success: false, migratedCount: 0, error: new Error('Old courses table does not exist') };
    }

    if (newTableExists.error || !newTableExists.exists) {
      console.error('[migrationService] New courses_new table does not exist');
      return { success: false, migratedCount: 0, error: new Error('New courses_new table does not exist') };
    }

    // Get all courses from the old table
    const { data: oldCourses, error: fetchError } = await supabase
      .from('courses')
      .select('*');

    if (fetchError) {
      console.error('[migrationService] Error fetching old courses:', fetchError);
      return { success: false, migratedCount: 0, error: fetchError as Error };
    }

    if (!oldCourses || oldCourses.length === 0) {
      console.log('[migrationService] No courses to migrate');
      return { success: true, migratedCount: 0, error: null };
    }

    // Migrate each course
    let migratedCount = 0;
    const migrationPromises = oldCourses.map(async (oldCourse) => {
      // Map old course to new format
      const newCourse = {
        title: oldCourse.title,
        description: oldCourse.description || '',
        price: oldCourse.price || 0,
        original_price: oldCourse.originalprice || null,
        currency: oldCourse.currency || 'cny',
        category: oldCourse.category || '',
        status: 'draft',
        is_featured: oldCourse.featured || false,
        display_order: oldCourse.display_order || 0,
        enrollment_count: oldCourse.studentCount || 0,
        instructor_id: oldCourse.instructor_id || null,
        lecture_count: oldCourse.lectures || 0,
        published_at: oldCourse.published_at || null,
      };

      // Save the new course
      const result = await saveCourse(newCourse);
      if (result.error) {
        console.error(`[migrationService] Error migrating course ${oldCourse.id}:`, result.error);
        return false;
      }

      migratedCount++;
      return true;
    });

    await Promise.all(migrationPromises);

    console.log(`[migrationService] Successfully migrated ${migratedCount} courses`);
    return { success: true, migratedCount, error: null };
  } catch (err) {
    console.error('[migrationService] Unexpected error during course migration:', err);
    return { success: false, migratedCount: 0, error: err as Error };
  }
};

/**
 * Fixes missing columns or inconsistencies in the database schema
 */
export const fixDatabaseSchema = async (): Promise<{ success: boolean; error: Error | null }> => {
  try {
    // List of queries to run to fix the database schema
    const fixes = [
      `ALTER TABLE IF EXISTS courses_new 
       ADD COLUMN IF NOT EXISTS lecture_count INTEGER DEFAULT 0`,
      
      `ALTER TABLE IF EXISTS courses_new 
       ADD COLUMN IF NOT EXISTS enrollment_count INTEGER DEFAULT 0`,
      
      `ALTER TABLE IF EXISTS courses_new 
       ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false`,
      
      `ALTER TABLE IF EXISTS courses_new 
       ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0`,
      
      `ALTER TABLE IF EXISTS courses_new 
       ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'`,
      
      `ALTER TABLE IF EXISTS courses_new 
       ADD COLUMN IF NOT EXISTS instructor_id TEXT`,
      
      `ALTER TABLE IF EXISTS courses_new 
       ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE`,
      
      `ALTER TABLE IF EXISTS courses_new 
       ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'cny'`
    ];

    // Run each fix query
    for (const query of fixes) {
      const { error } = await supabase.rpc('execute_sql', { sql_query: query });
      
      if (error) {
        console.error(`[migrationService] Error running fix query: ${query}`, error);
        // Continue with other fixes even if one fails
      }
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('[migrationService] Unexpected error during schema fix:', err);
    return { success: false, error: err as Error };
  }
};

// Safely get a table from the supabase client
const safeFrom = (tableName: string) => {
  // Using type assertion to handle dynamic table names
  return supabase.from(tableName as any);
};
