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

    const response = await fetch(url);
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API error: ${response.status}. Response: ${errorText}`);
    }

    const responseText = await response.text();
    console.log('Raw response text:', responseText);

    let rawData;
    try {
      rawData = JSON.parse(responseText);
      console.log('Parsed data:', JSON.stringify(rawData, null, 2));
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error(`Failed to parse JSON response: ${parseError.message}`);
    }

    if (!rawData || !rawData.data) {
      console.error('Invalid response format:', rawData);
      throw new Error('Invalid response format: missing data');
    }

    const tokenData = rawData.data;
    console.log('Token data:', JSON.stringify(tokenData, null, 2));

    // Map the data to our schema with detailed logging
    const mappedData = {
      id: tokenAddress,
      name: tokenData.name || 'Unknown Token',
      symbol: tokenData.symbol || '???',
      price: tokenData.price || null,
      market_cap: tokenData.marketCap || null,
      volume_24h: tokenData.volume24h || null,
      total_supply: tokenData.totalSupply || null,
      image_url: tokenData.image || null,
      solana_addr: tokenAddress,
      description: tokenData.description || null,
      decimals: tokenData.decimals || null,
      updated_at: new Date().toISOString(),
      liquidity: tokenData.liquidity || null,
      change_24h: tokenData.priceChange24h || null,
      circulating_supply: tokenData.circulatingSupply || null,
      non_circulating_supply: tokenData.nonCirculatingSupply || null,
      historic_data: tokenData.historicData || null,
      homepage: tokenData.website || null,
      blockchain_site: tokenData.blockchainSites || null,
      chat_url: tokenData.chatUrls || null,
      announcement_url: tokenData.announcementUrls || null,
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
    
    // Initialize Supabase client
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