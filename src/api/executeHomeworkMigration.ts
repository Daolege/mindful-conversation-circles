
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const executeHomeworkMigration = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  console.log('[executeHomeworkMigration] Starting homework migration');
  
  try {
    // 1. Drop existing foreign key
    // Using raw SQL query instead of RPC to avoid TypeScript errors
    const dropResult = await supabase.from('_migrations_temp').select('*').limit(1).then(() => {
      return supabase.rpc('drop_homework_foreign_key').then(res => res);
    }).catch(err => {
      console.error('Drop foreign key error:', err);
      return { error: err };
    });
    
    console.log('[executeHomeworkMigration] Drop foreign key result:', dropResult);
    
    // 2. Add new foreign key pointing to courses_new
    const addResult = await supabase.from('_migrations_temp').select('*').limit(1).then(() => {
      return supabase.rpc('add_homework_foreign_key').then(res => res);
    }).catch(err => {
      console.error('Add foreign key error:', err);
      return { error: err };
    });
    
    console.log('[executeHomeworkMigration] Add foreign key result:', addResult);
    
    // 3. Verify foreign keys
    const verifyResult = await supabase.from('_migrations_temp').select('*').limit(1).then(() => {
      return supabase.rpc('get_foreign_keys', { table_name: 'homework' }).then(res => res);
    }).catch(err => {
      console.error('Verify keys error:', err);
      return { error: err };
    });
    
    console.log('[executeHomeworkMigration] Foreign key verification:', verifyResult);
    
    // Check for errors in any step
    if (dropResult.error || addResult.error || verifyResult.error) {
      const error = dropResult.error || addResult.error || verifyResult.error;
      throw new Error(`Migration failed: ${error.message || 'Unknown error'}`);
    }
    
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
