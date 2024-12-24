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

    if (existingData) {
      const lastUpdate = new Date(existingData.updated_at || '');
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      if (lastUpdate > fiveMinutesAgo) {
        console.log('Using cached data from database');
        return new Response(
          JSON.stringify(existingData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Try search endpoint with captcha token
    console.log('Fetching from Pump API with params:', {
      searchTerm: tokenAddress,
      captchaToken: captchaToken ? 'present' : 'missing'
    });

    const searchResponse = await fetchFromPumpApi('/coins', {
      searchTerm: tokenAddress,
      limit: 50,
      sort: 'market_cap',
      order: 'DESC',
      includeNsfw: false,
      captchaToken
    });

    if (!searchResponse.ok) {
      console.error('Pump API error:', await searchResponse.text());
      throw new Error(`Pump API error: ${searchResponse.status}`);
    }

    let searchData;
    try {
      const responseText = await searchResponse.text();
      console.log('Raw API response:', responseText);
      searchData = JSON.parse(responseText);
    } catch (error) {
      console.error('JSON parse error:', error);
      throw new Error('Invalid response from Pump API');
    }

    console.log('Parsed search data:', searchData);
    
    if (!Array.isArray(searchData)) {
      throw new Error('Unexpected API response format');
    }
    
    let coinData: CoinData | null = null;
    
    const matchingToken = searchData.find(item => 
      item.mint?.toLowerCase() === tokenAddress.toLowerCase()
    );
    
    if (matchingToken) {
      console.log('Found matching token:', matchingToken);
      coinData = mapPumpApiToCoinData(matchingToken);
    }

    if (!coinData) {
      throw new Error('Token not found');
    }

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

    return new Response(
      JSON.stringify(coinData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

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