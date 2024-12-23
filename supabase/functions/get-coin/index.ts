import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchPumpFunData(tokenAddress: string) {
  console.log('Fetching data from Pump.fun for token:', tokenAddress);

  try {
    const response = await fetch(`https://frontend-api-v2.pump.fun/coins?searchTerm=${tokenAddress}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      console.error('Pump.fun API error:', response.status);
      throw new Error(`Pump.fun API error: ${response.status}`);
    }

    const rawData = await response.json();
    console.log('Raw API response:', rawData);

    const tokenData = rawData.coins?.find((coin: any) => coin.mint === tokenAddress);
    
    if (!tokenData) {
      throw new Error('Token not found in Pump.fun response');
    }

    console.log('Found token data:', tokenData);

    return {
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
      blockchain_site: tokenData.metadata_uri ? [tokenData.metadata_uri] : null,
      chat_url: tokenData.telegram ? [tokenData.telegram] : null,
      announcement_url: null,
      twitter_screen_name: tokenData.twitter || null,
    };
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

    const pumpData = await fetchPumpFunData(tokenAddress);
    console.log('Processed Pump.fun data:', pumpData);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from('coins')
      .upsert(pumpData);

    if (updateError) {
      console.error('Error updating coin data:', updateError);
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