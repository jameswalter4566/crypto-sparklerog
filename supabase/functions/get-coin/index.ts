import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchPumpFunData(tokenAddress: string) {
  console.log('Fetching data from Pump.fun for token:', tokenAddress);

  try {
    // First try the v2 API endpoint
    const v2Url = `https://api.pump.fun/v2/coins/${tokenAddress}`;
    console.log('Attempting to fetch from v2 URL:', v2Url);

    const v2Response = await fetch(v2Url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
    });

    console.log('V2 Response status:', v2Response.status);
    
    // Get the raw response text first
    const responseText = await v2Response.text();
    console.log('Raw response text:', responseText);

    // If we got a response, try to parse it
    let tokenData;
    try {
      const data = JSON.parse(responseText);
      tokenData = data;
      console.log('Successfully parsed JSON data:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }

    if (!tokenData) {
      throw new Error('No token data found in response');
    }

    // Map the data to our schema
    const mappedData = {
      id: tokenAddress,
      name: tokenData.name || 'Unknown Token',
      symbol: tokenData.symbol || '???',
      price: tokenData.price || tokenData.market_cap || null,
      market_cap: tokenData.market_cap || null,
      volume_24h: tokenData.volume_24h || null,
      total_supply: tokenData.total_supply || null,
      image_url: tokenData.image_url || tokenData.image_uri || null,
      solana_addr: tokenAddress,
      description: tokenData.description || null,
      decimals: tokenData.decimals || null,
      updated_at: new Date().toISOString(),
      liquidity: tokenData.liquidity || tokenData.virtual_sol_reserves || null,
      change_24h: tokenData.price_change_24h || null,
      circulating_supply: tokenData.circulating_supply || null,
      non_circulating_supply: tokenData.non_circulating_supply || null,
      historic_data: null,
      homepage: tokenData.website || null,
      blockchain_site: Array.isArray(tokenData.metadata_uri) ? tokenData.metadata_uri : tokenData.metadata_uri ? [tokenData.metadata_uri] : null,
      chat_url: Array.isArray(tokenData.telegram) ? tokenData.telegram : tokenData.telegram ? [tokenData.telegram] : null,
      announcement_url: null,
      twitter_screen_name: tokenData.twitter || null,
    };

    console.log('Mapped data:', JSON.stringify(mappedData, null, 2));
    return mappedData;

  } catch (error) {
    console.error('Error fetching from Pump.fun:', error);
    throw new Error(`Failed to fetch data from Pump.fun: ${error.message}`);
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

    const pumpData = await fetchPumpFunData(tokenAddress);
    console.log('Processed Pump.fun data:', pumpData);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: upsertError } = await supabase
      .from('coins')
      .upsert(pumpData);

    if (upsertError) {
      console.error('Error upserting data to Supabase:', upsertError);
      throw upsertError;
    }

    return new Response(
      JSON.stringify(pumpData),
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