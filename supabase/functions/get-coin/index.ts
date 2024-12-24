import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchPumpFunData(tokenAddress: string) {
  console.log('Fetching data from Pump.fun for token:', tokenAddress);

  try {
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
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API error: ${response.status}. Response: ${errorText}`);
    }

    const rawData = await response.json();
    console.log('Raw Pump.fun API Response:', JSON.stringify(rawData, null, 2));

    // Check if rawData is an array and get the first item if it is
    const data = Array.isArray(rawData) ? rawData[0] : rawData;
    
    if (!data || !data.mint) {
      console.error('Invalid data structure received:', data);
      throw new Error('Invalid data structure received from API');
    }

    // Enhanced mapping with fallbacks and type checking
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
      blockchain_site: [data.explorer_url].filter(Boolean),
      chat_url: [data.telegram].filter(Boolean),
      twitter_screen_name: data.twitter || null,
      coingecko_id: null,
      coin_id: data.mint || null,
      official_forum_url: null,
      announcement_url: null
    };

    console.log('Mapped data:', JSON.stringify(mappedData, null, 2));
    return mappedData;

  } catch (error) {
    console.error('Error fetching from Pump.fun:', error);
    throw error;
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
    
    // Return a more detailed error response
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