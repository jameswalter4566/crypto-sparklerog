import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { fetchFromPumpApi } from "../_shared/pump-api.ts";
import { mapPumpApiToCoinData } from "../_shared/coin-mapper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'GET') {
      throw new Error('Method not allowed');
    }

    const url = new URL(req.url);
    const tokenAddress = url.searchParams.get('id');

    if (!tokenAddress) {
      return new Response(
        JSON.stringify({ error: 'Token ID is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Processing request for token:', tokenAddress);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // First check if we have the coin in our database
    const { data: existingData, error: dbError } = await supabase
      .from('coins')
      .select('*')
      .eq('id', tokenAddress)
      .maybeSingle();

    if (dbError && dbError.code !== 'PGRST116') {
      console.error('Database error:', dbError);
      throw dbError;
    }

    if (existingData) {
      console.log('Found existing coin data:', existingData);
      return new Response(
        JSON.stringify(existingData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If not in database, fetch from Pump API
    console.log('Fetching from Pump API for token:', tokenAddress);
    try {
      const pumpData = await fetchFromPumpApi(`/coins/${tokenAddress}`, {});

      if (!pumpData || !pumpData.mint) {
        console.error('Invalid or empty response from Pump API:', pumpData);
        return new Response(
          JSON.stringify({ error: 'Token not found or invalid response from API' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const coinData = mapPumpApiToCoinData(pumpData);

      // Insert the new coin data into our database
      const { error: upsertError } = await supabase
        .from('coins')
        .upsert({
          ...coinData,
          updated_at: new Date().toISOString()
        });

      if (upsertError) {
        console.error('Error upserting data:', upsertError);
        throw upsertError;
      }

      return new Response(
        JSON.stringify(coinData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (apiError) {
      console.error('API error:', apiError);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch token data',
          details: apiError instanceof Error ? apiError.message : 'Unknown error'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('Error in get-coin function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});