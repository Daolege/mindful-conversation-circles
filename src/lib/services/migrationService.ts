
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
  content?: string;
  answer?: string;
  status?: string;
  course_id?: number;
  lecture_id?: string;
  created_at?: string;
  updated_at?: string;
  submitted_at?: string;
  file_url?: string;
  [key: string]: any;
}

// Define homework_submissions table structure to match actual DB schema
interface HomeworkSubmissionDB {
  id?: string;
  user_id: string;
  homework_id: string;
  answer?: string;
  course_id: number;
  lecture_id: string;
  submitted_at?: string;
  file_url?: string;
  status?: string;
  feedback?: string | null;
  grade?: number | null;
  version?: number;
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
    
    // Ensure we transform the data correctly to match the homework_submissions table structure
    let successCount = 0;
    
    // Process each homework submission individually, as the batch upsert was causing type errors
    for (const submission of oldHomeworkData) {
      const transformedData: HomeworkSubmissionDB = {
        user_id: submission.user_id,
        homework_id: submission.homework_id,
        answer: submission.content || submission.answer || "", 
        course_id: submission.course_id || 0, // Fallback value
        lecture_id: submission.lecture_id || "", // Fallback value
        status: submission.status || "submitted",
        submitted_at: submission.created_at || submission.submitted_at || new Date().toISOString(),
        file_url: submission.file_url || null,
        feedback: submission.feedback || null,
        grade: submission.grade || null,
        version: 1
      };
      
      // Insert or update each submission individually
      const { error: insertError } = await supabase
        .from('homework_submissions')
        .upsert(transformedData)
        .select();
      
      if (!insertError) {
        successCount++;
      } else {
        console.error("Error inserting homework data:", insertError, "for submission:", transformedData);
      }
    }
    
    // Step 4: Update migration tracking using site_settings
    await recordMigration(
      `homework_${userId}`,
      `Migrated ${successCount} homework records for user ${userId}`,
      successCount > 0
    );
    
    return { 
      success: successCount > 0, 
      count: successCount 
    };
    
  } catch (error) {
    console.error("Unexpected error during homework data migration:", error);
    toast.error("Error migrating homework data. Please try again later.");
    return { success: false, count: 0, error };
  }
}
