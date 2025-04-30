
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

// Add CORS headers to enable calling the function from the browser
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Create FAQs table if it doesn't exist
    const createFAQsTable = `
      CREATE TABLE IF NOT EXISTS public.faqs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `

    // Create feedback table if it doesn't exist
    const createFeedbackTable = `
      CREATE TABLE IF NOT EXISTS public.feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_email TEXT,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `

    // Execute the SQL queries
    const { error: faqError } = await supabaseAdmin.rpc('pgqueryprivate', { query: createFAQsTable });
    if (faqError) {
      console.error("Error creating FAQs table:", faqError);
      return new Response(
        JSON.stringify({ error: "Failed to create FAQs table", details: faqError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { error: feedbackError } = await supabaseAdmin.rpc('pgqueryprivate', { query: createFeedbackTable });
    if (feedbackError) {
      console.error("Error creating feedback table:", feedbackError);
      return new Response(
        JSON.stringify({ error: "Failed to create feedback table", details: feedbackError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Tables created successfully" }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
