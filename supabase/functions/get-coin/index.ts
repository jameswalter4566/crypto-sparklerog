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
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const responseText = await response.text();
    console.log('Raw response text:', responseText);

    if (!responseText) {
      throw new Error('Empty response from API');
    }

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
      name: tokenData.name || null,
      symbol: tokenData.symbol || null,
      price: typeof tokenData.price === 'number' ? tokenData.price : null,
      market_cap: typeof tokenData.marketCap === 'number' ? tokenData.marketCap : null,
      volume_24h: typeof tokenData.volume24h === 'number' ? tokenData.volume24h : null,
      total_supply: typeof tokenData.totalSupply === 'number' ? tokenData.totalSupply : null,
      image_url: tokenData.image || null,
      solana_addr: tokenAddress,
      description: tokenData.description || null,
      decimals: typeof tokenData.decimals === 'number' ? tokenData.decimals : null,
      updated_at: new Date().toISOString(),
      liquidity: typeof tokenData.liquidity === 'number' ? tokenData.liquidity : null,
      change_24h: typeof tokenData.priceChange24h === 'number' ? tokenData.priceChange24h : null,
      circulating_supply: typeof tokenData.circulatingSupply === 'number' ? tokenData.circulatingSupply : null,
      non_circulating_supply: typeof tokenData.nonCirculatingSupply === 'number' ? tokenData.nonCirculatingSupply : null,
      historic_data: Array.isArray(tokenData.historicData) ? tokenData.historicData : null,
      homepage: tokenData.website || null,
      blockchain_site: Array.isArray(tokenData.blockchainSites) ? tokenData.blockchainSites : null,
      chat_url: Array.isArray(tokenData.chatUrls) ? tokenData.chatUrls : null,
      announcement_url: Array.isArray(tokenData.announcementUrls) ? tokenData.announcementUrls : null,
      twitter_screen_name: tokenData.twitter || null,
    };

    console.log('Mapped data:', JSON.stringify(mappedData, null, 2));
    return mappedData;

  } catch (error) {
    console.error('Error fetching from Pump.fun:', error);
    throw new Error(`Failed to fetch data: ${error.message}`);
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

    // Only upsert if we have valid data
    if (pumpData.name && pumpData.symbol) {
      const { error: upsertError } = await supabase
        .from('coins')
        .upsert(pumpData);

      if (upsertError) {
        console.error('Error upserting data to Supabase:', upsertError);
        throw upsertError;
      }
    } else {
      console.error('Invalid token data - missing required fields:', pumpData);
      throw new Error('Invalid token data - missing required fields');
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