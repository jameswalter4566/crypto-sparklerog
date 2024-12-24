import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchPumpFunData(tokenAddress: string) {
  console.log('Fetching data from Pump.fun for token:', tokenAddress);

  const url = `https://frontend-api-v2.pump.fun/coins/${tokenAddress}`;
  console.log('Fetching from URL:', url);

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API error: ${response.status}. Response: ${errorText}`);
    }

    const rawData = await response.json();
    console.log('Raw Pump.fun API Response:', JSON.stringify(rawData, null, 2));

    // Enhanced mapping with fallbacks and type checking
    const mappedData = {
      id: tokenAddress,
      name: rawData.name || 'Unknown Token',
      symbol: rawData.symbol || '???',
      image_url: rawData.image_uri || rawData.image || null,
      price: typeof rawData.price === 'number' ? rawData.price : null,
      change_24h: typeof rawData.price_change_24h === 'number' ? rawData.price_change_24h : null,
      market_cap: typeof rawData.market_cap === 'number' ? rawData.market_cap : null,
      volume_24h: typeof rawData.volume_24h === 'number' ? rawData.volume_24h : null,
      liquidity: typeof rawData.virtual_sol_reserves === 'number' ? rawData.virtual_sol_reserves : null,
      total_supply: typeof rawData.total_supply === 'number' ? rawData.total_supply : null,
      circulating_supply: typeof rawData.circulating_supply === 'number' ? rawData.circulating_supply : null,
      non_circulating_supply: typeof rawData.non_circulating_supply === 'number' ? rawData.non_circulating_supply : null,
      updated_at: new Date().toISOString(),
      solana_addr: tokenAddress,
      description: rawData.description || null,
      decimals: typeof rawData.decimals === 'number' ? rawData.decimals : null,
      historic_data: Array.isArray(rawData.price_history) ? rawData.price_history : null,
      homepage: rawData.website || null,
      blockchain_site: [rawData.explorer_url].filter(Boolean),
      chat_url: [rawData.telegram].filter(Boolean),
      twitter_screen_name: rawData.twitter || null,
      coingecko_id: null,
      coin_id: rawData.mint || null,
      official_forum_url: null,
      announcement_url: null
    };

    console.log('Mapped data:', JSON.stringify(mappedData, null, 2));
    return mappedData;

  } catch (error) {
    console.error('Error fetching from Pump.fun:', error);
    throw new Error(`Failed to fetch data from Pump.fun: ${error.message}`);
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

    console.log('Processing request for token:', tokenAddress);

    const coinData = await fetchPumpFunData(tokenAddress);
    
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
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});