
// This edge function will clean up homework data with invalid course_id references
// and establish proper foreign key relationship to courses_new

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context from the request
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting homework data cleanup');
    
    // Step 1: Find and log problematic homework records
    const { data: orphanedHomework, error: orphanError } = await supabase
      .from('homework')
      .select('id, title, course_id')
      .not('course_id', 'in', '(select id from courses_new)');
    
    if (orphanError) {
      throw new Error(`Error finding orphaned homework: ${orphanError.message}`);
    }
    
    console.log(`Found ${orphanedHomework?.length || 0} orphaned homework records`, orphanedHomework);

    // Step 2: Remove the existing foreign key constraint if it exists
    try {
      const { data: fkResult, error: fkError } = await supabase.rpc('drop_homework_foreign_key');
      if (fkError) {
        console.error('Error dropping foreign key:', fkError);
      } else {
        console.log('Foreign key constraint removed if it existed:', fkResult);
      }
    } catch (err) {
      console.error('Error in drop foreign key function:', err);
      // Proceed even if this fails
    }
    
    // Step 3: Delete orphaned homework records that don't reference valid courses_new entries
    if (orphanedHomework && orphanedHomework.length > 0) {
      const orphanIds = orphanedHomework.map(hw => hw.id);
      const { data: deleteResult, error: deleteError } = await supabase
        .from('homework')
        .delete()
        .in('id', orphanIds);
        
      if (deleteError) {
        throw new Error(`Error deleting orphaned homework: ${deleteError.message}`);
      }
      
      console.log('Deleted orphaned homework records');
    }
    
    // Step 4: Add the correct foreign key constraint
    const { data: addFkResult, error: addFkError } = await supabase.rpc('add_homework_foreign_key');
    if (addFkError) {
      throw new Error(`Error adding foreign key: ${addFkError.message}`);
    }
    
    console.log('Added new foreign key constraint:', addFkResult);
    
    // Step 5: Verify homework data is consistent
    const { data: verifyData, error: verifyError } = await supabase
      .from('homework')
      .select('course_id')
      .not('course_id', 'in', '(select id from courses_new)')
      .limit(1);
      
    if (verifyError) {
      throw new Error(`Error verifying data: ${verifyError.message}`);
    }
    
    if (verifyData && verifyData.length > 0) {
      throw new Error('Data inconsistency found, some homework records still reference invalid courses');
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Homework data cleaned and foreign key constraint established',
        orphanedCount: orphanedHomework?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error during homework data cleanup:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
