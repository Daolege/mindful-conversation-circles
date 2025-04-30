
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const executeHomeworkMigration = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  console.log('[executeHomeworkMigration] Starting homework migration');
  
  try {
    // 1. Drop existing foreign key
    const dropResult = await supabase.rpc('drop_homework_foreign_key');
    console.log('[executeHomeworkMigration] Drop foreign key result:', dropResult);
    
    // 2. Add new foreign key pointing to courses_new
    const addResult = await supabase.rpc('add_homework_foreign_key');
    console.log('[executeHomeworkMigration] Add foreign key result:', addResult);
    
    // 3. Verify foreign keys
    const verifyResult = await supabase.rpc('get_foreign_keys', { table_name: 'homework' });
    console.log('[executeHomeworkMigration] Foreign key verification:', verifyResult);
    
    return {
      success: true,
      message: 'Successfully updated homework foreign key constraints'
    };
  } catch (error: any) {
    console.error('[executeHomeworkMigration] Error:', error);
    return {
      success: false,
      message: `Migration failed: ${error.message || 'Unknown error'}`
    };
  }
};
