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

    // Validate essential fields
    if (!rawData || typeof rawData !== 'object') {
      console.error('Invalid response format:', rawData);
      throw new Error('Invalid response format: not an object');
    }

    // Map the data to our schema, with careful type checking
    const mappedData = {
      id: tokenAddress,
      name: rawData.name || 'Unknown Token',
      symbol: rawData.symbol || '???',
      price: typeof rawData.price === 'number' ? rawData.price : null,
      market_cap: typeof rawData.marketCap === 'number' ? rawData.marketCap : null,
      volume_24h: typeof rawData.volume24h === 'number' ? rawData.volume24h : null,
      total_supply: typeof rawData.totalSupply === 'number' ? rawData.totalSupply : null,
      image_url: rawData.image || null,
      solana_addr: tokenAddress,
      description: rawData.description || null,
      decimals: typeof rawData.decimals === 'number' ? rawData.decimals : null,
      updated_at: new Date().toISOString(),
      liquidity: typeof rawData.liquidity === 'number' ? rawData.liquidity : null,
      change_24h: typeof rawData.priceChange24h === 'number' ? rawData.priceChange24h : null,
      circulating_supply: typeof rawData.circulatingSupply === 'number' ? rawData.circulatingSupply : null,
      non_circulating_supply: typeof rawData.nonCirculatingSupply === 'number' ? rawData.nonCirculatingSupply : null,
      historic_data: Array.isArray(rawData.historicData) ? rawData.historicData : null,
      homepage: rawData.website || null,
      blockchain_site: Array.isArray(rawData.blockchainSites) ? rawData.blockchainSites : null,
      chat_url: Array.isArray(rawData.chatUrls) ? rawData.chatUrls : null,
      announcement_url: Array.isArray(rawData.announcementUrls) ? rawData.announcementUrls : null,
      twitter_screen_name: rawData.twitter || null,
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