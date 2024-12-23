import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchPumpFunData(tokenAddress: string) {
  console.log('Fetching data from Pump.fun for token:', tokenAddress);
  
  try {
    const response = await fetch(`https://frontend-api.pump.fun/coins/${tokenAddress}`, {
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

    const data = await response.json();
    console.log('Raw Pump.fun response:', data);
    
    if (!data || !data.name) {
      throw new Error('Invalid data received from Pump.fun');
    }

    return {
      id: tokenAddress,
      name: data.name,
      symbol: data.symbol || 'UNKNOWN',
      price: data.price || null,
      market_cap: data.marketCap || null,
      volume_24h: data.volume24h || null,
      total_supply: data.totalSupply || null,
      image_url: data.image || null,
      solana_addr: tokenAddress,
      description: data.description || null,
      decimals: data.decimals || null,
      updated_at: new Date().toISOString(),
      liquidity: data.liquidity || null,
      change_24h: data.priceChange24h || null,
      circulating_supply: data.circulatingSupply || null,
      non_circulating_supply: data.nonCirculatingSupply || null,
      historic_data: data.historicData || null,
      homepage: data.homepage || null,
      blockchain_site: data.blockchainSite || null,
      chat_url: data.chatUrl || null,
      announcement_url: data.announcementUrl || null,
      twitter_screen_name: data.twitterScreenName || null,
    };
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
    const id = url.searchParams.get('id');

    if (!id) {
      throw new Error('Token ID is required');
    }

    console.log('Processing request for token:', id);

    // Fetch from Pump.fun
    const pumpData = await fetchPumpFunData(id);
    console.log('Processed Pump.fun data:', pumpData);

    // Update database with new data
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update database with new data
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