import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchPumpFunData(tokenAddress: string) {
  console.log('Fetching data from Pump.fun for token:', tokenAddress);

  try {
    // Log the full URL we're fetching from
    const url = `https://frontend-api-v2.pump.fun/coins?searchTerm=${tokenAddress}`;
    console.log('Fetching from URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
    });

    // Log the response status and headers
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('Pump.fun API error:', response.status);
      // Try to read the error message from the response
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(`Pump.fun API error: ${response.status}. Response: ${errorText}`);
    }

    // Get the raw text first to inspect it
    const responseText = await response.text();
    console.log('Raw response text:', responseText);

    // Try to parse the JSON
    let rawData;
    try {
      rawData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Invalid JSON received:', responseText);
      throw new Error(`Failed to parse JSON response: ${parseError.message}`);
    }

    console.log('Parsed JSON data:', JSON.stringify(rawData, null, 2));

    if (!rawData || !rawData.coins) {
      throw new Error('Invalid response format: missing coins array');
    }

    const tokenData = rawData.coins.find((coin: any) => coin.mint === tokenAddress);
    
    if (!tokenData) {
      throw new Error('Token not found in Pump.fun response');
    }

    console.log('Found token data:', JSON.stringify(tokenData, null, 2));

    // Map the data to our schema
    const mappedData = {
      id: tokenAddress,
      name: tokenData.name || 'Unknown Token',
      symbol: tokenData.symbol || '???',
      price: tokenData.price || tokenData.market_cap || null,
      market_cap: tokenData.usd_market_cap || null,
      volume_24h: tokenData.volume_24h || null,
      total_supply: tokenData.total_supply || null,
      image_url: tokenData.image_uri || null,
      solana_addr: tokenAddress,
      description: tokenData.description || null,
      decimals: tokenData.decimals || null,
      updated_at: new Date().toISOString(),
      liquidity: tokenData.virtual_sol_reserves || null,
      change_24h: tokenData.price_change_24h || null,
      circulating_supply: tokenData.circulating_supply || null,
      non_circulating_supply: tokenData.non_circulating_supply || null,
      historic_data: tokenData.historic_data || null,
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

    console.log('Processing request for token:', tokenAddress);

    const pumpData = await fetchPumpFunData(tokenAddress);
    
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