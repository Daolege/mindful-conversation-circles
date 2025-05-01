
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define explicit interfaces to avoid deep type instantiation
interface HomeworkSubmission {
  id: string;
  user_id: string;
  homework_id: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface OldHomeworkData {
  id: string;
  user_id: string;
  homework_id: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
  answer?: string;
  course_id?: number;
  lecture_id?: string;
  submitted_at?: string;
  file_url?: string;
  [key: string]: any;
}

interface MigrationResult {
  success: boolean;
  count: number;
  error?: any;
}

/**
 * Records a migration operation in the database
 */
export async function recordMigration(
  name: string,
  description: string,
  success: boolean
): Promise<boolean> {
  try {
    // Insert migration record into the table
    const { error } = await supabase
      .from('site_settings')
      .insert({
        site_name: `migration_${name}`,
        site_description: description,
        maintenance_mode: false,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error("Error recording migration:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Unexpected error recording migration:", error);
    return false;
  }
}

/**
 * A function to migrate homework data from the old schema to the new schema.
 * This is used for the transition to the new system.
 */
export async function migrateHomeworkData(userId: string): Promise<MigrationResult> {
  try {
    // Step 1: Get all homework submissions for the user from the old schema
    const { data: oldHomeworkData, error: fetchError } = await supabase
      .from('homework_submissions')
      .select('*')
      .eq('user_id', userId);
    
    if (fetchError) {
      console.error("Error fetching old homework data:", fetchError);
      return { success: false, count: 0, error: fetchError };
    }
    
    if (!oldHomeworkData || oldHomeworkData.length === 0) {
      // No data to migrate
      return { success: true, count: 0 };
    }
    
    // Ensure we transform the data correctly regardless of the schema
    const transformedData = oldHomeworkData.map((submission: any) => {
      // Handle various field formats
      return {
        user_id: submission.user_id,
        homework_id: submission.homework_id, 
        content: submission.content || submission.answer || "", 
        status: submission.status || "submitted",
        created_at: submission.created_at || submission.submitted_at || new Date().toISOString(),
        updated_at: submission.updated_at || new Date().toISOString(),
        feedback: submission.feedback || submission.teacher_comment || null,
        grade: submission.grade || submission.score || null,
        version: 1
      };
    });
    
    // Step 3: Insert or update the data in the homework_submissions table
    const { error: insertError } = await supabase
      .from('homework_submissions')
      .upsert(transformedData, { 
        onConflict: 'user_id,homework_id',
        ignoreDuplicates: false
      });
    
    if (insertError) {
      console.error("Error inserting transformed homework data:", insertError);
      return { success: false, count: 0, error: insertError };
    }
    
    // Step 4: Update migration tracking using site_settings instead of data_migrations
    await recordMigration(
      `homework_${userId}`,
      `Migrated ${transformedData.length} homework records for user ${userId}`,
      true
    );
    
    return { 
      success: true, 
      count: transformedData.length 
    };
    
  } catch (error) {
    console.error("Unexpected error during homework data migration:", error);
    toast.error("Error migrating homework data. Please try again later.");
    return { success: false, count: 0, error };
  }
}
