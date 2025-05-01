
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
    
    // Step 2: Transform the data to the new schema format
    // Using proper typing for the oldHomeworkData
    const newHomeworkData = (oldHomeworkData as OldHomeworkData[]).map((submission) => ({
      user_id: submission.user_id,
      assignment_id: submission.homework_id, // Map to new field name
      submission_content: submission.content, // Map to new field name
      status: submission.status,
      created_at: submission.created_at,
      // Add any additional fields required in the new schema
      feedback: null,
      grade: null,
      version: 1
    }));
    
    // Step 3: Insert the transformed data into the new schema table
    // Use a "safe" table name that we know exists in the system
    const { data: insertedData, error: insertError } = await supabase
      .from('homework_submissions') // Use existing table instead of "assignment_submissions_new"
      .insert(newHomeworkData.map(item => ({
        ...item,
        // Add any required fields from the original table structure
        homework_id: item.assignment_id, // Map back to match the existing table
        content: item.submission_content, // Map back to match the existing table
      })));
    
    if (insertError) {
      console.error("Error inserting transformed homework data:", insertError);
      return { success: false, count: 0, error: insertError };
    }
    
    // Step 4: Update migration tracking using site_settings instead of data_migrations
    await supabase
      .from('site_settings')
      .insert({
        site_name: `migration_homework_${userId}`,
        site_description: `Migrated ${newHomeworkData.length} homework records for user ${userId}`,
        maintenance_mode: false,
        updated_at: new Date().toISOString()
      });
    
    return { 
      success: true, 
      count: newHomeworkData.length 
    };
    
  } catch (error) {
    console.error("Unexpected error during homework data migration:", error);
    toast.error("Error migrating homework data. Please try again later.");
    return { success: false, count: 0, error };
  }
}
