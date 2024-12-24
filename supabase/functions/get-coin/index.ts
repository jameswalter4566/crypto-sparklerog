import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { fetchFromPumpApi } from "../_shared/pump-api.ts";
import { mapPumpApiData } from "../_shared/coin-mapper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchCoinData(tokenAddress: string, supabase: any) {
  console.log('Fetching data for token:', tokenAddress);

  try {
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
        return existingData;
      }
    }

    // Try search endpoint first
    const searchResponse = await fetchFromPumpApi('/coins', {
      searchTerm: tokenAddress,
      limit: 50
    });

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log('Search API Response:', JSON.stringify(searchData, null, 2));
      
      if (Array.isArray(searchData)) {
        const matchingToken = searchData.find(item => 
          item.mint?.toLowerCase() === tokenAddress.toLowerCase() ||
          item.address?.toLowerCase() === tokenAddress.toLowerCase()
        );
        
        if (matchingToken) {
          console.log('Found matching token in search results');
          return mapPumpApiData(matchingToken, tokenAddress);
        }
      }
    }

    // If search fails, try direct endpoint with retries
    const maxRetries = 3;
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const directResponse = await fetchFromPumpApi(`/coins/${tokenAddress}`, {});
        
        if (!directResponse.ok) {
          const errorText = await directResponse.text();
          throw new Error(`API error: ${directResponse.status}. Response: ${errorText}`);
        }

        const directData = await directResponse.json();
        return mapPumpApiData(directData, tokenAddress);
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        lastError = error instanceof Error ? error : new Error('Unknown error occurred');
        
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // Return existing data as fallback if all attempts fail
    if (existingData) {
      console.log('All API attempts failed, using existing data as fallback');
      return existingData;
    }

    throw lastError || new Error('Failed to fetch data after all attempts');
  } catch (error) {
    console.error('Error in fetchCoinData:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const tokenAddress = url.searchParams.get('id');

    if (!tokenAddress) {
      throw new Error('Token ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const coinData = await fetchCoinData(tokenAddress, supabase);
    
    if (!coinData) {
      throw new Error('Failed to fetch coin data');
    }

    const { error: upsertError } = await supabase
      .from('coins')
      .upsert(coinData, {
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