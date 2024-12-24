import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { fetchFromPumpApi } from "../_shared/pump-api.ts";
import { mapPumpApiToCoinData } from "../_shared/coin-mapper.ts";
import { CoinData } from "../_shared/types.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const tokenAddress = url.searchParams.get('id');
    const captchaToken = url.searchParams.get('captchaToken');

    if (!tokenAddress) {
      throw new Error('Token ID is required');
    }

    console.log('Processing request for token:', tokenAddress);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check existing data first
    const { data: existingData, error: dbError } = await supabase
      .from('coins')
      .select('*')
      .eq('id', tokenAddress)
      .single();

    if (dbError && dbError.code !== 'PGRST116') {
      console.error('Database error:', dbError);
      throw dbError;
    }

    // Fetch fresh data from API
    console.log('Fetching fresh data from Pump API for token:', tokenAddress);
    
    try {
      const searchData = await fetchFromPumpApi('/coins', {
        searchTerm: tokenAddress,
        limit: 50,
        sort: 'market_cap',
        order: 'DESC',
        includeNsfw: false,
        captchaToken
      });

      if (!Array.isArray(searchData)) {
        console.error('Unexpected response format:', searchData);
        throw new Error('API response is not an array');
      }

      console.log('Found', searchData.length, 'tokens in search results');
      
      const matchingToken = searchData.find(item => 
        item.mint?.toLowerCase() === tokenAddress.toLowerCase()
      );
      
      if (!matchingToken) {
        console.log('No matching token found in search results');
        if (existingData) {
          console.log('Returning existing data as fallback');
          return new Response(
            JSON.stringify(existingData),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        throw new Error('Token not found');
      }

      console.log('Raw Pump.fun API Response:', matchingToken);
      console.log('USD Market Cap from API:', matchingToken.usd_market_cap);

      const coinData = mapPumpApiToCoinData(matchingToken);
      console.log('Mapped coin data before upsert:', coinData);

      // Update database with new data
      const { error: upsertError } = await supabase
        .from('coins')
        .upsert({
          ...coinData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error('Error upserting data to Supabase:', upsertError);
        throw upsertError;
      }

      // Verify the data was stored correctly
      const { data: verifyData, error: verifyError } = await supabase
        .from('coins')
        .select('*')
        .eq('id', coinData.id)
        .single();

      if (verifyError) {
        console.error('Error verifying stored data:', verifyError);
      } else {
        console.log('Verified stored data:', verifyData);
      }

      console.log('Successfully updated database with new coin data');

      return new Response(
        JSON.stringify(coinData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (apiError) {
      console.error('API error:', apiError);
      
      // If we have existing data, return it as fallback
      if (existingData) {
        console.log('Returning existing data as fallback');
        return new Response(
          JSON.stringify(existingData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw apiError;
    }

  } catch (error) {
    console.error('Error in get-coin function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});