import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchPumpFunData(tokenAddress: string) {
  console.log('Fetching data from Pump.fun for token:', tokenAddress);

  try {
    // First try to fetch specific coin data
    const url = `https://frontend-api-v2.pump.fun/coins/${tokenAddress}`;
    console.log('Fetching from URL:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      // If specific coin fetch fails, try the search endpoint
      const searchUrl = `https://frontend-api-v2.pump.fun/coins?searchTerm=${tokenAddress}`;
      console.log('Trying search endpoint:', searchUrl);
      
      const searchResponse = await fetch(searchUrl);
      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error('Both endpoints failed. Search API error response:', errorText);
        throw new Error(`API error: ${searchResponse.status}. Response: ${errorText}`);
      }

      const searchData = await searchResponse.json();
      console.log('Search API Response:', JSON.stringify(searchData, null, 2));
      
      // If we got an array, take the first matching item
      const data = Array.isArray(searchData) ? searchData.find(item => item.mint === tokenAddress) : searchData;
      
      if (!data) {
        throw new Error('Token not found in search results');
      }
      
      return mapPumpFunData(data, tokenAddress);
    }

    const data = await response.json();
    console.log('Direct API Response:', JSON.stringify(data, null, 2));
    return mapPumpFunData(data, tokenAddress);

  } catch (error) {
    console.error('Error fetching from Pump.fun:', error);
    throw error;
  }
}

function mapPumpFunData(data: any, tokenAddress: string) {
  console.log('Mapping data for token:', tokenAddress);
  
  try {
    // Enhanced validation
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data structure received from API');
    }

    // Map the data with careful type checking
    const mappedData = {
      id: tokenAddress,
      name: data.name || 'Unknown Token',
      symbol: data.symbol || '???',
      image_url: data.image_uri || data.image || null,
      price: typeof data.price === 'number' ? data.price : null,
      change_24h: typeof data.price_change_24h === 'number' ? data.price_change_24h : null,
      market_cap: typeof data.market_cap === 'number' ? data.market_cap : null,
      usd_market_cap: typeof data.usd_market_cap === 'number' ? data.usd_market_cap : null,
      volume_24h: typeof data.volume_24h === 'number' ? data.volume_24h : null,
      liquidity: typeof data.virtual_sol_reserves === 'number' ? data.virtual_sol_reserves : null,
      total_supply: typeof data.total_supply === 'number' ? data.total_supply : null,
      circulating_supply: typeof data.circulating_supply === 'number' ? data.circulating_supply : null,
      non_circulating_supply: typeof data.non_circulating_supply === 'number' ? data.non_circulating_supply : null,
      updated_at: new Date().toISOString(),
      solana_addr: tokenAddress,
      description: data.description || null,
      decimals: typeof data.decimals === 'number' ? data.decimals : null,
      historic_data: Array.isArray(data.price_history) ? data.price_history : null,
      homepage: data.website || null,
      blockchain_site: Array.isArray(data.explorer_url) ? data.explorer_url : (data.explorer_url ? [data.explorer_url] : null),
      chat_url: Array.isArray(data.telegram) ? data.telegram : (data.telegram ? [data.telegram] : null),
      twitter_screen_name: data.twitter || null,
      coingecko_id: null,
      coin_id: data.mint || null,
      official_forum_url: null,
      announcement_url: null
    };

    console.log('Successfully mapped data:', JSON.stringify(mappedData, null, 2));
    return mappedData;

  } catch (err) {
    console.error('Error mapping data:', err);
    throw new Error(`Error mapping data: ${err.message}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const tokenAddress = url.searchParams.get('id');

    if (!tokenAddress) {
      throw new Error('Token ID is required');
    }

    console.log('Processing request for token:', tokenAddress);

    const coinData = await fetchPumpFunData(tokenAddress);
    
    if (!coinData) {
      throw new Error('Failed to fetch coin data');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Upsert with better error handling
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

    console.log('Successfully saved coin data to database');

    return new Response(
      JSON.stringify(coinData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
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