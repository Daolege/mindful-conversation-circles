
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

interface MigrationResult {
  success: boolean;
  count: number;
  error?: any;
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
    const newHomeworkData = oldHomeworkData.map((submission: HomeworkSubmission) => ({
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
    const { data: insertedData, error: insertError } = await supabase
      .from('assignment_submissions_new')
      .insert(newHomeworkData)
      .select();
    
    if (insertError) {
      console.error("Error inserting transformed homework data:", insertError);
      return { success: false, count: 0, error: insertError };
    }
    
    // Step 4: Update migration tracking table
    await supabase
      .from('data_migrations')
      .insert({
        user_id: userId,
        migration_type: 'homework',
        status: 'completed',
        processed_records: newHomeworkData.length,
        completed_at: new Date().toISOString()
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
