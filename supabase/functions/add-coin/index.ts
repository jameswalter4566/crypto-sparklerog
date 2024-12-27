import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get request body
    const { solana_addr } = await req.json()
    
    if (!solana_addr) {
      return new Response(
        JSON.stringify({ error: 'Missing solana_addr in request body' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Processing request for solana address:', solana_addr)

    // Your existing coin fetching logic here
    const { data, error } = await supabaseClient
      .from('coins')
      .select('*')
      .eq('solana_address', solana_addr)
      .single();

    if (error) {
      console.error('Error fetching coin:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch coin data' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (data) {
      return new Response(
        JSON.stringify(data),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // If coin doesn't exist, insert it
    const { error: insertError } = await supabaseClient
      .from('coins')
      .insert([{ solana_address: solana_addr }]);

    if (insertError) {
      console.error('Error inserting coin:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to insert coin data' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Coin added successfully' }),
      { 
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in add-coin function:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred while processing the request',
        details: error
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
