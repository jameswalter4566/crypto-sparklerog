import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchPumpFunData(tokenAddress: string) {
  console.log('Fetching data from Pump.fun for token:', tokenAddress);

  try {
    // First try to get existing data from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: existingData, error: dbError } = await supabase
      .from('coins')
      .select('*')
      .eq('id', tokenAddress)
      .single();

    if (existingData) {
      console.log('Found existing data in database:', existingData);
      // If data is less than 5 minutes old, return it
      const lastUpdate = new Date(existingData.updated_at || '');
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      if (lastUpdate > fiveMinutesAgo) {
        console.log('Using cached data from database');
        return existingData;
      }
    }

    // First try the search endpoint
    const searchUrl = `https://frontend-api-v2.pump.fun/coins?searchTerm=${tokenAddress}`;
    console.log('Trying search endpoint:', searchUrl);
    
    const searchResponse = await fetch(searchUrl);
    console.log('Search endpoint response status:', searchResponse.status);
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log('Search API Response:', JSON.stringify(searchData, null, 2));
      
      if (Array.isArray(searchData)) {
        const matchingToken = searchData.find(item => 
          item.mint?.toLowerCase() === tokenAddress.toLowerCase() ||
          item.address?.toLowerCase() === tokenAddress.toLowerCase()
        );
        
        if (matchingToken) {
          console.log('Found matching token in search results:', matchingToken);
          return mapPumpFunData(matchingToken, tokenAddress);
        }
      }
    }

    // If search fails, try direct endpoint with retries
    const maxRetries = 3;
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const directUrl = `https://frontend-api-v2.pump.fun/coins/${tokenAddress}`;
        console.log(`Attempt ${attempt + 1}: Trying direct endpoint:`, directUrl);
        
        const directResponse = await fetch(directUrl);
        console.log('Direct endpoint response status:', directResponse.status);
        
        if (!directResponse.ok) {
          const errorText = await directResponse.text();
          console.error('API error response:', errorText);
          throw new Error(`API error: ${directResponse.status}. Response: ${errorText}`);
        }

        const directData = await directResponse.json();
        console.log('Direct API Response:', JSON.stringify(directData, null, 2));
        
        if (!directData) {
          throw new Error('No data received from API');
        }

        return mapPumpFunData(directData, tokenAddress);
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        lastError = error instanceof Error ? error : new Error('Unknown error occurred');
        
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // If all attempts fail and we have existing data, return it as fallback
    if (existingData) {
      console.log('All API attempts failed, using existing data as fallback');
      return existingData;
    }

    throw lastError || new Error('Failed to fetch data after all attempts');
  } catch (error) {
    console.error('Error in fetchPumpFunData:', error);
    throw error;
  }
}

function mapPumpFunData(data: any, tokenAddress: string) {
  console.log('Mapping data for token:', tokenAddress);
  
  try {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data structure received from API');
    }

    if (!data.name || !data.symbol) {
      console.warn('Missing critical fields in API response:', data);
    }

    const mappedData = {
      id: tokenAddress,
      name: data.name || 'Unknown Token',
      symbol: data.symbol || '???',
      image_url: data.image_uri || data.image || null,
      price: typeof data.price === 'number' && !isNaN(data.price) ? data.price : null,
      change_24h: typeof data.price_change_24h === 'number' && !isNaN(data.price_change_24h) ? data.price_change_24h : null,
      market_cap: typeof data.market_cap === 'number' && !isNaN(data.market_cap) ? data.market_cap : null,
      volume_24h: typeof data.volume_24h === 'number' && !isNaN(data.volume_24h) ? data.volume_24h : null,
      liquidity: typeof data.virtual_sol_reserves === 'number' && !isNaN(data.virtual_sol_reserves) ? data.virtual_sol_reserves : null,
      total_supply: typeof data.total_supply === 'number' && !isNaN(data.total_supply) ? data.total_supply : null,
      circulating_supply: typeof data.circulating_supply === 'number' && !isNaN(data.circulating_supply) ? data.circulating_supply : null,
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